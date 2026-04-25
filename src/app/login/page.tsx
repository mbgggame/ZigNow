"use client"; 
import { useState } from "react"; 
import { useRouter } from "next/navigation"; 
import { auth, googleProvider, db } from "@/lib/firebase"; 
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
} from "firebase/auth"; 
import { doc, getDoc } from "firebase/firestore"; 
 
export default function LoginPage() { 
  const router = useRouter(); 
  const [mode, setMode] = useState<"login" | "register">("login"); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false); 
 
  async function handleRedirect(uid: string) { 
    const snap = await getDoc(doc(db, "users", uid)); 
    if (snap.exists() && snap.data().username) { 
      router.push("/chat"); 
    } else { 
      router.push("/setup-username"); 
    } 
  } 
 
  async function handleGoogle() { 
    setLoading(true); 
    setError(""); 
    try { 
      const result = await signInWithPopup(auth, googleProvider); 
      await handleRedirect(result.user.uid); 
    } catch (e: any) { 
      const attempts = parseInt(localStorage.getItem("zighub_failed_auth") || "0") + 1; 
      localStorage.setItem("zighub_failed_auth", String(attempts)); 
      setError(e.message); 
    } finally { 
      setLoading(false); 
    } 
  } 
 
  async function handleEmail() { 
    setLoading(true); 
    setError(""); 
    try { 
      let result; 
      if (mode === "login") { 
        result = await signInWithEmailAndPassword(auth, email, password); 
      } else { 
        result = await createUserWithEmailAndPassword(auth, email, password); 
      } 
      await handleRedirect(result.user.uid); 
    } catch (e: any) { 
      const attempts = parseInt(localStorage.getItem("zighub_failed_auth") || "0") + 1; 
      localStorage.setItem("zighub_failed_auth", String(attempts)); 
      setError(e.message); 
    } finally { 
      setLoading(false); 
    } 
  } 
 
  return ( 
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#2D0050" }}> 
      <div style={{ background: "white", borderRadius: 20, padding: 40, width: 360, boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}> 
        <h1 style={{ textAlign: "center", color: "#4A0080", fontSize: 42, fontWeight: 800, marginBottom: 4 }}>Zighub</h1> 
        <p style={{ textAlign: "center", color: "#6B00B3", marginBottom: 28, fontSize: 16, fontWeight: 500 }}>Fale em paz.</p> 
 
        <button  
          onClick={handleGoogle}  
          disabled={loading}  
          style={{  
            width: "100%",  
            padding: "12px 0",  
            border: "2px solid #4A0080",  
            borderRadius: 16,  
            background: "white",  
            cursor: "pointer",  
            marginBottom: 16,  
            fontSize: 14, 
            fontWeight: 600, 
            color: "#4A0080", 
            transition: "all 0.2s ease" 
          }} 
          onMouseOver={(e) => e.currentTarget.style.background = "#F0E6FF"} 
          onMouseOut={(e) => e.currentTarget.style.background = "white"} 
        > 
          Entrar com Google 
        </button> 
 
        <div style={{ textAlign: "center", color: "#aaa", marginBottom: 16, fontSize: 13 }}>ou</div> 
 
        <input 
          type="email" 
          placeholder="seu@email.com" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          style={{ width: "100%", padding: "12px 16px", border: "2px solid #9B30FF", borderRadius: 16, marginBottom: 12, fontSize: 14, boxSizing: "border-box", outline: "none", transition: "all 0.2s ease" }} 
          onFocus={(e) => e.currentTarget.style.borderColor = "#4A0080"} 
          onBlur={(e) => e.currentTarget.style.borderColor = "#9B30FF"} 
        /> 
        <input 
          type="password" 
          placeholder="••••••••" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          style={{ width: "100%", padding: "12px 16px", border: "2px solid #9B30FF", borderRadius: 16, marginBottom: 16, fontSize: 14, boxSizing: "border-box", outline: "none", transition: "all 0.2s ease" }} 
          onFocus={(e) => e.currentTarget.style.borderColor = "#4A0080"} 
          onBlur={(e) => e.currentTarget.style.borderColor = "#9B30FF"} 
        /> 
 
        {error && <p style={{ color: "#ff4444", fontSize: 12, marginBottom: 12, textAlign: "center" }}>{error}</p>} 
 
        <button  
          onClick={handleEmail}  
          disabled={loading}  
          style={{  
            width: "100%",  
            padding: "14px 0",  
            background: "#4A0080",  
            color: "white",  
            border: "none",  
            borderRadius: 16,  
            cursor: "pointer",  
            fontWeight: 700,  
            fontSize: 16,  
            marginBottom: 16, 
            transition: "all 0.2s ease" 
          }} 
          onMouseOver={(e) => e.currentTarget.style.background = "#6B00B3"} 
          onMouseOut={(e) => e.currentTarget.style.background = "#4A0080"} 
        > 
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"} 
        </button> 
 
        <p style={{ textAlign: "center", fontSize: 14, color: "#666" }}> 
          {mode === "login" ? "Não tem conta? " : "Já tem conta? "} 
          <span onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ color: "#9B30FF", cursor: "pointer", fontWeight: 700 }}> 
            {mode === "login" ? "Criar conta" : "Entrar"} 
          </span> 
        </p> 
      </div> 
    </div> 
  ); 
} 
