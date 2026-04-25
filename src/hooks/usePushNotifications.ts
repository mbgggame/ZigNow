"use client"; 
 import { useEffect, useState } from "react"; 
 import { getMessaging, getToken, onMessage } from "firebase/messaging"; 
 import { doc, updateDoc } from "firebase/firestore"; 
 import { app, db } from "@/lib/firebase"; 
 
 export function usePushNotifications(uid: string | undefined) { 
   const [permission, setPermission] = useState<NotificationPermission>("default"); 
 
   useEffect(() => { 
     if (typeof window !== "undefined" && "Notification" in window) { 
       setPermission(Notification.permission); 
     } 
   }, []); 
 
   const requestPermission = async () => { 
     if (!uid || typeof window === "undefined") return; 
     if (!("Notification" in window)) return; 
 
     try { 
       const result = await Notification.requestPermission(); 
       setPermission(result); 
       
       if (result !== "granted") return; 
 
       const registration = await navigator.serviceWorker.register( 
         "/firebase-messaging-sw.js" 
       ); 
       await navigator.serviceWorker.ready; 
 
       const messaging = getMessaging(app); 
       const token = await getToken(messaging, { 
         vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, 
         serviceWorkerRegistration: registration 
       }); 
 
       if (token) { 
         await updateDoc(doc(db, "users", uid), { fcmToken: token }); 
         console.log("FCM token salvo"); 
       } 
 
       onMessage(messaging, (payload) => { 
         if (payload.notification) { 
           new Notification(payload.notification.title || "Zighub", { 
             body: payload.notification.body, 
             icon: "/icon-192.png" 
           }); 
         } 
       }); 
     } catch (err) { 
       console.error("Erro FCM:", err); 
     } 
   }; 
 
   return { permission, requestPermission }; 
 } 
