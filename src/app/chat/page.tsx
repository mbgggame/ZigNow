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
import SecurityAlert from "@/components/SecurityAlert"; 
import { useSecurityMonitor } from "@/hooks/useSecurityMonitor"; 

export default function ChatPage() {
  const { userData, logout, user } = useAuthContext();
  const { threatDetected, dismissAlert } = useSecurityMonitor();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]); 
  
  const { permission, requestPermission } = usePushNotifications(user?.uid);

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
 
   useEffect(() => { 
     if (!("serviceWorker" in navigator)) return; 
      
     const handleMessage = (event: MessageEvent) => { 
       if (event.data?.type === "OPEN_CONV" && event.data?.convId) { 
         setActiveConvId(event.data.convId); 
       } 
     }; 
      
     navigator.serviceWorker.addEventListener("message", handleMessage); 
     return () => navigator.serviceWorker.removeEventListener("message", handleMessage); 
   }, []); 
 
   useEffect(() => { 
     if (typeof window === "undefined") return; 
     const params = new URLSearchParams(window.location.search); 
     const convId = params.get("conv"); 
     const callParam = params.get("call"); 
      
     if (convId) { 
       setActiveConvId(convId); 
     } 
      
     if (callParam === "incoming" && convId) { 
       // Pequeno delay para garantir que o componente montou 
       setTimeout(() => { 
         window.dispatchEvent(new CustomEvent("incomingCall", { detail: { convId } })); 
       }, 1000); 
     } 
      
     if (convId || callParam) { 
       // Limpa o parâmetro da URL sem recarregar 
       window.history.replaceState({}, "", "/chat"); 
     } 
   }, []); 
 
   // Prevenir sleep no mobile (Wake Lock API)
  useEffect(() => { 
    let wakeLock: any = null; 
     
    const requestWakeLock = async () => { 
      try { 
        if ("wakeLock" in navigator) { 
          wakeLock = await (navigator as any).wakeLock.request("screen"); 
          console.log("Wake lock ativado"); 
        } 
      } catch (err) { 
        console.log("Wake lock não suportado:", err); 
      } 
    }; 
 
    const handleVisibility = () => { 
      if (document.visibilityState === "visible") { 
        requestWakeLock(); 
      } 
    }; 
 
    requestWakeLock(); 
    document.addEventListener("visibilitychange", handleVisibility); 
     
    return () => { 
      document.removeEventListener("visibilitychange", handleVisibility); 
      wakeLock?.release(); 
    }; 
  }, []); 

  useEffect(() => { 
    const handleVisibility = async () => { 
      if (document.visibilityState === "visible") { 
        // Força reconexão do Firestore 
        console.log("App ativo novamente"); 
      } 
    }; 
    document.addEventListener("visibilitychange", handleVisibility); 
    return () => document.removeEventListener("visibilitychange", handleVisibility); 
  }, []); 

  useEffect(() => { 
    if (!user) return; 
    navigator.mediaDevices.getUserMedia({ audio: true }) 
      .then(stream => stream.getTracks().forEach(t => t.stop())) 
      .catch(() => {}); // silencioso se negar 
  }, [user]); 

  return (
    <AuthGuard>
      <div className="flex h-screen w-screen bg-[#F0E6FF] overflow-hidden font-sans text-gray-900">
        {/* Sidebar */}
        <div 
          className={`flex flex-col border-r border-[#3D0070] bg-[#2D0050] transition-all duration-300 ease-in-out ${
            activeConvId ? "hidden md:flex md:w-80 lg:w-96" : "w-full md:w-80 lg:w-96"
          }`}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#3D0070] shrink-0 bg-[#2D0050]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={userData?.photoURL || "https://www.gravatar.com/avatar?d=mp"}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-[#6B00B3]"
                />
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-[#2D0050] rounded-full"></div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate text-white">@{userData?.username || "usuario"}</p>
                <p className="text-[10px] text-white/70 truncate">{userData?.displayName || ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsSearching(!isSearching)}
                className={`p-2 rounded-xl transition-all ${isSearching ? 'bg-[#3D0070] text-white' : 'text-white hover:bg-[#3D0070]'}`}
                title="Nova conversa"
              >
                <MessageSquarePlus size={22} />
              </button>
              <button 
                onClick={() => logout()}
                className="p-2 rounded-xl text-white hover:bg-[#3D0070] transition-all"
                title="Sair"
              >
                <LogOut size={22} />
              </button>
            </div>
          </div>
 
           {permission === "default" && ( 
             <div 
               onClick={requestPermission} 
               style={{ 
                 background: "#6B00B3", 
                 padding: "10px 16px", 
                 cursor: "pointer", 
                 display: "flex", 
                 alignItems: "center", 
                 gap: 10, 
                 borderBottom: "1px solid #4A0080" 
               }} 
             > 
               <span style={{ fontSize: 20 }}>🔔</span> 
               <div> 
                 <p style={{ color: "white", fontSize: 13, fontWeight: 600, margin: 0 }}> 
                   Ativar notificações 
                 </p> 
                 <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: 0 }}> 
                   Toque para receber alertas de mensagens 
                 </p> 
               </div> 
               <span style={{ color: "white", marginLeft: "auto", opacity: 0.7 }}>›</span> 
             </div> 
           )} 
 
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
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 group-focus-within:text-white transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Pesquisar conversas..."
                      className="w-full bg-[#3D0070] text-white placeholder:text-white/70 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#9B30FF] transition-all"
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
          className={`flex-1 flex flex-col bg-[#F0E6FF] transition-all duration-300 ease-in-out ${
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
        {threatDetected && <SecurityAlert onDismiss={dismissAlert} />}
      </div>
    </AuthGuard>
  );
}
