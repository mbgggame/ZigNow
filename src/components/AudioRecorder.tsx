"use client";

import { useState } from "react";
import { Mic, Square, Send, X, Play, Pause } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { sendAudioMessage } from "@/lib/firestore";

interface AudioRecorderProps {
  convId: string;
  senderId: string;
}

export default function AudioRecorder({ convId, senderId }: AudioRecorderProps) {
  const {
    state,
    audioBlob,
    audioUrl,
    duration,
    mimeType,
    startRecording,
    stopRecording,
    cancelRecording
  } = useAudioRecorder();

  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioPreviewRef = useState<HTMLAudioElement | null>(null)[0];

  const handleSend = async () => { 
    if (!audioBlob || isUploading) return; 
    console.log("handleSend iniciado", { convId, senderId, size: audioBlob.size, mimeType }); 
  
    setIsUploading(true); 
    try { 
      const timestamp = Date.now(); 
      
      // Re-read the blob to ensure it's complete 
      const arrayBuffer = await audioBlob.arrayBuffer(); 
      const finalBlob = new Blob([arrayBuffer], { type: audioBlob.type }); 
      console.log("Final blob:", finalBlob.size, finalBlob.type); 
      
      const ext = finalBlob.type.includes("mp4") ? "mp4" : 
                  finalBlob.type.includes("ogg") ? "ogg" : "webm"; 
      const path = `conversations/${convId}/audio/${timestamp}.${ext}`; 
      
      const storageRef = ref(storage, path); 
      const metadata = { 
        contentType: finalBlob.type, 
        customMetadata: { duration: String(duration) } 
      }; 
      
      const snapshot = await uploadBytes(storageRef, finalBlob, metadata); 
      console.log("Upload concluído"); 
      
      const downloadUrl = await getDownloadURL(snapshot.ref); 
      console.log("URL:", downloadUrl); 
      
      await sendAudioMessage(convId, senderId, downloadUrl, duration); 
      console.log("Mensagem enviada"); 
      cancelRecording(); 
    } catch (err) { 
      console.error("Erro:", err); 
    } finally { 
      setIsUploading(false); 
    } 
  }; 

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (state === "idle") {
    return (
      <button
        onClick={startRecording}
        className="p-2.5 rounded-2xl text-gray-400 hover:bg-gray-50 hover:text-[#7C3AED] transition-all"
        title="Gravar áudio"
      >
        <Mic size={22} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-purple-50 p-1.5 rounded-2xl border border-purple-100 animate-in fade-in zoom-in duration-200">
      {state === "recording" ? (
        <>
          <div className="flex items-center gap-2 px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-mono font-bold text-gray-700">{formatTime(duration)}</span>
          </div>
          <button
            onClick={cancelRecording}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Cancelar"
          >
            <X size={20} />
          </button>
          <button
            onClick={stopRecording}
            className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-sm"
            title="Parar"
          >
            <Square size={18} fill="currentColor" />
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-bold text-purple-600">{formatTime(duration)}</span>
          </div>
          <button
            onClick={cancelRecording}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Excluir"
          >
            <X size={20} />
          </button>
          <button
            onClick={handleSend}
            disabled={isUploading}
            className="p-2 bg-[#7C3AED] text-white rounded-xl hover:bg-[#6D28D9] transition-all shadow-md shadow-purple-100 disabled:opacity-50"
            title="Enviar áudio"
          >
            {isUploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </>
      )}
    </div>
  );
}
