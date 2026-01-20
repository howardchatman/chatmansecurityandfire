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
  { label: "Get a Quote", action: "quote" },
  { label: "Schedule Service", action: "schedule" },
  { label: "Emergency Help", action: "emergency" },
  { label: "System Status", action: "status" },
];

export default function AIVAChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Hello! I'm AIVA, your AI security assistant. How can I help you today? I can help you get a quote, schedule service, or answer questions about our security solutions.",
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
        // Fallback response
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: "Thank you for your message! Our team will get back to you shortly. For immediate assistance, please call us at 1-800-555-1234.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      }
    } catch {
      // Fallback on error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "I'm having trouble connecting right now. Please try again or call us at 1-800-555-1234 for immediate assistance.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      quote: "I'd like to get a free quote for security services.",
      schedule: "I need to schedule a service appointment.",
      emergency: "I have an emergency and need immediate help!",
      status: "What is the status of my security system?",
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
      text: "Starting voice call... Please wait while I connect you with our support team. You can speak naturally and I'll assist you.",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, callMessage]);
  };

  const handleEndCall = () => {
    setIsOnCall(false);
    const endMessage: Message = {
      id: Date.now().toString(),
      sender: "assistant",
      text: "Call ended. Is there anything else I can help you with?",
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
            className="fixed bottom-6 right-6 z-50 p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-600/30 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-neutral-900 rounded-full animate-pulse" />
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
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-red-700 text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">AIVA Assistant</h3>
                  <p className="text-xs text-red-100">
                    {isOnCall ? "On Call" : "Online • 24/7 Support"}
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
                            ? "bg-red-600"
                            : "bg-neutral-200"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-red-600" />
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
                              ? "bg-red-600 text-white rounded-tr-md"
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
                        <Bot className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-md border border-gray-200">
                        <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
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
                          ? "bg-red-600 hover:bg-red-500 text-white"
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
                        className="w-full px-4 py-2.5 bg-neutral-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        disabled={isOnCall}
                      />
                    </div>
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isLoading || isOnCall}
                      className="p-2.5 bg-red-600 hover:bg-red-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-xl transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Powered by AIVA Connect
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
