"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Search, LogOut, MessageSquare } from "lucide-react";
import UserSearch from "./UserSearch";
import ConversationList from "./ConversationList";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getOrCreateConversation } from "@/lib/firestore";

interface SidebarProps {
  activeConvId: string | null;
  onSelectConv: (id: string) => void;
}

export default function Sidebar({ activeConvId, onSelectConv }: SidebarProps) {
  const { user, userData, logout } = useAuthContext();
  const [isSearching, setIsSearching] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convs = await Promise.all(
        snapshot.docs.map(async (d) => {
          const data = d.data();
          const otherUid = data.participants.find((uid: string) => uid !== user.uid);
          
          const userSnap = await getDoc(doc(db, "users", otherUid));
          const otherUserData = userSnap.exists() ? userSnap.data() : null;

          return {
            id: d.id,
            ...data,
            otherUser: otherUserData
          };
        })
      );
      setConversations(convs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSelectUser = async (selectedUser: any) => { 
    if (!user) return;
    try {
      const conv = await getOrCreateConversation(user.uid, selectedUser.uid); 
      onSelectConv(conv.convId);
      setIsSearching(false);
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
  };

  return (
    <div className="flex w-1/3 min-w-[300px] max-w-[450px] flex-col border-r border-gray-300 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#f0f2f5] px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={userData?.photoURL || "https://www.gravatar.com/avatar?d=mp"}
            alt="Profile"
            className="h-10 w-10 rounded-full"
          />
          <span className="font-semibold text-gray-700">@{userData?.username}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <button onClick={() => setIsSearching(!isSearching)} title="Nova conversa">
            <MessageSquare className="h-6 w-6" />
          </button>
          <button onClick={() => logout()} title="Sair">
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2">
        <div className="flex items-center gap-2 rounded-lg bg-[#f0f2f5] px-3 py-1.5">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar ou começar uma nova conversa"
            className="w-full bg-transparent text-sm focus:outline-none"
            onFocus={() => setIsSearching(true)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <UserSearch 
            onSelectUser={(u: any) => handleSelectUser(u)} 
          />
        ) : (
          <ConversationList 
            conversations={conversations}
            selectedId={activeConvId} 
            onSelect={(id: string) => onSelectConv(id)}
          />
        )}
      </div>
    </div>
  );
}
