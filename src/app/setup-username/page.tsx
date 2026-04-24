"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/hooks/useAuthContext";
import { 
  doc, 
  getDoc, 
  runTransaction, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import debounce from "lodash/debounce";

export default function SetupUsernamePage() {
  const { user, userData, loading: authLoading } = useAuthContext();
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'>('idle');
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && userData?.username) {
      router.push("/chat");
    }
  }, [user, userData, authLoading, router]);

  const checkUsername = useCallback(
    debounce(async (val: string) => {
      if (val.length < 3) {
        setStatus('invalid');
        setError('Muito curto');
        return;
      }

      if (!/^[a-z0-9_]+$/.test(val)) {
        setStatus('invalid');
        setError('Apenas letras, números e _');
        return;
      }

      setStatus('checking');
      try {
        const usernameRef = doc(db, "usernames", val.toLowerCase());
        const docSnap = await getDoc(usernameRef);
        
        if (docSnap.exists()) {
          setStatus('unavailable');
          setError('Já está em uso');
        } else {
          setStatus('available');
          setError('');
        }
      } catch (err) {
        console.error(err);
        setStatus('idle');
      }
    }, 500),
    []
  );

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/\s/g, "");
    if (val.length <= 20) {
      setUsername(val);
      if (val.length > 0) {
        checkUsername(val);
      } else {
        setStatus('idle');
        setError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || status !== 'available' || isSubmitting) return;

    setIsSubmitting(true);
    const finalUsername = username.toLowerCase();

    try {
      await runTransaction(db, async (transaction) => {
        const usernameRef = doc(db, "usernames", finalUsername);
        const userRef = doc(db, "users", user.uid);

        const usernameDoc = await transaction.get(usernameRef);

        if (usernameDoc.exists()) {
          throw new Error("Username already taken");
        }

        transaction.set(usernameRef, {
          uid: user.uid,
          createdAt: serverTimestamp(),
        });

        transaction.set(userRef, {
          uid: user.uid,
          username: finalUsername,
          displayName: user.displayName || finalUsername,
          photoURL: user.photoURL || `https://www.gravatar.com/avatar/${user.uid}?d=identicon`,
          createdAt: serverTimestamp(),
        }, { merge: true });
      });

      window.location.href = "/chat";
    } catch (err: any) {
      console.error(err);
      setError(err.message === "Username already taken" ? "Este username já está em uso." : "Erro ao salvar username.");
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#2D0050] p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#4A0080]">Escolha seu @username</h1>
          <p className="text-[#6B00B3] text-sm">
            Ele será sua identidade no Zighub. Não pode ser alterado depois.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="flex items-center rounded-2xl border-2 border-[#9B30FF] bg-white px-4 focus-within:border-[#4A0080] transition-all">
              <span className="text-[#6B00B3] font-medium text-lg">@</span>
              <input
                type="text"
                placeholder="seu_username"
                className="w-full bg-transparent p-4 text-lg font-medium focus:outline-none text-[#1a1a1a]"
                value={username}
                onChange={handleUsernameChange}
                required
              />
              <div className="flex items-center">
                {status === 'checking' && <Loader2 className="h-5 w-5 animate-spin text-[#4A0080]" />}
                {status === 'available' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {(status === 'unavailable' || status === 'invalid') && <XCircle className="h-5 w-5 text-red-500" />}
              </div>
            </div>
            
            {error && (
              <p className={`mt-2 text-sm font-medium ${status === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                {error}
              </p>
            )}
            {status === 'available' && !error && (
              <p className="mt-2 text-sm font-medium text-green-500">Username disponível!</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status !== 'available' || isSubmitting}
            className="flex w-full items-center justify-center rounded-2xl bg-[#4A0080] p-4 font-bold text-white shadow-lg transition-all hover:bg-[#6B00B3] active:scale-[0.98] disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar"}
          </button>
        </form>
      </div>
    </div>
  );
}
