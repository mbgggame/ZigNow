"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/hooks/useAuthContext";

export default function Home() {
  const { user, userData, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
    } else if (!userData) {
      router.push("/setup-username");
    } else {
      router.push("/chat");
    }
  }, [user, userData, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#f0f2f5]">
      <div className="animate-pulse text-[#00a884] text-2xl font-bold">Zighub</div>
    </div>
  );
}
