"use client"; 
 import { useEffect, useState } from "react"; 
 
 const KEY_STORAGE = "zighub_keypair"; 
 
 export function useCrypto(uid: string | undefined) { 
   const [publicKey, setPublicKey] = useState<string | null>(null); 
   const [ready, setReady] = useState(false); 
 
   useEffect(() => { 
     if (!uid || typeof window === "undefined") return; 
 
     const initKeys = async () => { 
       try { 
         const stored = localStorage.getItem(`${KEY_STORAGE}_${uid}`); 
         
         if (stored) { 
           const { publicKeyJwk } = JSON.parse(stored); 
           setPublicKey(JSON.stringify(publicKeyJwk)); 
           setReady(true); 
           return; 
         } 
 
         // Gera novo par de chaves ECDH P-256 
         const keyPair = await crypto.subtle.generateKey( 
           { name: "ECDH", namedCurve: "P-256" }, 
           true, 
           ["deriveKey", "deriveBits"] 
         ); 
 
         const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey); 
         const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey); 
 
         // Salva localmente (chave privada NUNCA sai do dispositivo) 
         localStorage.setItem(`${KEY_STORAGE}_${uid}`, JSON.stringify({ 
           publicKeyJwk, 
           privateKeyJwk, 
           createdAt: new Date().toISOString() 
         })); 
 
         setPublicKey(JSON.stringify(publicKeyJwk)); 
         setReady(true); 
         console.log("Par de chaves E2E gerado para:", uid); 
       } catch (err) { 
         console.error("Erro ao inicializar criptografia:", err); 
       } 
     }; 
 
     initKeys(); 
   }, [uid]); 
 
   return { publicKey, ready }; 
 } 
 
 // Funções auxiliares para uso futuro: 
 export async function encryptMessage(message: string, recipientPublicKeyJwk: object): Promise<{encryptedContent: string, iv: string}> { 
   throw new Error("E2E encryption não ativada nesta versão"); 
 } 
 
 export async function decryptMessage(encryptedContent: string, iv: string, senderPublicKeyJwk: object): Promise<string> { 
   throw new Error("E2E encryption não ativada nesta versão"); 
 } 
