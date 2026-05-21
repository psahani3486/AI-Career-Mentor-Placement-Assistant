"use client";

import { useState, useEffect, useRef } from "react";
import ChatBubble from "../../components/ChatBubble";
import { api } from "@/lib/api";

const quickPrompts = [
  "Review my tech stacks & recommend career paths",
  "How should I prepare for a System Design round?",
  "What is the STAR method for behavioral questions?",
  "Recommend books for advanced Python architecture",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Hello! I am your AI career mentor. Tell me about your dream position or share your current skills, and I'll help you prepare a stellar roadmap!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const h = await api.getChatHistory();
        setHistory(h);
        if (h.length > 0) {
          // Default to latest session
          setSessionId(h[0].id);
          setMessages(h[0].messages);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    // Scroll to bottom on new message
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    // 1. Add user message locally
    const userMsg = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      // 2. Post to API
      const res = await api.sendChatMessage(text, sessionId);
      
      // Update session if it's new
      if (!sessionId && res.session_id) {
        setSessionId(res.session_id);
        const updatedHistory = await api.getChatHistory();
        setHistory(updatedHistory);
      }

      // Add assistant response locally
      const assistantMsg = {
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error communicating: ${err.message || "Please check backend connection."}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = (session: any) => {
    setSessionId(session.id);
    setMessages(session.messages || []);
  };

  const handleStartNewSession = () => {
    setSessionId(undefined);
    setMessages([
      {
        role: "assistant",
        content: "Hello! Starting a new mentoring session. What's on your mind today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Career <span className="gradient-text">Mentor Chat</span>
          </h1>
          <p className="text-sm text-muted mt-1.5">
            Interactive mentoring dashboard targeting placements, portfolio creation, and tech preparation.
          </p>
        </div>
        <button
          onClick={handleStartNewSession}
          className="px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold hover:bg-primary/20 text-white transition-premium"
        >
          ➕ New Chat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sessions Sidebar (Left Column) */}
        <div className="lg:col-span-1 glass rounded-2xl p-5 border-white/5 space-y-4 max-h-[500px] overflow-y-auto">
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
            Mentoring Sessions
          </h2>
          {history.length === 0 ? (
            <p className="text-xs text-muted">No past sessions saved.</p>
          ) : (
            <div className="space-y-2">
              {history.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSession(s)}
                  className={`
                    w-full p-3 rounded-xl border text-left text-xs transition-premium truncate block font-medium
                    ${sessionId === s.id
                      ? "bg-primary/10 border-primary/20 text-white"
                      : "bg-white/[0.02] border-white/5 text-muted hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >
                  {s.title || "Untitled Session"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Main Window (Right Column) */}
        <div className="lg:col-span-3 flex flex-col glass rounded-3xl border-white/5 overflow-hidden h-[600px]">
          
          {/* Scrollable Message Box */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin">
            {messages.map((m, index) => (
              <ChatBubble
                key={index}
                id={`chat-bubble-${index}`}
                isUser={m.role === "user"}
                message={m.content}
                timestamp={m.timestamp}
              />
            ))}
            
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted font-medium py-2">
                <span className="w-4 h-4 border-2 border-muted/20 border-t-muted rounded-full animate-spin" />
                Mentor is writing...
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 2 && (
            <div className="px-6 py-3 border-t border-white/5 bg-[#0a0a0f]/40 flex flex-wrap gap-2.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 text-[10px] font-semibold text-muted hover:text-white transition-premium"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="p-4 border-t border-white/5 bg-[#08080c]/60 flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
              placeholder="Ask your mentor anything about technical prep..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={loading || !inputValue.trim()}
              className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-primary/40 text-white font-bold text-sm shadow-lg transition-premium group hover:scale-[1.02] active:scale-[0.98]"
            >
              Send 🚀
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
