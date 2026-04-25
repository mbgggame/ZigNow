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
   const convId = event.notification.data?.convId; 
   const url = convId  
     ? `https://zig-now-2bpo.vercel.app/chat?conv=${convId}` 
     : 'https://zig-now-2bpo.vercel.app/chat'; 
   event.waitUntil( 
     clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => { 
       for (const client of clientList) { 
         if (client.url.includes('zig-now-2bpo.vercel.app') && 'focus' in client) { 
           client.postMessage({ type: 'OPEN_CONV', convId }); 
           return client.focus(); 
         } 
       } 
       return clients.openWindow(url); 
     }) 
   ); 
 }); 
