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
      setError(e.message); 
    } finally { 
      setLoading(false); 
    } 
  } 
 
  return ( 
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5" }}> 
      <div style={{ background: "white", borderRadius: 16, padding: 40, width: 360, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}> 
        <h1 style={{ textAlign: "center", color: "#7C3AED", fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Zighub</h1> 
        <p style={{ textAlign: "center", color: "#888", marginBottom: 28, fontSize: 14 }}>Fale em paz.</p> 
 
        <button onClick={handleGoogle} disabled={loading} style={{ width: "100%", padding: "10px 0", border: "1px solid #ddd", borderRadius: 8, background: "white", cursor: "pointer", marginBottom: 16, fontSize: 14 }}> 
          Entrar com Google 
        </button> 
 
        <div style={{ textAlign: "center", color: "#aaa", marginBottom: 16, fontSize: 13 }}>ou</div> 
 
        <input 
          type="email" 
          placeholder="seu@email.com" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, marginBottom: 10, fontSize: 14, boxSizing: "border-box" }} 
        /> 
        <input 
          type="password" 
          placeholder="••••••••" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, marginBottom: 16, fontSize: 14, boxSizing: "border-box" }} 
        /> 
 
        {error && <p style={{ color: "red", fontSize: 12, marginBottom: 12 }}>{error}</p>} 
 
        <button onClick={handleEmail} disabled={loading} style={{ width: "100%", padding: "12px 0", background: "#7C3AED", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 15, marginBottom: 16 }}> 
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"} 
        </button> 
 
        <p style={{ textAlign: "center", fontSize: 13, color: "#666" }}> 
          {mode === "login" ? "Não tem conta? " : "Já tem conta? "} 
          <span onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ color: "#7C3AED", cursor: "pointer", fontWeight: 600 }}> 
            {mode === "login" ? "Criar conta" : "Entrar"} 
          </span> 
        </p> 
      </div> 
    </div> 
  ); 
} 
