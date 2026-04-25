import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = { 
  themeColor: "#4A0080", 
  width: "device-width", 
  initialScale: 1, 
  maximumScale: 1, 
  userScalable: false, 
}; 
 
export const metadata: Metadata = { 
  title: "Zighub", 
  description: "Fale em paz.", 
  manifest: "/manifest.json", 
  appleWebApp: { 
    capable: true, 
    statusBarStyle: "black-translucent", 
    title: "Zighub", 
  }, 
  other: { 
    "mobile-web-app-capable": "yes", 
    "apple-mobile-web-app-capable": "yes", 
    "apple-mobile-web-app-status-bar-style": "black-translucent", 
    "apple-mobile-web-app-title": "Zighub", 
    "msapplication-TileColor": "#4A0080", 
  } 
}; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-white`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
