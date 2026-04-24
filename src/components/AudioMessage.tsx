"use client"; 
 import { useRef, useState } from "react"; 
 
 interface AudioMessageProps { 
   audioUrl: string; 
   duration: number; 
   isOwn: boolean; 
 } 
 
 export default function AudioMessage({ audioUrl, duration, isOwn }: AudioMessageProps) { 
   return ( 
     <div style={{ 
       background: isOwn ? "#7C3AED" : "#f3f4f6", 
       borderRadius: 16, 
       padding: "10px 14px", 
       maxWidth: 280, 
       minWidth: 200, 
     }}> 
       <audio 
         controls 
         src={audioUrl} 
         style={{ width: "100%", height: 32 }} 
         preload="auto" 
       /> 
       <p style={{ 
         fontSize: 10, 
         margin: "4px 0 0", 
         color: isOwn ? "rgba(255,255,255,0.7)" : "#888", 
         textAlign: "right" 
       }}> 
         {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")} 
       </p> 
     </div> 
   ); 
 } 
