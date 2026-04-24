"use client";

import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  showDate: boolean;
}

export default function MessageBubble({ message, isOwn, showDate }: MessageBubbleProps) {
  const date = message.createdAt?.toDate();

  const formatDateLabel = (d: Date) => {
    if (isToday(d)) return "Hoje";
    if (isYesterday(d)) return "Ontem";
    return format(d, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="flex flex-col space-y-2">
      {showDate && date && (
        <div className="flex justify-center my-4">
          <span className="bg-[#4A0080] px-4 py-1 rounded-full text-[11px] font-bold text-white shadow-md uppercase tracking-wider">
            {formatDateLabel(date)}
          </span>
        </div>
      )}
      
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[75%] px-4 py-2.5 shadow-sm text-sm transition-all duration-200 ${
            isOwn
              ? "bg-[#6B00B3] text-white rounded-[18px_18px_4px_18px]"
              : "bg-white text-[#1a1a1a] rounded-[18px_18px_18px_4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          <div
            className={`text-[10px] mt-1 flex justify-end font-medium ${
              isOwn ? "text-white/70" : "text-[#999]"
            }`}
          >
            {date ? format(date, "HH:mm") : "--:--"}
          </div>
        </div>
      </div>
    </div>
  );
}
