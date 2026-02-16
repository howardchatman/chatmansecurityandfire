"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

const O = "#EA580C";
const OL = "#FFF7ED";

interface ProposalData {
  id: string;
  client_name: string;
  proposal_type: string;
  total: number;
  status: string;
  created_at: string;
  proposal_data: {
    facility?: { address?: string; sqft?: string; ahj?: string; occupancy?: string; sprinkler?: string };
    devices?: Array<{ id: string; label: string; qty: number }>;
    categories?: Record<string, number>;
    type_label?: string;
  } | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

type CallStatus = "idle" | "connecting" | "connected" | "error";

export default function ProposalViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id: token } = use(params);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isTalking, setIsTalking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const retellClientRef = useRef<RetellWebClient | null>(null);

  useEffect(() => {
    fetch(`/api/proposal-chat?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setProposal(d.data);
      })
      .catch(() => setError("Unable to load proposal"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || chatLoading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/proposal-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, messages: allMsgs }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Sorry, I couldn't process that." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Please call Howard at (832) 430-1826." }]);
    }
    setChatLoading(false);
  }

  // Retell voice call handlers
  const setupRetellEvents = useCallback((client: RetellWebClient) => {
    client.on("call_started", () => setCallStatus("connected"));
    client.on("call_ended", () => {
      setCallStatus("idle");
      setIsTalking(false);
      retellClientRef.current = null;
    });
    client.on("agent_start_talking", () => setIsTalking(true));
    client.on("agent_stop_talking", () => setIsTalking(false));
    client.on("error", () => {
      setCallStatus("error");
      retellClientRef.current = null;
      setTimeout(() => setCallStatus("idle"), 3000);
    });
  }, []);

  async function startChadCall() {
    setCallStatus("connecting");
    try {
      const res = await fetch("/api/retell/web-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success || !data.data?.access_token) throw new Error("No token");
      const client = new RetellWebClient();
      retellClientRef.current = client;
      setupRetellEvents(client);
      await client.startCall({ accessToken: data.data.access_token });
    } catch {
      setCallStatus("idle");
    }
  }

  function endChadCall() {
    retellClientRef.current?.stopCall();
    setCallStatus("idle");
    setIsTalking(false);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => { retellClientRef.current?.stopCall(); };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${OL}`, borderTopColor: O, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#6B7280", fontSize: 14 }}>Loading your proposal...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Proposal Not Found</h2>
          <p style={{ color: "#6B7280", marginBottom: 24 }}>This link may have expired or is invalid.</p>
          <a href="tel:+18324301826" style={{ display: "inline-block", background: O, color: "#fff", padding: "12px 24px", borderRadius: 8, fontWeight: 600, textDecoration: "none" }}>
            Call (832) 430-1826
          </a>
        </div>
      </div>
    );
  }

  const pd = proposal.proposal_data || {};
  const isVE = proposal.proposal_type === "voice_evac";
  const activeDevices = (pd.devices || []).filter(d => d.qty > 0);
  const totalDevices = activeDevices.reduce((s, d) => s + d.qty, 0);
  const deposit = Math.round((proposal.total || 0) * 0.3);

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `3px solid ${O}`, padding: "16px 20px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: O, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/><path d="M12 22V12M2 7l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: O, fontSize: 16 }}>CHATMAN SECURITY & FIRE</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Fire & Life Safety Compliance</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>
        {/* Proposal Summary Card */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ background: O, padding: "16px 20px", color: "#fff" }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              {isVE ? "Voice Evacuation & Fire Alarm" : "Fire Alarm System"} Proposal
            </h1>
            <p style={{ fontSize: 13, opacity: 0.9, margin: "4px 0 0" }}>Prepared for {proposal.client_name}</p>
          </div>

          <div style={{ padding: 20 }}>
            {pd.facility?.address && (
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
                {pd.facility.address} {pd.facility.sqft ? `| ${parseInt(pd.facility.sqft).toLocaleString()} sq ft` : ""}
              </div>
            )}

            {/* Investment */}
            <div style={{ background: OL, borderRadius: 10, padding: 16, marginBottom: 16, border: `1px solid ${O}30` }}>
              <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Total Project Investment</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: O, margin: "4px 0" }}>${(proposal.total || 0).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>30% Deposit: ${deposit.toLocaleString()} to begin</div>
            </div>

            {/* Devices */}
            {activeDevices.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 8 }}>System Includes ({totalDevices} devices):</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {activeDevices.map(d => (
                    <div key={d.id} style={{ fontSize: 12, color: "#6B7280" }}>
                      <span style={{ color: O, marginRight: 4 }}>&#x2022;</span>{d.qty} {d.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Highlights */}
            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 12, marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 8 }}>Why Chatman?</div>
              {[
                "Consulting fee offset — your assessment fee is credited toward installation",
                "NICET-certified technicians with full insurance & bonding",
                "Complete Fire Marshal coordination (permit, review, inspection)",
                "1-year warranty on all equipment and labor",
              ].map((item, i) => (
                <div key={i} style={{ fontSize: 12, color: "#6B7280", marginBottom: 4, paddingLeft: 12, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "#22C55E" }}>&#x2713;</span>{item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Chat Section */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", marginBottom: 16 }}>
          <button
            onClick={() => { setShowChat(!showChat); if (!showChat && messages.length === 0) { setMessages([{ role: "assistant", content: `Hi! I'm the Chatman proposal assistant. I can answer any questions about your ${isVE ? "voice evacuation and fire alarm" : "fire alarm"} system proposal.\n\nWhat would you like to know? For example:\n- What's included in the price?\n- How long will installation take?\n- What codes does this meet?\n- Tell me about the consulting fee offset` }]); } }}
            style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, border: "none", background: showChat ? OL : "#fff", cursor: "pointer", textAlign: "left" }}
          >
            <div style={{ width: 40, height: 40, background: showChat ? O : OL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={showChat ? "#fff" : O} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>Chat with our AI Assistant</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Ask any questions about your proposal</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto", transform: showChat ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
              <path d="M6 9l6 6 6-6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showChat && (
            <div>
              {/* Chat Messages */}
              <div style={{ height: 320, overflowY: "auto", padding: "12px 20px", background: "#F9FAFB" }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
                    <div style={{
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: msg.role === "user" ? O : "#fff",
                      color: msg.role === "user" ? "#fff" : "#111827",
                      fontSize: 13,
                      lineHeight: 1.5,
                      border: msg.role === "user" ? "none" : "1px solid #E5E7EB",
                      whiteSpace: "pre-wrap",
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
                    <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "#fff", border: "1px solid #E5E7EB", fontSize: 13, color: "#9CA3AF" }}>
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "12px 20px", borderTop: "1px solid #E5E7EB", display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Ask a question..."
                  style={{ flex: 1, padding: "10px 14px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || chatLoading}
                  style={{ background: O, color: "#fff", border: "none", borderRadius: 8, width: 44, cursor: "pointer", opacity: !input.trim() || chatLoading ? 0.5 : 1 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ margin: "auto" }}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12, textAlign: "center" }}>Ready to Move Forward?</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <a
              href="tel:+18324301826"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 12px", background: OL, borderRadius: 10, textDecoration: "none", border: `1px solid ${O}30` }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={O} strokeWidth="2"/></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: O }}>Call Howard</span>
              <span style={{ fontSize: 11, color: "#6B7280" }}>Talk now</span>
            </a>

            <button
              onClick={() => callStatus === "connected" || callStatus === "connecting" ? endChadCall() : startChadCall()}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 12px",
                background: callStatus === "connected" ? "#DCFCE7" : callStatus === "connecting" ? "#FEF3C7" : "#EFF6FF",
                borderRadius: 10,
                border: `1px solid ${callStatus === "connected" ? "#22C55E40" : callStatus === "connecting" ? "#F59E0B40" : "#3B82F620"}`,
                cursor: callStatus === "connecting" ? "wait" : "pointer",
              }}
            >
              {callStatus === "connected" ? (
                <>
                  <div style={{ position: "relative" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="#22C55E" strokeWidth="2"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/></svg>
                    <div style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: "#22C55E", animation: isTalking ? "pulse 1s infinite" : "none" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#22C55E" }}>{isTalking ? "Chad Speaking" : "Listening..."}</span>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>Tap to end</span>
                </>
              ) : callStatus === "connecting" ? (
                <>
                  <div style={{ width: 24, height: 24, border: "3px solid #FEF3C7", borderTopColor: "#F59E0B", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>Connecting...</span>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>Please wait</span>
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="#3B82F6" strokeWidth="2"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#3B82F6" }}>Talk to Chad</span>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>AI voice assistant</span>
                </>
              )}
            </button>
          </div>

          {/* Active Call Banner */}
          {callStatus === "connected" && (
            <div style={{
              background: "#F0FDF4", border: "1px solid #22C55E40", borderRadius: 10, padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>
                {isTalking ? "Chad is speaking..." : "On call with Chad — listening..."}
              </span>
              <button
                onClick={endChadCall}
                style={{ marginLeft: 8, background: "#EF4444", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                End
              </button>
            </div>
          )}

          {callStatus === "error" && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #EF444440", borderRadius: 10, padding: "12px 16px",
              textAlign: "center", marginBottom: 12,
            }}>
              <span style={{ fontSize: 13, color: "#991B1B" }}>Couldn&apos;t connect. </span>
              <a href="tel:+18324301826" style={{ fontSize: 13, color: O, fontWeight: 600, textDecoration: "none" }}>Call (832) 430-1826</a>
            </div>
          )}

          <a
            href="tel:+18324301826"
            style={{ display: "block", background: "#22C55E", color: "#fff", textAlign: "center", padding: "14px 20px", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}
          >
            Approve This Proposal
          </a>
          <p style={{ textAlign: "center", fontSize: 11, color: "#9CA3AF", marginTop: 8 }}>
            Call to confirm and get started — deposit secures your spot
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px 0 40px", color: "#9CA3AF", fontSize: 11 }}>
          <p>Chatman Security & Fire | Houston, TX</p>
          <p style={{ marginTop: 4 }}>
            <a href="https://chatmansecurityandfire.com" style={{ color: O, textDecoration: "none" }}>chatmansecurityandfire.com</a>
            {" | "}
            <a href="tel:+18324301826" style={{ color: O, textDecoration: "none" }}>(832) 430-1826</a>
          </p>
        </div>
      </div>
    </div>
  );
}
