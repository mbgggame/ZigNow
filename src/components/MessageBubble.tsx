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
          <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 shadow-sm border border-gray-100 uppercase tracking-wider">
            {formatDateLabel(date)}
          </span>
        </div>
      )}
      
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
            isOwn
              ? "bg-[#7C3AED] text-white rounded-tr-none"
              : "bg-white text-gray-900 rounded-tl-none border border-gray-100"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          <div
            className={`text-[10px] mt-1 flex justify-end ${
              isOwn ? "text-purple-100" : "text-gray-400"
            }`}
          >
            {date ? format(date, "HH:mm") : "--:--"}
          </div>
        </div>
      </div>
    </div>
  );
}
