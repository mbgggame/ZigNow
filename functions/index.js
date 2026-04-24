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
