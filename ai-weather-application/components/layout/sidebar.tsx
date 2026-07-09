"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAnonymousSession } from "@/hooks/use-anonymous-session";
import { useSearchParams } from "next/navigation";

export function Sidebar() {
  const { sessionId, isReady } = useAnonymousSession();
  const [chats, setChats] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("chatId");

  useEffect(() => {
    if (isReady && sessionId) {
      fetch(`/api/chats?sessionId=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.chats) setChats(data.chats);
        })
        .catch(console.error);
    }
  }, [isReady, sessionId, currentChatId]);

  return (
    <nav className="hidden md:flex h-screen w-[300px] border-r border-white/10 bg-surface-container/60 backdrop-blur-xl flex-col p-stack-lg z-40 shadow-2xl relative">
      <div className="flex items-center gap-stack-sm mb-stack-xl shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
        </div>
        <div>
          <h1 className="font-display-xl text-[24px] leading-none text-primary font-bold tracking-tighter">
            Aether Weather
          </h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">AI Meteorologist</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {/* New Chat Button */}
        <Link href="/?chatId=new" className={`flex items-center gap-stack-md px-4 py-3 mb-4 rounded-lg transition-all duration-300 ease-in-out ${!currentChatId || currentChatId === "new" ? "text-primary font-bold bg-primary-container/20" : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"}`}>
          <span className="material-symbols-outlined">add_comment</span>
          <span className="font-label-md text-label-md">New Chat</span>
        </Link>

        <div className="mb-2 mt-2 px-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Recent Chats</span>
        </div>

        {/* Dynamic Chat History */}
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={`/?chatId=${chat.id}`}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${currentChatId === chat.id ? "bg-white/10 text-on-surface font-bold" : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"}`}
          >
            <span className="material-symbols-outlined text-sm">chat_bubble</span>
            <span className="font-label-md text-label-md truncate">{chat.title || "Weather Inquiry"}</span>
          </Link>
        ))}

        <div className="mt-auto pt-4 flex flex-col gap-1">
          <Link href="#" className="flex items-center gap-stack-md px-4 py-3 text-on-surface-variant hover:text-on-surface transition-colors hover:bg-white/5 rounded-lg">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
