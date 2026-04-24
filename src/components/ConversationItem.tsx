"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConversationItemProps {
  conversation: any;
  isActive: boolean;
  onClick: () => void;
  currentUserId: string;
}

export default function ConversationItem({ 
  conversation, 
  isActive, 
  onClick, 
  currentUserId 
}: ConversationItemProps) {
  const otherUser = conversation.otherUserData;
  const lastMessage = conversation.lastMessage;
  const lastMessageAt = conversation.lastMessageAt?.toDate();
  const unreadCount = conversation.unreadCount?.[currentUserId] || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 transition-all border-b border-gray-50 hover:bg-gray-50 ${
        isActive ? "bg-purple-50 hover:bg-purple-50" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={otherUser?.photoURL || "https://www.gravatar.com/avatar?d=mp"}
          alt={otherUser?.displayName}
          className="h-12 w-12 rounded-full object-cover border border-gray-100"
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7C3AED] text-[10px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className={`font-semibold truncate ${isActive ? 'text-[#7C3AED]' : 'text-gray-900'}`}>
            {otherUser?.displayName || "Usuário"}
          </h4>
          {lastMessageAt && (
            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
              {format(lastMessageAt, "HH:mm", { locale: ptBR })}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-sm truncate ${unreadCount > 0 ? "font-bold text-gray-900" : "text-gray-500"}`}>
            {lastMessage || "Nenhuma mensagem"}
          </p>
        </div>
      </div>
    </button>
  );
}
