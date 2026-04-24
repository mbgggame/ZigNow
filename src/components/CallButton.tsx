"use client";

import { Phone } from "lucide-react";

interface CallButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function CallButton({ onClick, disabled }: CallButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2.5 rounded-2xl text-gray-400 hover:bg-purple-50 hover:text-[#7C3AED] transition-all disabled:opacity-30 disabled:hover:bg-transparent"
      title="Chamada de voz"
    >
      <Phone size={22} />
    </button>
  );
}
