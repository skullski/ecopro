import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "@/lib/api";

type Msg = { id: string; fromUserId: string; body: string; createdAt: number };

export default function Chat() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  async function load() {
    if (!conversationId) return;
    const res = await apiFetch<{ items: Msg[] }>(`/api/conversations/${conversationId}/messages`);
    setMessages(res.items);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!conversationId || !input.trim()) return;
    const msg = await apiFetch<Msg>(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body: input }),
    });
    setMessages((prev) => [...prev, msg]);
    setInput("");
  }

  return (
    <div className="max-w-3xl mx-auto p-6 h-[80vh] flex flex-col">
      <div className="text-xl font-semibold mb-3">Chat</div>
      <div ref={listRef} className="flex-1 overflow-auto border rounded p-3 space-y-2 bg-gray-50">
        {messages.map((m) => (
          <div key={m.id} className="max-w-[70%] p-2 rounded bg-white shadow">
            <div className="text-sm text-gray-500">{new Date(m.createdAt).toLocaleTimeString()}</div>
            <div>{m.body}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input className="input input-bordered flex-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
        <button className="btn btn-primary" onClick={send}>Send</button>
      </div>
    </div>
  );
}
