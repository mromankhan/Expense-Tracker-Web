"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/firebase/firebaseConfig";
import { MessageSquare, X, Send, Loader2, Bot, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const formatted = msg.content.split("\n").map((line, i, arr) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: bold }} />
        {i < arr.length - 1 && <br />}
      </span>
    );
  });

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm leading-relaxed shadow-sm">
          {formatted}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2">
      <div className="size-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
        <Bot size={13} className="text-primary" />
      </div>
      <div className="max-w-[78%] bg-muted text-foreground rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-relaxed">
        {formatted}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2">
      <div className="size-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
        <Bot size={13} className="text-primary" />
      </div>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce" />
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
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || !user) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-8),
          token,
        }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || "Something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (!isOpen) setHasNewMessage(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
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
    <div className="fixed bottom-12 right-4 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="w-80 sm:w-96 bg-card/98 backdrop-blur-xl border border-border rounded-3xl shadow-2xl shadow-black/15 dark:shadow-black/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-purple-700 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="size-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles size={16} className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm text-primary-foreground leading-tight">
                  Expense Assistant
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`size-1.5 rounded-full ${
                      loading ? "bg-yellow-300 animate-pulse" : "bg-green-400"
                    }`}
                  />
                  <p className="text-xs text-primary-foreground/75">
                    {loading ? "Thinking…" : "Online"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="size-8 rounded-xl bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors duration-150"
            >
              <X size={16} className="text-primary-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 scroll-smooth">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-border shrink-0">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                className="flex-1 h-10 rounded-xl text-sm"
                disabled={loading}
                maxLength={500}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                size="sm"
                className="size-10 p-0 rounded-xl shrink-0"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close expense assistant" : "Open expense assistant"}
        className="relative size-14 bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <X size={22} className="text-primary-foreground" />
        ) : (
          <MessageSquare size={22} className="text-primary-foreground" />
        )}
        {hasNewMessage && !isOpen && (
          <span className="absolute -top-1 -right-1 size-3.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
        )}
      </button>
    </div>
  );
}
