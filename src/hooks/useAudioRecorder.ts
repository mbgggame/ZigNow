"use client"; 
 import { useState, useRef, useCallback } from "react"; 
 
 export type RecorderState = "idle" | "recording" | "recorded"; 
 
 async function convertToWav(blob: Blob): Promise<Blob> { 
   const audioContext = new AudioContext(); 
   const arrayBuffer = await blob.arrayBuffer(); 
   const audioBuffer = await audioContext.decodeAudioData(arrayBuffer); 
   
   const numChannels = audioBuffer.numberOfChannels; 
   const sampleRate = audioBuffer.sampleRate; 
   const numSamples = audioBuffer.length; 
   const buffer = new ArrayBuffer(44 + numSamples * numChannels * 2); 
   const view = new DataView(buffer); 
   
   const writeString = (offset: number, str: string) => { 
     for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); 
   }; 
   
   writeString(0, "RIFF"); 
   view.setUint32(4, 36 + numSamples * numChannels * 2, true); 
   writeString(8, "WAVE"); 
   writeString(12, "fmt "); 
   view.setUint32(16, 16, true); 
   view.setUint16(20, 1, true); 
   view.setUint16(22, numChannels, true); 
   view.setUint32(24, sampleRate, true); 
   view.setUint32(28, sampleRate * numChannels * 2, true); 
   view.setUint16(32, numChannels * 2, true); 
   view.setUint16(34, 16, true); 
   writeString(36, "data"); 
   view.setUint32(40, numSamples * numChannels * 2, true); 
   
   let offset = 44; 
   for (let i = 0; i < numSamples; i++) { 
     for (let ch = 0; ch < numChannels; ch++) { 
       const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i])); 
       view.setInt16(offset, sample * 0x7fff, true); 
       offset += 2; 
     } 
   } 
   
   await audioContext.close(); 
   return new Blob([buffer], { type: "audio/wav" }); 
 } 
 
 export function useAudioRecorder() { 
   const [state, setState] = useState<RecorderState>("idle"); 
   const [audioBlob, setAudioBlob] = useState<Blob | null>(null); 
   const [audioUrl, setAudioUrl] = useState<string>(""); 
   const [duration, setDuration] = useState(0); 
   const mimeType = "audio/wav"; 
 
   const mediaRecorderRef = useRef<MediaRecorder | null>(null); 
   const chunksRef = useRef<Blob[]>([]); 
   const timerRef = useRef<NodeJS.Timeout | null>(null); 
   const startTimeRef = useRef<number>(0); 
 
   const startRecording = async () => { 
     try { 
       const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); 
       const options = MediaRecorder.isTypeSupported("audio/webm") 
         ? { mimeType: "audio/webm" } 
         : {}; 
       const recorder = new MediaRecorder(stream, options); 
 
       mediaRecorderRef.current = recorder; 
       chunksRef.current = []; 
 
       recorder.ondataavailable = (e) => { 
         if (e.data.size > 0) chunksRef.current.push(e.data); 
       }; 
 
       recorder.onstop = async () => { 
         const rawBlob = new Blob(chunksRef.current, { type: "audio/webm" }); 
         stream.getTracks().forEach(track => track.stop()); 
         
         try { 
           const wavBlob = await convertToWav(rawBlob); 
           const url = URL.createObjectURL(wavBlob); 
           setAudioBlob(wavBlob); 
           setAudioUrl(url); 
         } catch (err) { 
           console.error("Conversion error:", err); 
           const url = URL.createObjectURL(rawBlob); 
           setAudioBlob(rawBlob); 
           setAudioUrl(url); 
         } 
         setState("recorded"); 
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
   }, []); 
 
   return { state, audioBlob, audioUrl, duration, mimeType, startRecording, stopRecording, cancelRecording }; 
 } 
