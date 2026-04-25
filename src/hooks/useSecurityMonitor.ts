"use client"; 
import { useState, useEffect } from "react"; 

export function useSecurityMonitor() { 
  const [threatDetected, setThreatDetected] = useState(false); 

  useEffect(() => { 
    // Detectar DevTools aberto (grampo via inspeção) 
    let devToolsOpen = false; 
    const threshold = 160; 
    
    const checkDevTools = () => { 
      const widthThreshold = window.outerWidth - window.innerWidth > threshold; 
      const heightThreshold = window.outerHeight - window.innerHeight > threshold; 
      if (widthThreshold || heightThreshold) { 
        if (!devToolsOpen) { 
          devToolsOpen = true; 
          // Não alerta no DevTools — apenas monitora tentativas reais 
        } 
      } else { 
        devToolsOpen = false; 
      } 
    }; 

    // Detectar múltiplas tentativas de login falhas (via localStorage) 
    const failedAttempts = parseInt(localStorage.getItem("zighub_failed_auth") || "0"); 
    if (failedAttempts >= 5) { 
      setThreatDetected(true); 
      localStorage.removeItem("zighub_failed_auth"); 
    } 

    // Detectar se está sendo carregado em iframe (clickjacking) 
    if (window.self !== window.top) { 
      setThreatDetected(true); 
    } 

    const interval = setInterval(checkDevTools, 1000); 
    return () => clearInterval(interval); 
  }, []); 

  const triggerAlert = () => setThreatDetected(true); 
  const dismissAlert = () => setThreatDetected(false); 

  return { threatDetected, triggerAlert, dismissAlert }; 
} 
