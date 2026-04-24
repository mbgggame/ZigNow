"use client"; 
 import { useEffect } from "react"; 
 import { getMessaging, getToken, onMessage } from "firebase/messaging"; 
 import { doc, updateDoc } from "firebase/firestore"; 
 import { app, db } from "@/lib/firebase"; 
  
 export function usePushNotifications(uid: string | undefined) { 
   useEffect(() => { 
     if (!uid || typeof window === "undefined") return; 
     if (!("Notification" in window)) return; 
  
     const initMessaging = async () => { 
       try { 
         const permission = await Notification.requestPermission(); 
         if (permission !== "granted") return; 
  
         const messaging = getMessaging(app); 
          
         const token = await getToken(messaging, { 
           vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, 
           serviceWorkerRegistration: await navigator.serviceWorker.register("/firebase-messaging-sw.js") 
         }); 
  
         if (token) { 
           await updateDoc(doc(db, "users", uid), { fcmToken: token }); 
           console.log("FCM token salvo:", token.substring(0, 20) + "..."); 
         } 
  
         onMessage(messaging, (payload) => { 
           console.log("Mensagem recebida em foreground:", payload); 
           if (payload.notification) { 
             new Notification(payload.notification.title || "Zighub", { 
               body: payload.notification.body, 
               icon: "/favicon.ico" 
             }); 
           } 
         }); 
       } catch (err) { 
         console.error("Erro ao inicializar FCM:", err); 
       } 
     }; 
  
     initMessaging(); 
   }, [uid]); 
 } 
