"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { startCallRecord, updateCallStatus } from "@/lib/firestore";

export type CallState = "idle" | "calling" | "inCall" | "receiving";

export function useCall(convId: string | null) {
  const { user, userData } = useAuthContext();
  const [state, setState] = useState<CallState>("idle");
  const [callData, setCallData] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Phone ringtone effect
  useEffect(() => {
    if (state === "calling" || state === "receiving") {
      if (!audioRef.current) {
        audioRef.current = new Audio("https://www.soundjay.com/phone/sounds/phone-calling-1.mp3");
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    } else if (state === "inCall" || state === "idle") {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
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
