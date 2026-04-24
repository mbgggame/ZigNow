"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { 
  doc, 
  onSnapshot, 
  getDoc, 
  collection, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendMessage, markAsRead } from "@/lib/firestore";
import MessageBubble from "./MessageBubble";
import AudioMessage from "./AudioMessage";
import AudioRecorder from "./AudioRecorder";
import CallButton from "./CallButton";
import CallOverlay from "./CallOverlay";
import { useCall } from "@/hooks/useCall";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { isSameDay, format } from "date-fns";

interface ChatAreaProps {
  convId: string | null;
}

export default function ChatArea({ convId }: ChatAreaProps) {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    state: callState,
    callData,
    token: callToken,
    startCall,
    acceptCall,
    rejectCall,
    endCall
  } = useCall(convId);

  useEffect(() => {
    if (!convId || !user) {
      setMessages([]);
      setOtherUser(null);
      return;
    }

    // Mark as read
    markAsRead(convId, user.uid);

    // Fetch messages
    const q = query(
      collection(db, "conversations", convId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch other user info
    const fetchOtherUser = async () => {
      const convSnap = await getDoc(doc(db, "conversations", convId));
      if (convSnap.exists()) {
        const otherUid = convSnap.data().participants.find((uid: string) => uid !== user.uid);
        const userSnap = await getDoc(doc(db, "users", otherUid));
        if (userSnap.exists()) {
          setOtherUser(userSnap.data());
        }
      }
    };
    fetchOtherUser();

    return () => unsubscribeMessages();
  }, [convId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !convId || !user || loading) return;

    const text = inputText.trim();
    setInputText("");
    setLoading(true);

    try {
      await sendMessage(convId, user.uid, text);
    } catch (err) {
      console.error(err);
      setInputText(text); // Restore text on error
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!convId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F9FAFB] p-8">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4">
          <div className="bg-purple-50 p-6 rounded-full">
            <MessageCircle size={64} className="text-[#7C3AED]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Seu espaço de conversa</h2>
          <p className="text-gray-500 max-w-xs">
            Selecione uma conversa ou busque um @username para começar a falar em paz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] relative">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-100 px-6 flex items-center gap-4 z-10 shrink-0">
        <img
          src={otherUser?.photoURL || "https://www.gravatar.com/avatar?d=mp"}
          alt={otherUser?.displayName}
          className="h-10 w-10 rounded-full object-cover border border-gray-100"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 truncate leading-tight">
            {otherUser?.displayName || "Carregando..."}
          </h3>
          <p className="text-xs text-gray-500 font-medium">@{otherUser?.username}</p>
        </div>
        <CallButton 
          onClick={startCall} 
          disabled={callState !== "idle"} 
        />
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-1"
      >
        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const showDate = !prevMsg || !msg.createdAt || !prevMsg.createdAt || 
            !isSameDay(msg.createdAt.toDate(), prevMsg.createdAt.toDate());

          if (msg.type === "audio") {
            return (
              <div key={msg.id} className={`flex flex-col space-y-2 ${msg.senderId === user?.uid ? "items-end" : "items-start"}`}>
                {showDate && msg.createdAt && (
                  <div className="flex justify-center w-full my-4">
                    <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 shadow-sm border border-gray-100 uppercase tracking-wider">
                      {isSameDay(msg.createdAt.toDate(), new Date()) ? "Hoje" : isSameDay(msg.createdAt.toDate(), new Date(Date.now() - 86400000)) ? "Ontem" : format(msg.createdAt.toDate(), "dd/MM/yyyy")}
                    </span>
                  </div>
                )}
                <AudioMessage
                  audioUrl={msg.audioUrl}
                  duration={msg.duration}
                  isOwn={msg.senderId === user?.uid}
                />
              </div>
            );
          }

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === user?.uid}
              showDate={showDate}
            />
          );
        })}
      </div>

      <CallOverlay
        state={callState}
        callData={callData}
        token={callToken}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
      />

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 z-10">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          {convId && <AudioRecorder convId={convId} senderId={user?.uid || ""} />} 
          <form onSubmit={handleSendMessage} className="flex-1 flex items-end gap-3">
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 px-4 py-2.5 focus-within:bg-white focus-within:border-[#7C3AED] focus-within:ring-1 focus-within:ring-[#7C3AED] transition-all">
            <textarea
              placeholder="Digite uma mensagem..."
              className="w-full bg-transparent resize-none max-h-32 focus:outline-none text-sm py-1"
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="bg-[#7C3AED] text-white p-3 rounded-2xl hover:bg-[#6D28D9] active:scale-95 transition-all shadow-md shadow-purple-100 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}
