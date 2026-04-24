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
       background: isOwn ? "#6B00B3" : "#FFFFFF", 
       borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px", 
       padding: "10px 14px", 
       maxWidth: 280, 
       minWidth: 200, 
       boxShadow: isOwn ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
       transition: "all 0.2s ease"
     }}> 
       <audio 
         controls 
         src={audioUrl} 
         style={{  
           width: "100%",  
           height: 32, 
           filter: isOwn ? "invert(1) hue-rotate(180deg)" : "none" 
         }} 
         preload="auto" 
       /> 
       <p style={{ 
         fontSize: 10, 
         margin: "4px 0 0", 
         color: isOwn ? "rgba(255,255,255,0.7)" : "#1a1a1a", 
         textAlign: "right",
         fontWeight: 500
       }}> 
         {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")} 
       </p> 
     </div> 
   ); 
 } 
