"use client"; 
 
 import { useState, useRef, useCallback } from "react"; 
 
 export type RecorderState = "idle" | "recording" | "recorded"; 
 
 function getSupportedMimeType(): string { 
   const types = [ 
     "audio/webm;codecs=opus", 
     "audio/webm", 
     "audio/ogg;codecs=opus", 
     "audio/ogg", 
     "audio/mp4", 
   ]; 
   for (const type of types) { 
     if (MediaRecorder.isTypeSupported(type)) return type; 
   } 
   return ""; 
 } 
 
 export function useAudioRecorder() { 
   const [state, setState] = useState<RecorderState>("idle"); 
   const [audioBlob, setAudioBlob] = useState<Blob | null>(null); 
   const [audioUrl, setAudioUrl] = useState<string>(""); 
   const [duration, setDuration] = useState(0); 
   const [mimeType, setMimeType] = useState<string>(""); 
 
   const mediaRecorderRef = useRef<MediaRecorder | null>(null); 
   const chunksRef = useRef<Blob[]>([]); 
   const timerRef = useRef<NodeJS.Timeout | null>(null); 
   const startTimeRef = useRef<number>(0); 
 
   const startRecording = async () => { 
     try { 
       const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); 
       const mime = getSupportedMimeType(); 
       console.log("Usando mimeType:", mime); 
       setMimeType(mime); 
 
       const options = mime ? { mimeType: mime } : {}; 
       const recorder = new MediaRecorder(stream, options); 
 
       mediaRecorderRef.current = recorder; 
       chunksRef.current = []; 
 
       recorder.ondataavailable = (e) => { 
         if (e.data.size > 0) chunksRef.current.push(e.data); 
       }; 
 
       recorder.onstop = () => { 
         const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" }); 
         const url = URL.createObjectURL(blob); 
         setAudioBlob(blob); 
         setAudioUrl(url); 
         setState("recorded"); 
         stream.getTracks().forEach(track => track.stop()); 
       }; 
 
       recorder.start(100); 
       startTimeRef.current = Date.now(); 
       setState("recording"); 
       setDuration(0); 
 
       timerRef.current = setInterval(() => { 
         const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000); 
         setDuration(elapsed); 
         if (elapsed >= 120) stopRecording(); 
       }, 1000); 
 
     } catch (err) { 
       console.error("Microphone error:", err); 
     } 
   }; 
 
   const stopRecording = useCallback(() => { 
     if (mediaRecorderRef.current?.state === "recording") { 
       mediaRecorderRef.current.stop(); 
       if (timerRef.current) clearInterval(timerRef.current); 
     } 
   }, []); 
 
   const cancelRecording = useCallback(() => { 
     if (mediaRecorderRef.current?.state === "recording") { 
       mediaRecorderRef.current.onstop = null; 
       mediaRecorderRef.current.stop(); 
       mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop()); 
     } 
     if (timerRef.current) clearInterval(timerRef.current); 
     setState("idle"); 
     setAudioBlob(null); 
     setAudioUrl(""); 
     setDuration(0); 
     setMimeType(""); 
   }, []); 
 
   return { state, audioBlob, audioUrl, duration, mimeType, startRecording, stopRecording, cancelRecording }; 
 } 
