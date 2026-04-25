"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { startCallRecord, updateCallStatus } from "@/lib/firestore";

function createRingtone() { 
  if (typeof window === "undefined") return null; 
  const ctx = new AudioContext(); 
  
  const playRing = () => { 
    const osc1 = ctx.createOscillator(); 
    const osc2 = ctx.createOscillator(); 
    const gain = ctx.createGain(); 
    
    osc1.connect(gain); 
    osc2.connect(gain); 
    gain.connect(ctx.destination); 
    
    osc1.frequency.value = 480; 
    osc2.frequency.value = 620; 
    osc1.type = "sine"; 
    osc2.type = "sine"; 
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5); 
    
    osc1.start(ctx.currentTime); 
    osc2.start(ctx.currentTime); 
    osc1.stop(ctx.currentTime + 1.5); 
    osc2.stop(ctx.currentTime + 1.5); 
  }; 

  let interval: NodeJS.Timeout | null = null; 
  
  return { 
    start: () => { 
      playRing(); 
      interval = setInterval(playRing, 3000); 
    }, 
    stop: () => { 
      if (interval) clearInterval(interval); 
      ctx.close(); 
    } 
  }; 
} 

export type CallState = "idle" | "calling" | "inCall" | "receiving";

export function useCall(convId: string | null) {
  const { user, userData } = useAuthContext();
  const [state, setState] = useState<CallState>("idle");
  const [callData, setCallData] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const ringtoneRef = useRef<ReturnType<typeof createRingtone>>(null);

  // Phone ringtone effect
  useEffect(() => {
    if (state === "calling" || state === "receiving") {
      if (!ringtoneRef.current) {
        ringtoneRef.current = createRingtone();
        ringtoneRef.current?.start();
      }
    } else if (state === "inCall" || state === "idle" || state === "rejected") {
      if (ringtoneRef.current) {
        ringtoneRef.current.stop();
        ringtoneRef.current = null;
      }
    }
  }, [state]);

  // Listen for incoming calls
  useEffect(() => {
    if (!convId || !user) return;

    const unsubscribe = onSnapshot(doc(db, "calls", convId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCallData(data);

        if (data.status === "calling" && data.callerId !== user.uid) {
          setState("receiving");
        } else if (data.status === "active") {
          setState("inCall");
        } else if (data.status === "ended" || data.status === "rejected") {
          setState("idle");
          setToken(null);
        }
      } else {
        setState("idle");
        setCallData(null);
      }
    });

    return () => unsubscribe();
  }, [convId, user]);

  const fetchToken = async (roomName: string) => {
    try {
      const resp = await fetch(`/api/livekit-token?room=${roomName}&username=${userData?.username || user?.uid}`);
      const data = await resp.json();
      setToken(data.token);
    } catch (e) {
      console.error("Error fetching LiveKit token:", e);
    }
  };

  const startCall = async () => {
    if (!convId || !user || !userData) return;
    setState("calling");
    await startCallRecord(convId, user.uid, userData.displayName || userData.username);
    await fetchToken(convId);
  };

  const acceptCall = async () => {
    if (!convId) return;
    await updateCallStatus(convId, "active");
    await fetchToken(convId);
    setState("inCall");
  };

  const rejectCall = async () => {
    if (!convId) return;
    await updateCallStatus(convId, "rejected");
    setState("idle");
  };

  const endCall = async () => {
    if (!convId) return;
    await updateCallStatus(convId, "ended");
    setState("idle");
    setToken(null);
  };

  return {
    state,
    callData,
    token,
    startCall,
    acceptCall,
    rejectCall,
    endCall
  };
}
