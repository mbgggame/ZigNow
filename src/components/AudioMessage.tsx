"use client"; 
import { useState, useRef } from "react"; 
import { Play, Pause } from "lucide-react"; 
 
 interface AudioMessageProps { 
   audioUrl: string; 
   duration: number; 
   isOwn: boolean; 
 } 
 
 export default function AudioMessage({ audioUrl, duration, isOwn }: AudioMessageProps) { 
   const [isPlaying, setIsPlaying] = useState(false); 
   const [currentTime, setCurrentTime] = useState(0); 
   const audioRef = useRef<HTMLAudioElement>(null); 
 
   const togglePlay = async () => { 
     const audio = audioRef.current; 
     if (!audio) return; 
     if (isPlaying) { 
       audio.pause(); 
       setIsPlaying(false); 
     } else { 
       try { 
         await audio.play(); 
         setIsPlaying(true); 
       } catch (e) { 
         console.error("Audio play error:", e); 
       } 
     } 
   }; 
 
   const formatTime = (seconds: number) => { 
     const mins = Math.floor(seconds / 60); 
     const secs = Math.floor(seconds % 60); 
     return `${mins}:${secs.toString().padStart(2, "0")}`; 
   }; 
 
   const bars = Array.from({ length: 20 }, (_, i) => ({ 
     height: Math.max(20, ((i % 7) + 1) * 14), 
     active: duration > 0 && (currentTime / duration) * 20 > i 
   })); 
 
   return ( 
     <div className={`flex items-center gap-3 p-2 rounded-2xl min-w-[200px] max-w-[280px] ${ 
       isOwn ? "bg-[#7C3AED] text-white" : "bg-white border border-gray-100 text-gray-900" 
     }`}> 
       <audio 
         ref={audioRef} 
         src={audioUrl} 
         onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} 
         onEnded={() => { setIsPlaying(false); setCurrentTime(0); }} 
         preload="auto" 
       /> 
       {!isPlaying && ( 
         <a 
           href={audioUrl} 
           target="_blank" 
           rel="noopener noreferrer" 
           style={{fontSize: 10, color: "inherit", opacity: 0.6, textDecoration: "none"}} 
         > 
           ↗ 
         </a> 
       )} 
       <button 
         onClick={togglePlay} 
         className={`p-2 rounded-full flex items-center justify-center transition-colors shrink-0 ${ 
           isOwn ? "bg-white/20 hover:bg-white/30" : "bg-purple-50 hover:bg-purple-100 text-[#7C3AED]" 
         }`} 
       > 
         {isPlaying 
           ? <Pause size={18} fill="currentColor" /> 
           : <Play size={18} fill="currentColor" className="ml-0.5" /> 
         } 
       </button> 
       <div className="flex-1 flex flex-col gap-1 min-w-0"> 
         <div className="flex items-center gap-0.5 h-6"> 
           {bars.map((bar, i) => ( 
             <div 
               key={i} 
               className={`w-1 rounded-full transition-opacity ${isOwn ? "bg-white" : "bg-purple-400"}`} 
               style={{ height: `${bar.height}%`, opacity: bar.active ? 1 : 0.35 }} 
             /> 
           ))} 
         </div> 
         <div className="flex justify-between text-[10px] font-medium opacity-80"> 
           <span>{formatTime(currentTime)}</span> 
           <span>{formatTime(duration)}</span> 
         </div> 
       </div> 
     </div> 
   ); 
 } 
