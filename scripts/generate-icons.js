const sharp = require("sharp"); 
const fs = require("fs"); 
 
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"> 
  <rect width="512" height="512" rx="80" fill="#4A0080"/> 
  <text x="256" y="320" font-size="280" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">Z</text> 
</svg>`; 
 
fs.writeFileSync("public/icon.svg", svg); 
 
sharp(Buffer.from(svg)) 
  .resize(192, 192) 
  .png() 
  .toFile("public/icon-192.png"); 
 
sharp(Buffer.from(svg)) 
  .resize(512, 512) 
  .png() 
  .toFile("public/icon-512.png"); 
 
console.log("Ícones gerados!"); 
