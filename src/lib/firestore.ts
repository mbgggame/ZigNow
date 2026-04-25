import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  Timestamp,
  increment,
  runTransaction
} from "firebase/firestore";
import { db } from "./firebase";
import CryptoJS from "crypto-js";

// 1. createUserProfile(uid, data)
export async function createUserProfile(uid: string, data: { username: string; displayName: string; photoURL: string | null }) {
  const userRef = doc(db, "users", uid);
  const usernameRef = doc(db, "usernames", data.username.toLowerCase());

  await runTransaction(db, async (transaction) => {
    const usernameDoc = await transaction.get(usernameRef);
    if (usernameDoc.exists()) {
      throw new Error("Username already taken");
    }

    transaction.set(userRef, {
      uid,
      username: data.username.toLowerCase(),
      displayName: data.displayName,
      photoURL: data.photoURL,
      createdAt: serverTimestamp(),
      blocked: [],
      walletAddress: null,
      walletVerifiedAt: null,
    });

    transaction.set(usernameRef, {
      uid,
      createdAt: serverTimestamp(),
    });
  });
}

// 2. getUserByUsername(username)
export async function getUserByUsername(username: string) {
  const usernameRef = doc(db, "usernames", username.toLowerCase());
  const usernameDoc = await getDoc(usernameRef);

  if (!usernameDoc.exists()) return null;

  const uid = usernameDoc.data().uid;
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  return userDoc.exists() ? userDoc.data() : null;
}

// 3. getOrCreateConversation(uid1, uid2)
export async function getOrCreateConversation(uid1: string, uid2: string) {
  const convId = [uid1, uid2].sort().join('_');
  const convRef = doc(db, "conversations", convId);
  const convDoc = await getDoc(convRef);

  if (!convDoc.exists()) {
    const data = {
      convId,
      participants: [uid1, uid2],
      participantMap: { [uid1]: true, [uid2]: true },
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      unreadCount: { [uid1]: 0, [uid2]: 0 }
    };
    await setDoc(convRef, data);
    return data;
  }

  return convDoc.data();
}

// 4. sendMessage(convId, senderId, text)
export async function sendMessage(convId: string, senderId: string, text: string) { 
   const convRef = doc(db, "conversations", convId); 
   const messagesRef = collection(db, "conversations", convId, "messages"); 
   const newMessageRef = doc(messagesRef); 
 
   await runTransaction(db, async (transaction) => { 
     const convDoc = await transaction.get(convRef); 
     const participants = convDoc.data()?.participants || []; 
     const recipientId = participants.find((p: string) => p !== senderId); 
 
     transaction.set(newMessageRef, { 
       senderId, 
       text, 
       createdAt: serverTimestamp(), 
       status: 'sent', 
       type: 'text', 
       deletedAt: null 
     }); 
 
     const updateData: any = { 
       lastMessage: text, 
       lastMessageAt: serverTimestamp(), 
     }; 
     if (recipientId) { 
       updateData[`unreadCount.${recipientId}`] = increment(1); 
     } 
     transaction.update(convRef, updateData); 
   }); 
 } 

// 5. markAsRead(convId, uid)
export async function markAsRead(convId: string, uid: string) {
  const convRef = doc(db, "conversations", convId);
  await updateDoc(convRef, {
    [`unreadCount.${uid}`]: 0
  });
}

// 6. sendAudioMessage(convId, senderId, audioUrl, duration)
export async function sendAudioMessage(
  convId: string,
  senderId: string,
  audioUrl: string,
  duration: number
) {
  const convRef = doc(db, "conversations", convId);
  const messagesRef = collection(db, "conversations", convId, "messages");
  const newMessageRef = doc(messagesRef);

  await runTransaction(db, async (transaction) => {
    const convDoc = await transaction.get(convRef);
    const participants = convDoc.data()?.participants || [];
    const recipientId = participants.find((p: string) => p !== senderId);

    transaction.set(newMessageRef, {
      senderId,
      audioUrl,
      duration,
      text: "",
      createdAt: serverTimestamp(),
      status: "sent",
      type: "audio",
      deletedAt: null
    });

    const updateData: any = {
      lastMessage: "🎤 Áudio",
      lastMessageAt: serverTimestamp(),
    };
    if (recipientId) {
      updateData[`unreadCount.${recipientId}`] = increment(1);
    }
    transaction.update(convRef, updateData);
  });
}

// 7. Call management
export async function startCallRecord(convId: string, callerId: string, callerName: string) {
  const callRef = doc(db, "calls", convId);
  await setDoc(callRef, {
    callerId,
    callerName,
    status: 'calling',
    createdAt: serverTimestamp(),
  });
}

export async function updateCallStatus(convId: string, status: 'calling' | 'active' | 'rejected' | 'ended') {
  const callRef = doc(db, "calls", convId);
  await updateDoc(callRef, { status });
}

