importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js'); 
 importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js'); 
  
 firebase.initializeApp({ 
   apiKey: "AIzaSyDIq9n5kNnDNm3Nz7-eXr86vu7kCdFkZjA", 
   authDomain: "zighub.firebaseapp.com", 
   projectId: "zighub", 
   storageBucket: "zighub.firebasestorage.app", 
   messagingSenderId: "516770144849", 
   appId: "1:516770144849:web:992b481754e9193c754e70" 
 }); 
  
 const messaging = firebase.messaging(); 
  
 messaging.onBackgroundMessage((payload) => { 
   const { title, body } = payload.notification; 
   self.registration.showNotification(title, { 
     body, 
     icon: '/favicon.ico', 
     badge: '/favicon.ico', 
     data: payload.data 
   }); 
 }); 
  
 self.addEventListener('notificationclick', (event) => { 
   event.notification.close(); 
   event.waitUntil( 
     clients.openWindow('https://zig-now-2bpo.vercel.app/chat') 
   ); 
 }); 
