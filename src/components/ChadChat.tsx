"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  PhoneCall,
  PhoneOff,
  Mic,
} from "lucide-react";
import { RetellWebClient } from "retell-client-js-sdk";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

type CallStatus = "idle" | "connecting" | "connected" | "error";

// Reply button sets matching the Retell conversation flow
const replyButtonSets: { keywords: string[]; buttons: string[] }[] = [
  {
    // Initial greeting / "How can we help?"
    keywords: ["how can i", "how can we", "what's going on", "what can i help", "assist you", "help you with"],
    buttons: ["Failed Inspection", "Schedule Service", "Get a Quote", "Emergency"],
  },
  {
    // "What system failed?" / system type
    keywords: ["what system", "which system", "what type of system", "what kind of system"],
    buttons: ["Fire Alarm", "Sprinkler", "Emergency Lights", "Fire Extinguishers", "Fire Lane / Compliance", "Other"],
  },
  {
    // "What type of property?"
    keywords: ["what type of property", "property type", "what kind of property", "is this a commercial", "residential or commercial"],
    buttons: ["Commercial", "Residential", "Institutional", "Industrial"],
  },
  {
    // "What time works best?" / scheduling
    keywords: ["what time works", "when would you like", "when works best", "schedule", "preferred time", "availability"],
    buttons: ["Today", "This Week", "Next Week"],
  },
  {
    // "What services are you needing?"
    keywords: ["what services", "which service", "what do you need"],
    buttons: ["Fire Alarm", "Sprinkler", "Emergency Lights", "Fire Extinguishers", "Fire Lane Marking", "Monitoring"],
  },
];

function getReplyButtons(assistantText: string): string[] | null {
  const lower = assistantText.toLowerCase();
  for (const set of replyButtonSets) {
    if (set.keywords.some((kw) => lower.includes(kw))) {
      return set.buttons;
    }
  }
  return null;
}

const quickActions = [
  { label: "Failed Inspection", action: "inspection" },
  { label: "Fire Marshal Issue", action: "marshal" },
  { label: "Deadline This Week", action: "urgent" },
  { label: "Schedule Service", action: "service" },
];

