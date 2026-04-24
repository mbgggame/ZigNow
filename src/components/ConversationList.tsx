"use client"; 
  
 interface Props { 
   conversations?: any[]; 
   selectedId?: string | null; 
   onSelect?: (id: string) => void; 
   activeConvId?: string | null; 
   onSelectConv?: (id: string) => void; 
 } 
  
 export default function ConversationList({ conversations, selectedId, onSelect, activeConvId, onSelectConv }: Props) { 
   console.log("ConversationList renderizando:", conversations?.length); 
   const convId = selectedId ?? activeConvId ?? null; 
   const handleSelect = onSelect ?? onSelectConv ?? (() => {}); 
  
   if (!conversations || conversations.length === 0) { 
     return ( 
       <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.5)" }}> 
         <p style={{ fontSize: 13 }}>Nenhuma conversa encontrada.</p> 
         <p style={{ fontSize: 12, marginTop: 4, fontStyle: "italic" }}>Busque um @username para começar!</p> 
       </div> 
     ); 
   } 
  
   return ( 
     <div style={{ overflowY: "auto", flex: 1, background: "transparent" }}> 
       {conversations.map((conv) => { 
         console.log("Renderizando conv:", conv.id, conv.otherUser?.displayName); 
         const isSelected = convId === conv.id;
         return ( 
           <div 
             key={conv.id} 
             onClick={() => handleSelect(conv.id)} 
             style={{ 
               display: "flex", 
               alignItems: "center", 
               gap: 12, 
               padding: "12px 16px", 
               cursor: "pointer", 
               borderBottom: "1px solid #3D0070", 
               background: isSelected ? "#4A0080" : "transparent",
               transition: "all 0.2s ease"
             }} 
             onMouseOver={(e) => !isSelected && (e.currentTarget.style.background = "#3D0070")}
             onMouseOut={(e) => !isSelected && (e.currentTarget.style.background = "transparent")}
           > 
             <img 
               src={conv.otherUser?.photoURL || "https://www.gravatar.com/avatar?d=mp"} 
               style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid #6B00B3" }} 
               alt="" 
             /> 
             <div style={{ flex: 1, minWidth: 0 }}> 
               <p style={{ fontSize: 14, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#FFFFFF" }}> 
                 {conv.otherUser?.displayName || conv.id} 
               </p> 
               <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}> 
                 {conv.lastMessage || "Nova conversa"} 
               </p> 
             </div> 
             {conv.unreadCount?.[conv.otherUser?.uid] > 0 && ( 
               <div style={{ background: "#9B30FF", color: "white", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}> 
                 {conv.unreadCount[conv.otherUser?.uid]} 
               </div> 
             )} 
           </div> 
         ); 
       })} 
     </div> 
   ); 
 } 
