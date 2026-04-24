"use client";

import { useEffect, useState } from "react";
import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  useLocalParticipant,
  AudioConference
} from "@livekit/components-react";
import "@livekit/components-styles";
import { PhoneOff, Phone, Mic, MicOff, Loader2 } from "lucide-react";
import { CallState } from "@/hooks/useCall";

interface CallOverlayProps {
  state: CallState;
  callData: any;
  token: string | null;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
}

export default function CallOverlay({ 
  state, 
  callData, 
  token, 
  onAccept, 
  onReject, 
  onEnd 
}: CallOverlayProps) {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === "inCall") {
      interval = setInterval(() => setDuration(prev => prev + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (state === "idle") return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
        <div className="relative mb-6">
          <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
            <img 
              src={`https://www.gravatar.com/avatar/${callData?.callerId}?d=identicon`} 
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          {state === "inCall" && (
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-4 border-white rounded-full" />
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-1">{callData?.callerName}</h3>
        <p className="text-gray-500 mb-8 font-medium">
          {state === "calling" ? "Chamando..." : 
           state === "receiving" ? "Chamada de voz recebida" : 
           formatTime(duration)}
        </p>

        {state === "inCall" && token ? (
          <LiveKitRoom
            video={false}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            connectOptions={{ autoSubscribe: true }}
            onDisconnected={onEnd}
            className="w-full flex flex-col items-center"
          >
            <RoomAudioRenderer />
            <AudioConference />
            
            <button
              onClick={onEnd}
              className="mt-8 bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95"
            >
              <PhoneOff size={28} fill="currentColor" />
            </button>
          </LiveKitRoom>
        ) : (
          <div className="flex gap-6">
            {state === "receiving" ? (
              <>
                <button
                  onClick={onReject}
                  className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95"
                >
                  <PhoneOff size={28} fill="currentColor" />
                </button>
                <button
                  onClick={onAccept}
                  className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition-all shadow-lg shadow-green-100 active:scale-95 animate-bounce"
                >
                  <Phone size={28} fill="currentColor" />
                </button>
              </>
            ) : (
              <button
                onClick={onEnd}
                className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95"
              >
                <PhoneOff size={28} fill="currentColor" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