export default function ChadChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Chatman Security & Fire. This is Howard's office. You're speaking with Chad, his AI operations assistant. What's going on?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isTalking, setIsTalking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retellClientRef = useRef<RetellWebClient | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/retell/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Fallback response - Chad's intake questions
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: "Got it. I need a few things: property address, nature of the issue, and any deadline you're working against. I'll make sure Howard sees this.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      }
    } catch {
      // Fallback on error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "Connection issue on my end. For urgent matters, call (832) 430-1826 directly — I'll be there too.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      inspection: "I failed an inspection and need help with corrections.",
      marshal: "I have a fire marshal issue that needs to be resolved.",
      urgent: "I have a deadline this week I need to hit.",
      service: "I need to schedule service on my fire safety systems.",
    };
    handleSendMessage(actionMessages[action]);
  };

  // Initialize Retell event handlers
  const setupRetellEvents = useCallback((client: RetellWebClient) => {
    client.on("call_started", () => {
      setCallStatus("connected");
      const callMessage: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: "Connected! Go ahead, I'm listening.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, callMessage]);
    });

    client.on("call_ended", () => {
      setCallStatus("idle");
      setIsTalking(false);
      const endMessage: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: "Call ended. Anything else I can get in front of Howard?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, endMessage]);
      retellClientRef.current = null;
    });

    client.on("agent_start_talking", () => {
      setIsTalking(true);
    });

    client.on("agent_stop_talking", () => {
      setIsTalking(false);
    });

    client.on("error", (error) => {
      console.error("Retell error:", error);
      setCallStatus("error");
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: "Connection issue. Try again or call (832) 430-1826 directly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      retellClientRef.current = null;
    });
  }, []);

  const handleStartCall = async () => {
    setCallStatus("connecting");

    const connectingMessage: Message = {
      id: Date.now().toString(),
      sender: "assistant",
      text: "Connecting you to Chad now. Have your property address and inspection details ready.",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, connectingMessage]);

    try {
      // Get access token from our backend
      const response = await fetch("/api/retell/web-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!data.success || !data.data?.access_token) {
        throw new Error(data.error || "Failed to start call");
      }

      // Initialize Retell client
      const client = new RetellWebClient();
      retellClientRef.current = client;
      setupRetellEvents(client);

      // Start the call
      await client.startCall({
        accessToken: data.data.access_token,
      });

    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus("idle");
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: "Couldn't connect right now. For immediate help, call (832) 430-1826 — I answer there too.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleEndCall = () => {
    if (retellClientRef.current) {
      retellClientRef.current.stopCall();
    }
    setCallStatus("idle");
    setIsTalking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retellClientRef.current) {
        retellClientRef.current.stopCall();
      }
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg shadow-orange-600/30 transition-colors group"
            title="Hey Chad!"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-neutral-900 rounded-full animate-pulse" />
            <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-neutral-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Hey Chad!
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "600px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Hey Chad!</h3>
                  <p className="text-xs text-orange-100">
                    {callStatus === "connecting" ? "Connecting..." :
                     callStatus === "connected" ? (isTalking ? "Chad is speaking..." : "On Call - Listening") :
                     "Howard's AI Ops Assistant"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          message.sender === "user"
                            ? "bg-orange-600"
                            : "bg-neutral-200"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <div
                        className={`max-w-[75%] ${
                          message.sender === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl ${
                            message.sender === "user"
                              ? "bg-orange-600 text-white rounded-tr-md"
                              : "bg-white text-gray-700 rounded-tl-md border border-gray-200"
                          }`}
                        >
                          <div className="text-sm leading-relaxed space-y-1.5">
                            {message.text.split("\n").map((line, i) => {
                              const trimmed = line.trim();
                              if (!trimmed) return null;

                              // Render bold markdown (**text**) as <strong>
                              const renderLine = (text: string) => {
                                const parts = text.split(/(\*\*[^*]+\*\*)/g);
                                return parts.map((part, j) => {
                                  if (part.startsWith("**") && part.endsWith("**")) {
                                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                                  }
                                  return <span key={j}>{part}</span>;
                                });
                              };

                              // List items (- or •)
                              if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
                                return (
                                  <div key={i} className="flex gap-1.5 ml-1">
                                    <span className="text-orange-500 flex-shrink-0">•</span>
                                    <span>{renderLine(trimmed.slice(2))}</span>
                                  </div>
                                );
                              }

                              return <p key={i}>{renderLine(trimmed)}</p>;
                            })}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-md border border-gray-200">
                        <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Buttons - show contextual buttons based on last assistant message */}
                {!isLoading && callStatus === "idle" && (() => {
                  const lastAssistant = [...messages].reverse().find((m) => m.sender === "assistant");
                  if (!lastAssistant) return null;

                  // First message: show initial quick actions
                  if (messages.length <= 2) {
                    return (
                      <div className="px-4 pb-2 bg-neutral-50">
                        <div className="flex flex-wrap gap-2">
                          {quickActions.map((action) => (
                            <button
                              key={action.action}
                              onClick={() => handleQuickAction(action.action)}
                              className="px-3 py-1.5 text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Subsequent messages: show contextual reply buttons
                  const buttons = getReplyButtons(lastAssistant.text);
                  if (!buttons) return null;

                  return (
                    <div className="px-4 pb-2 bg-neutral-50">
                      <div className="flex flex-wrap gap-2">
                        {buttons.map((label) => (
                          <button
                            key={label}
                            onClick={() => handleSendMessage(label)}
                            className="px-3 py-1.5 text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  {/* Voice Call Active Indicator */}
                  {callStatus === "connected" && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isTalking ? "bg-green-500 animate-pulse" : "bg-green-400"}`} />
                      <span className="text-sm text-green-700 font-medium">
                        {isTalking ? "Chad is speaking" : "Listening..."}
                      </span>
                      <Mic className={`w-4 h-4 ${isTalking ? "text-green-600" : "text-green-500 animate-pulse"}`} />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={callStatus === "connected" || callStatus === "connecting" ? handleEndCall : handleStartCall}
                      disabled={callStatus === "connecting"}
                      className={`p-2.5 rounded-xl transition-colors ${
                        callStatus === "connected"
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : callStatus === "connecting"
                          ? "bg-orange-400 text-white cursor-wait"
                          : "bg-neutral-100 hover:bg-orange-100 hover:text-orange-600 text-neutral-500"
                      }`}
                      title={callStatus === "connected" ? "End Call" : callStatus === "connecting" ? "Connecting..." : "Talk to Chad"}
                    >
                      {callStatus === "connected" ? (
                        <PhoneOff className="w-5 h-5" />
                      ) : callStatus === "connecting" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <PhoneCall className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder={callStatus === "connected" ? "On voice call with Chad..." : "Type your message..."}
                        className="w-full px-4 py-2.5 bg-neutral-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-neutral-200"
                        disabled={callStatus !== "idle"}
                      />
                    </div>
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isLoading || callStatus !== "idle"}
                      className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-xl transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {callStatus === "idle" ? "Click the phone to talk to Chad, or type a message." : "Voice call in progress"}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
