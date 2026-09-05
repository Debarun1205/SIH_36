import React, { useState, useRef, useEffect } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const roleLabel = { user: "business", citizen: "citizen", inspector: "inspector", admin: "government" };

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  if (!user) return null; // chatbot only appears once logged in - it has nothing safe to say to an anonymous visitor

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const newHistory = [...messages, { role: "user", content: text }];
    setMessages(newHistory);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/chat", { message: text, history: messages });
      setMessages([...newHistory, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || "The assistant is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-80 h-96 bg-white border border-line rounded-sm shadow-lg flex flex-col mb-3">
          <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">MaanVerify Assistant</p>
              <p className="text-xs text-paper/60 capitalize">{roleLabel[user.role]} view</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-paper/70 hover:text-paper text-lg leading-none">
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-xs text-ink/40 text-center mt-8">
                Ask about your own {user.role === "user" ? "shops, instruments or certificates" : user.role === "citizen" ? "reports" : user.role === "inspector" ? "assignments and availability" : "platform stats"}.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-sm px-3 py-2 max-w-[85%] ${
                  m.role === "user" ? "bg-ink text-paper ml-auto" : "bg-paperdim text-ink"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && <div className="text-xs text-ink/40">Thinking…</div>}
            {error && <div className="text-xs text-danger">{error}</div>}
          </div>

          <form onSubmit={send} className="border-t border-line p-2 flex gap-2">
            <input
              className="field-input flex-1 !py-1.5 text-sm"
              placeholder="Ask a question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn-brass !py-1.5 !px-3" disabled={loading}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-ink text-paper shadow-lg flex items-center justify-center text-2xl hover:bg-inkdeep"
        aria-label="Open assistant"
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}
