"use client"; 
 
interface Props { 
  conversations?: any[]; 
  selectedId?: string | null; 
  onSelect?: (id: string) => void; 
  activeConvId?: string | null; 
  onSelectConv?: (id: string) => void; 
} 
 
export default function ConversationList({ conversations, selectedId, onSelect, activeConvId, onSelectConv }: Props) { 
  const convId = selectedId ?? activeConvId ?? null; 
  const handleSelect = onSelect ?? onSelectConv ?? (() => {}); 

  if (!conversations || conversations.length === 0) { 
    return ( 
      <div style={{ padding: 24, textAlign: "center", color: "#aaa" }}> 
        <p style={{ fontSize: 13 }}>Nenhuma conversa encontrada.</p> 
        <p style={{ fontSize: 12, marginTop: 4, fontStyle: "italic" }}>Busque um @username para começar!</p> 
      </div> 
    ); 
  } 
  return ( 
    <div style={{ overflowY: "auto" }}> 
      {conversations.map((conv) => ( 
        <div 
          key={conv.id} 
          onClick={() => handleSelect(conv.id)} 
          style={{ 
            display: "flex", alignItems: "center", gap: 12, 
            padding: "12px 16px", cursor: "pointer", 
            borderBottom: "1px solid #f5f5f5", 
            background: convId === conv.id ? "#f5f0ff" : "white" 
          }} 
        > 
          <img 
            src={conv.otherUser?.photoURL || "https://www.gravatar.com/avatar?d=mp"} 
            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} 
            alt="" 
          /> 
          <div style={{ flex: 1, minWidth: 0 }}> 
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}> 
              {conv.otherUser?.displayName || "..."} 
            </p> 
            <p style={{ fontSize: 12, color: "#888", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}> 
              {conv.lastMessage || "Nova conversa"} 
            </p> 
          </div> 
        </div> 
      ))} 
    </div> 
  ); 
} 
