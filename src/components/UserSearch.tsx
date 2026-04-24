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
    <div style={{ padding: "12px", borderBottom: "1px solid #3D0070", background: "#2D0050" }}> 
      <input 
        type="text" 
        placeholder="Buscar @username..." 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
        className="placeholder:text-white/50"
        style={{  
          width: "100%",  
          padding: "10px 12px",  
          borderRadius: 12,  
          border: "2px solid #6B00B3",  
          fontSize: 13,  
          outline: "none",  
          boxSizing: "border-box", 
          background: "#3D0070", 
          color: "white" 
        }} 
      /> 
      {searching && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>Buscando...</p>} 
      {notFound && !searching && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>Usuário não encontrado</p>} 
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
          style={{  
            display: "flex",  
            alignItems: "center",  
            gap: 10,  
            marginTop: 10,  
            padding: "10px",  
            borderRadius: 12,  
            cursor: "pointer",  
            background: "#3D0070", 
            transition: "all 0.2s ease" 
          }} 
          onMouseOver={(e) => e.currentTarget.style.background = "#4A0080"} 
          onMouseOut={(e) => e.currentTarget.style.background = "#3D0070"} 
        > 
          <img src={result.photoURL || "https://www.gravatar.com/avatar?d=mp"} style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #6B00B3" }} alt="" /> 
          <div style={{ flex: 1, minWidth: 0 }}> 
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "white" }}>{result.displayName}</p> 
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>@{result.username}</p> 
          </div> 
          <span style={{  
            marginLeft: "auto",  
            fontSize: 12,  
            color: "#9B30FF",  
            fontWeight: 700, 
            background: "white", 
            padding: "4px 8px", 
            borderRadius: "8px" 
          }}>Conversar</span> 
        </div> 
      )} 
    </div> 
  ); 
} 
