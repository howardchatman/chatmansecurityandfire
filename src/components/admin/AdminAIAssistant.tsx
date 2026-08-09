"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  Calendar,
  Users,
  ClipboardCheck,
  DollarSign,
  Minimize2,
  Maximize2,
  AlertTriangle,
  Database,
} from "lucide-react";
import AssistantMarkdown from "./AssistantMarkdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  /** Which database tools produced this answer — shown so you can see it looked. */
  tools?: string[];
  isError?: boolean;
}

/** get_leads -> "leads". Just enough to show what it read. */
const toolLabel = (t: string) => t.replace(/^get_/, "").replace(/_/g, " ");

const quickPrompts = [
  { label: "Today's Schedule", prompt: "What do I have scheduled for today?", icon: Calendar },
  { label: "Hot Leads", prompt: "Which leads should I prioritize calling today?", icon: Users },
  { label: "Money", prompt: "What is outstanding and what has been collected?", icon: DollarSign },
  { label: "Inspections", prompt: "Which inspections still need their NFPA 72 report filled out?", icon: ClipboardCheck },
];

export default function AdminAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi Howard. I read your live data — leads, jobs, inspections, invoices, customers, and the crew. Ask me anything about it.\n\nI can't send anything or change records, only look.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      // Surface the real reason when it fails. The old widget replaced every
      // error with "having trouble connecting", which hid a route that had
      // never worked at all.
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.success && data.response ? data.response : data.error || "No response came back.",
          timestamp: new Date(),
          tools: data.tools_used?.length ? [...new Set<string>(data.tools_used)] : undefined,
          isError: !data.success,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Could not reach the assistant: ${
            error instanceof Error ? error.message : "network error"
          }`,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-full shadow-lg shadow-orange-600/30 transition-all hover:scale-105"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">AI Assistant</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-20 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
        isMinimized ? "h-auto" : "h-[600px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Admin Assistant</h3>
            <p className="text-xs text-gray-400">Claude · reads your live data</p>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === "user" ? "bg-orange-600" : "bg-neutral-800"
                  }`}
                >
                  {message.role === "user" ? (
                    <span className="text-white text-xs font-medium">You</span>
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-orange-600 text-white rounded-tr-md"
                        : message.isError
                        ? "bg-red-50 text-red-800 rounded-tl-md border border-red-200"
                        : "bg-white text-gray-700 rounded-tl-md border border-gray-200"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : message.isError ? (
                      <p className="text-sm leading-relaxed flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{message.content}</span>
                      </p>
                    ) : (
                      <AssistantMarkdown content={message.content} />
                    )}
                  </div>
                  {message.tools && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                        <Database className="w-3 h-3" /> read
                      </span>
                      {message.tools.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
                        >
                          {toolLabel(t)}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-gray-400 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-md border border-gray-200">
                  <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleQuickPrompt(item.prompt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-full transition-colors"
                  >
                    <item.icon className="w-3 h-3" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about schedules, leads, tickets..."
                className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
