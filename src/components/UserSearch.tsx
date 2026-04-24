"use client"; 
import { useState, useEffect } from "react"; 
import { doc, getDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase"; 
import { getOrCreateConversation } from "@/lib/firestore"; 
import { useAuthContext } from "@/hooks/useAuthContext"; 
 
interface Props { 
  onClose: () => void; 
  onSelectConv: (convId: string) => void; 
} 
 
export default function UserSearch({ onClose, onSelectConv }: Props) { 
  const { user } = useAuthContext(); 
  const [query, setQuery] = useState(""); 
  const [result, setResult] = useState<any>(null); 
  const [searching, setSearching] = useState(false); 
  const [notFound, setNotFound] = useState(false); 
 
  useEffect(() => { 
    if (!query || query.length < 2) { 
      setResult(null); 
      setNotFound(false); 
      return; 
    } 
    const timer = setTimeout(async () => { 
      setSearching(true); 
      setNotFound(false); 
      try { 
        const snap = await getDoc(doc(db, "usernames", query.toLowerCase().replace("@", ""))); 
        if (snap.exists()) { 
          const userSnap = await getDoc(doc(db, "users", snap.data().uid)); 
          if (userSnap.exists()) { 
            setResult({ uid: snap.data().uid, ...userSnap.data() }); 
          } else { 
            setResult(null); 
            setNotFound(true); 
          } 
        } else { 
          setResult(null); 
          setNotFound(true); 
        } 
      } finally { 
        setSearching(false); 
      } 
    }, 500); 
    return () => clearTimeout(timer); 
  }, [query]); 
 
  return ( 
    <div style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}> 
      <input 
        type="text" 
        placeholder="Buscar @username..." 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, outline: "none", boxSizing: "border-box" }} 
      /> 
      {searching && <p style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>Buscando...</p>} 
      {notFound && !searching && <p style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>Usuário não encontrado</p>} 
      {result && !searching && ( 
        <div 
          onClick={async () => { 
            if (!user) return; 
            const conv = await getOrCreateConversation(user.uid, result.uid); 
            onSelectConv(conv.convId as string); 
            setQuery(""); 
            setResult(null); 
            onClose(); 
          }} 
          style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, padding: "8px", borderRadius: 8, cursor: "pointer", background: "#f9f5ff" }} 
        > 
          <img src={result.photoURL || "https://www.gravatar.com/avatar?d=mp"} style={{ width: 36, height: 36, borderRadius: "50%" }} alt="" /> 
          <div> 
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{result.displayName}</p> 
            <p style={{ fontSize: 12, color: "#888", margin: 0 }}>@{result.username}</p> 
          </div> 
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#7C3AED", fontWeight: 600 }}>Conversar</span> 
        </div> 
      )} 
    </div> 
  ); 
} 
