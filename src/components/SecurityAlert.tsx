"use client"; 
import { useState, useEffect } from "react"; 

interface SecurityAlertProps { 
  onDismiss: () => void; 
} 

export default function SecurityAlert({ onDismiss }: SecurityAlertProps) { 
  const [visible, setVisible] = useState(true); 

  useEffect(() => { 
    const interval = setInterval(() => { 
      setVisible(v => !v); 
    }, 300); 
    return () => clearInterval(interval); 
  }, []); 

  return ( 
    <div style={{ 
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
      background: visible ? "#8B0000" : "#FF0000", 
      zIndex: 99999, 
      display: "flex", flexDirection: "column", 
      alignItems: "center", justifyContent: "center", 
      transition: "background 0.1s" 
    }}> 
      <div style={{ fontSize: 120, marginBottom: 20 }}>🖕</div> 
      <h1 style={{ 
        color: "white", fontSize: 32, fontWeight: 900, 
        textAlign: "center", textTransform: "uppercase", 
        letterSpacing: 2, marginBottom: 16, 
        textShadow: "0 0 20px rgba(255,255,255,0.5)" 
      }}> 
        ⚠️ PERIGO! 
      </h1> 
      <h2 style={{ 
        color: "white", fontSize: 20, fontWeight: 700, 
        textAlign: "center", marginBottom: 8 
      }}> 
        Tentativa de invasão no sistema detectada! 
      </h2> 
      <p style={{ 
        color: "rgba(255,255,255,0.8)", fontSize: 14, 
        textAlign: "center", marginBottom: 40, maxWidth: 400 
      }}> 
        Atividade suspeita identificada. Suas conversas são protegidas. 
        O incidente foi registrado. 
      </p> 
      <button 
        onClick={onDismiss} 
        style={{ 
          background: "white", color: "#8B0000", 
          border: "none", padding: "12px 32px", 
          borderRadius: 8, fontSize: 14, fontWeight: 700, 
          cursor: "pointer" 
        }} 
      > 
        Entendi — Fechar alerta 
      </button> 
    </div> 
  ); 
} 
