const functions = require("firebase-functions"); 
 const admin = require("firebase-admin"); 
 const ffmpeg = require("fluent-ffmpeg"); 
 const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path; 
 const os = require("os"); 
 const path = require("path"); 
 const fs = require("fs"); 
  
 admin.initializeApp(); 
 ffmpeg.setFfmpegPath(ffmpegPath); 
  
 exports.convertAudioToMp3 = functions 
   .runWith({ memory: "512MB", timeoutSeconds: 60 }) 
   .region("us-east1") 
   .storage.object() 
   .onFinalize(async (object) => { 
     const filePath = object.name; 
     const contentType = object.contentType; 
  
     // Only process audio files that are not already mp3 
     if (!contentType.startsWith("audio/") || filePath.endsWith(".mp3")) { 
       return null; 
     } 
     if (!filePath.includes("/audio/")) { 
       return null; 
     } 
  
     const bucket = admin.storage().bucket(object.bucket); 
     const fileName = path.basename(filePath, path.extname(filePath)); 
     const tempInput = path.join(os.tmpdir(), path.basename(filePath)); 
     const tempOutput = path.join(os.tmpdir(), `${fileName}.mp3`); 
     const outputPath = filePath.replace(path.basename(filePath), `${fileName}.mp3`); 
  
     // Download original file 
     await bucket.file(filePath).download({ destination: tempInput }); 
  
     // Convert to mp3 
     await new Promise((resolve, reject) => { 
       ffmpeg(tempInput) 
         .toFormat("mp3") 
         .audioCodec("libmp3lame") 
         .audioBitrate("128k") 
         .on("end", resolve) 
         .on("error", reject) 
         .save(tempOutput); 
     }); 
  
     // Upload mp3 
     await bucket.upload(tempOutput, { 
       destination: outputPath, 
       metadata: { contentType: "audio/mpeg" } 
     }); 
  
     // Update Firestore message with new URL 
     const mp3Url = `https://firebasestorage.googleapis.com/v0/b/${object.bucket}/o/${encodeURIComponent(outputPath)}?alt=media`; 
      
     // Find the message with the original URL and update it 
     const db = admin.firestore(); 
     const convId = filePath.split("/")[1]; 
     const messagesRef = db.collection("conversations").doc(convId).collection("messages"); 
     const snapshot = await messagesRef.where("type", "==", "audio").orderBy("createdAt", "desc").limit(5).get(); 
      
     for (const doc of snapshot.docs) { 
       const data = doc.data(); 
       if (data.audioUrl && data.audioUrl.includes(fileName)) { 
         await doc.ref.update({ audioUrl: mp3Url }); 
         break; 
       } 
     } 
  
     // Cleanup temp files 
     fs.unlinkSync(tempInput); 
     fs.unlinkSync(tempOutput); 
  
     return null; 
   }); 
  
 exports.notificarNovaMensagem = functions 
   .region("us-east1") 
   .firestore.document("conversations/{convId}/messages/{msgId}") 
   .onCreate(async (snap, context) => { 
     const msg = snap.data(); 
     const convId = context.params.convId; 
     const senderId = msg.senderId; 
  
     const convDoc = await admin.firestore() 
       .doc(`conversations/${convId}`).get(); 
     const participants = convDoc.data()?.participants || []; 
     const recipientId = participants.find((uid) => uid !== senderId); 
     if (!recipientId) return null; 
  
     const recipientDoc = await admin.firestore() 
       .doc(`users/${recipientId}`).get(); 
     const fcmToken = recipientDoc.data()?.fcmToken; 
     if (!fcmToken) return null; 
  
     const senderDoc = await admin.firestore() 
       .doc(`users/${senderId}`).get(); 
     const senderName = senderDoc.data()?.displayName || "Alguém"; 
  
     const notification = { 
       title: senderName, 
       body: msg.type === "audio" ? "🎤 Áudio" : msg.text || "Nova mensagem" 
     }; 
  
     try { 
       await admin.messaging().send({ 
         token: fcmToken, 
         notification, 
         data: { convId, senderId } 
       }); 
       console.log("Notificação enviada para:", recipientId); 
     } catch (err) { 
       console.error("Erro ao enviar notificação:", err); 
     } 
  
     return null; 
   }); 
