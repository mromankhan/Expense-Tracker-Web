"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { MessageSquare, X, Send, Loader2, Bot } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm your expense assistant 👋\n\nI can help you:\n• **Add** an expense (e.g. \"Add coffee 150 food\")\n• **View** your expenses (e.g. \"Show my expenses\")\n• **Update** an expense\n• **Delete** an expense\n\nWhat would you like to do?",
};

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  // Render simple markdown-like formatting
  const formatted = msg.content
    .split("\n")
    .map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: bold }} />
          {i < msg.content.split("\n").length - 1 && <br />}
        </span>
      );
    });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center mr-2 mt-1">
          <Bot size={14} className="text-primary-content" />
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-content rounded-br-none"
            : "bg-base-200 text-base-content rounded-bl-none"
        }`}
      >
        {formatted}
      </div>
    </div>
  );
}

export default function ChatAgent() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || !user) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-8),
          userId: user.uid,
        }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || "Something went wrong.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      if (!isOpen) setHasNewMessage(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, user, messages, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-base-100 border border-base-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
          style={{ height: "480px" }}>
          {/* Header */}
          <div className="bg-primary text-primary-content px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-content/20 flex items-center justify-center">
                <Bot size={16} className="text-primary-content" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Expense Assistant</p>
                <p className="text-xs text-primary-content/70 leading-tight">
                  {loading ? "Thinking..." : "Online"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-xs btn-circle text-primary-content hover:bg-primary-content/20"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center mr-2">
                  <Bot size={14} className="text-primary-content" />
                </div>
                <div className="bg-base-200 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-base-300 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="input input-bordered input-sm flex-1 text-sm"
                disabled={loading}
                maxLength={500}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="btn btn-primary btn-sm btn-square"
                title="Send"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn btn-primary btn-circle w-14 h-14 shadow-lg relative"
        title="Expense Assistant"
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <>
            <MessageSquare size={22} />
            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-error rounded-full border-2 border-base-100" />
            )}
          </>
        )}
      </button>
    </div>
  );
}
