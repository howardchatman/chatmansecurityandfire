"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const quickActions = [
  { label: "Failed Inspection", action: "inspection" },
  { label: "Fire Marshal Issue", action: "marshal" },
  { label: "Deadline This Week", action: "urgent" },
  { label: "Schedule Service", action: "service" },
];

export default function AIVAChat() {
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
  const [isOnCall, setIsOnCall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleStartCall = async () => {
    setIsOnCall(true);
    // In production, this would initialize Retell web call
    // For now, show a message
    const callMessage: Message = {
      id: Date.now().toString(),
      sender: "assistant",
      text: "Connecting you now. Have your property address and inspection details ready — I'll need them.",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, callMessage]);
  };

  const handleEndCall = () => {
    setIsOnCall(false);
    const endMessage: Message = {
      id: Date.now().toString(),
      sender: "assistant",
      text: "Call ended. Anything else I can get in front of Howard?",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, endMessage]);
  };

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
                    {isOnCall ? "On Call" : "Howard's AI Ops Assistant"}
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
                          <p className="text-sm leading-relaxed">
                            {message.text}
                          </p>
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

                {/* Quick Actions */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-2 bg-neutral-50">
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action) => (
                        <button
                          key={action.action}
                          onClick={() => handleQuickAction(action.action)}
                          className="px-3 py-1.5 text-xs bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-full transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={isOnCall ? handleEndCall : handleStartCall}
                      className={`p-2.5 rounded-xl transition-colors ${
                        isOnCall
                          ? "bg-orange-600 hover:bg-orange-500 text-white"
                          : "bg-neutral-100 hover:bg-neutral-200 text-neutral-500"
                      }`}
                      title={isOnCall ? "End Call" : "Start Voice Call"}
                    >
                      {isOnCall ? (
                        <PhoneOff className="w-5 h-5" />
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
                        placeholder="Type your message..."
                        className="w-full px-4 py-2.5 bg-neutral-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        disabled={isOnCall}
                      />
                    </div>
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isLoading || isOnCall}
                      className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-xl transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Chad handles intake so nothing important gets missed.
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
