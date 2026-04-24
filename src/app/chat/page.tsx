"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import ConversationList from "@/components/ConversationList";
import ChatArea from "@/components/ChatArea";
import UserSearch from "@/components/UserSearch";
import AuthGuard from "@/components/AuthGuard";
import { LogOut, MessageSquarePlus, Search as SearchIcon, X } from "lucide-react";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase"; 
import { usePushNotifications } from "@/hooks/usePushNotifications"; 

export default function ChatPage() {
  const { userData, logout, user } = useAuthContext();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]); 
  
  usePushNotifications(user?.uid);

  useEffect(() => { 
    console.log("useEffect user:", user?.uid, user?.email); 
    if (!user) return; 
    
    const q = query( 
      collection(db, "conversations"), 
      where("participants", "array-contains", user.uid), 
      orderBy("lastMessageAt", "desc") 
    ); 
 
    const unsub = onSnapshot(q, 
      async (snapshot) => { 
        console.log("onSnapshot disparou, docs:", snapshot.docs.length); 
        const convs = await Promise.all( 
          snapshot.docs.map(async (d) => { 
            const data = d.data(); 
            const otherUid = data.participants.find((uid: string) => uid !== user.uid); 
            if (!otherUid) return null; 
            const userSnap = await getDoc(doc(db, "users", otherUid)); 
            return { 
              id: d.id, 
              ...data, 
              otherUser: userSnap.exists() ? userSnap.data() : null 
            }; 
          }) 
        ); 
        setConversations(convs.filter(Boolean)); 
        console.log("Conversas carregadas:", convs.filter(Boolean).length); 
      }, 
      (error) => { 
        console.error("onSnapshot error:", error); 
      } 
    ); 
 
    return () => unsub(); 
  }, [user]);

  return (
    <AuthGuard>
      <div className="flex h-screen w-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
        {/* Sidebar */}
        <div 
          className={`flex flex-col border-r border-gray-100 bg-white transition-all duration-300 ease-in-out ${
            activeConvId ? "hidden md:flex md:w-80 lg:w-96" : "w-full md:w-80 lg:w-96"
          }`}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-50 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={userData?.photoURL || "https://www.gravatar.com/avatar?d=mp"}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-purple-50"
                />
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">@{userData?.username || "usuario"}</p>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsSearching(!isSearching)}
                className={`p-2 rounded-xl transition-all ${isSearching ? 'bg-purple-50 text-[#7C3AED]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                title="Nova conversa"
              >
                <MessageSquarePlus size={22} />
              </button>
              <button 
                onClick={() => logout()}
                className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                title="Sair"
              >
                <LogOut size={22} />
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden relative">
            {isSearching ? (
              <UserSearch 
                onClose={() => setIsSearching(false)} 
                onSelectConv={(id: string) => {
                  setActiveConvId(id);
                  setIsSearching(false);
                }} 
              />
            ) : (
              <div className="flex flex-col h-full">
                {/* Search Conversations Placeholder */}
                <div className="px-4 py-3 shrink-0">
                  <div className="relative group">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Pesquisar conversas..."
                      className="w-full bg-gray-50 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:bg-white transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <ConversationList 
                    conversations={conversations} 
                    activeConvId={activeConvId} 
                    onSelectConv={setActiveConvId} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div 
          className={`flex-1 flex flex-col bg-white transition-all duration-300 ease-in-out ${
            !activeConvId ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConvId && (
            <button 
              onClick={() => setActiveConvId(null)}
              className="md:hidden absolute top-4 left-4 z-20 p-2 bg-white rounded-full shadow-md text-gray-500 active:scale-90 transition-transform"
            >
              <X size={20} />
            </button>
          )}
          <ChatArea convId={activeConvId} />
        </div>
      </div>
    </AuthGuard>
  );
}
