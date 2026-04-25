# Zighub — Arquitetura Técnica 
 
 ## Visão geral 
 
 Zighub é um mensageiro privado 1 a 1, focado em comunicação humana limpa, 
 sem bots, sem propaganda e sem exploração comercial. 
 
 **URL produção:** `https://zig-now-2bpo.vercel.app`   
 **Repositório:** `https://github.com/mbgggame/ZigNow`   
 **Stack:** Next.js 14 + TypeScript + Firebase + LiveKit  
 
 --- 
 
 ## Arquitetura atual (MVP) 
 ┌─────────────────────────────────────────────────────┐ 
 │                   Cliente (Browser/PWA)              │ 
 │                                                     │ 
 │  Next.js 14 (App Router) + TypeScript + Tailwind    │ 
 │                                                     │ 
 │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │ 
 │  │  Auth    │  │  Chat    │  │  Chamadas de voz │  │ 
 │  │  Pages   │  │  Pages   │  │  (LiveKit SDK)   │  │ 
 │  └──────────┘  └──────────┘  └──────────────────┘  │ 
 └─────────────────────┬───────────────────────────────┘ 
 │ HTTPS / WebSocket 
 ┌─────────────────────▼───────────────────────────────┐ 
 │                   Firebase (Backend)                 │ 
 │                                                     │ 
 │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │ 
 │  │  Auth    │  │Firestore │  │    Storage       │  │ 
 │  │ (Google  │  │(Realtime │  │  (Áudios/Fotos)  │  │ 
 │  │  +Email) │  │Database) │  │                  │  │ 
 │  └──────────┘  └──────────┘  └──────────────────┘  │ 
 │                                                     │ 
 │  ┌──────────────────────────────────────────────┐   │ 
 │  │           Cloud Functions (Node.js 20)        │   │ 
 │  │  convertAudioToMp3  │  notificarNovaMensagem  │   │ 
 │  └──────────────────────────────────────────────┘   │ 
 └─────────────────────────────────────────────────────┘ 
 │ 
 ┌─────────────────────▼───────────────────────────────┐ 
 │                  Serviços externos                   │ 
 │                                                     │ 
 │  LiveKit Cloud (WebRTC)  │  Vercel (Deploy/CDN)     │ 
 │  Firebase FCM (Push)     │  Google Maps (futuro)    │ 
 └─────────────────────────────────────────────────────┘ 
 
 --- 
 
 ## Schema do Firestore 
 
 ### users/{uid} 
 ```typescript 
 { 
   uid: string, 
   username: string,          // @único, lowercase 
   displayName: string, 
   photoURL: string | null, 
   createdAt: Timestamp, 
   blocked: string[],         // UIDs bloqueados 
   fcmToken: string,          // Push notifications 
   walletAddress: string | null,     // Blockchain (futuro) 
   walletVerifiedAt: Timestamp | null // Blockchain (futuro) 
 } 
 ``` 
 
 ### usernames/{username} 
 ```typescript 
 { 
   uid: string, 
   createdAt: Timestamp 
 } 
 ``` 
 > Coleção auxiliar para garantir unicidade atômica do @username. 
 
 ### conversations/{convId} 
 ```typescript 
 { 
   convId: string,            // [uid1, uid2].sort().join('_') 
   participants: string[], 
   participantMap: { [uid]: true }, 
   lastMessage: string, 
   lastMessageAt: Timestamp, 
   createdAt: Timestamp, 
   unreadCount: { [uid]: number } 
 } 
 ``` 
 
 ### conversations/{convId}/messages/{msgId} 
 ```typescript 
 { 
   senderId: string, 
   text: string, 
   audioUrl: string | null, 
   duration: number | null, 
   createdAt: Timestamp, 
   status: 'sent' | 'delivered' | 'read', 
   type: 'text' | 'audio', 
   deletedAt: Timestamp | null, 
   // Reservado para E2E encryption (futuro): 
   encryptedContent: string | null, 
   iv: string | null, 
   senderPublicKey: string | null 
 } 
 ``` 
 
 ### calls/{convId} 
 ```typescript 
 { 
   callerId: string, 
   callerName: string, 
   status: 'calling' | 'active' | 'rejected' | 'ended', 
   createdAt: Timestamp 
 } 
 ``` 
 
 --- 
 
 ## Módulos do frontend 
 src/ 
 ├── app/ 
 │   ├── chat/          # Tela principal do chat 
 │   ├── login/         # Autenticação 
 │   ├── setup-username/ # Onboarding 
 │   └── terms/         # Regras da plataforma 
 ├── components/ 
 │   ├── ChatArea       # Área de mensagens 
 │   ├── ConversationList # Lista de conversas 
 │   ├── MessageBubble  # Balão de mensagem 
 │   ├── AudioMessage   # Player de áudio 
 │   ├── AudioRecorder  # Gravação de áudio 
 │   ├── CallButton     # Botão de chamada 
 │   ├── CallOverlay    # Interface de chamada 
 │   ├── SecurityAlert  # Alerta de invasão 
 │   └── UserSearch     # Busca por @username 
 ├── hooks/ 
 │   ├── useAuth        # Firebase Auth 
 │   ├── useCall        # LiveKit + ringtone 
 │   ├── useAudioRecorder # MediaRecorder 
 │   ├── usePushNotifications # FCM 
 │   └── useSecurityMonitor  # Detecção de ameaças 
 └── lib/ 
 ├── firebase.ts    # Inicialização Firebase 
 └── firestore.ts   # Funções de banco de dados 
 
 --- 
 
 ## Decisões técnicas 
 
 | Decisão | Escolha | Motivo | 
 |---------|---------|--------| 
 | Identity | @username + email/Google | Sem dependência de número de telefone | 
 | Realtime | Firestore onSnapshot | Zero infraestrutura, escala automática | 
 | Chamadas | LiveKit (WebRTC) | Open source, pode ser self-hosted | 
 | Push | Firebase FCM | Integrado, gratuito, confiável | 
 | Deploy | Vercel + Firebase | CI/CD automático, global CDN | 
 | Áudio | MediaRecorder + Storage | Nativo no browser, sem dependências | 
 
 --- 
 
 ## Roadmap técnico 
 
 ### Fase 1 — MVP (atual) 
 - [x] Chat texto em tempo real 
 - [x] Mensagens de voz 
 - [x] Chamadas de voz (LiveKit) 
 - [x] Push notifications (FCM) 
 - [x] PWA instalável 
 - [x] Regras de segurança Firestore 
 - [x] Sistema anti-invasão 
 
 ### Fase 2 — Segurança avançada 
 - [ ] Criptografia E2E (Signal Protocol) 
 - [ ] Minimização de metadados 
 - [ ] Auditoria de segurança 
 
 ### Fase 3 — Blockchain 
 - [ ] Conexão de carteira (MetaMask/Phantom) 
 - [ ] Identidade descentralizada (DID) 
 - [ ] Pagamentos peer-to-peer 
 - [ ] NFT de identidade opcional 
 
 ### Fase 4 — Escala 
 - [ ] Migração para PostgreSQL (Supabase) 
 - [ ] Self-hosted LiveKit 
 - [ ] Multi-dispositivo 
 - [ ] Grupos privados 
 
 --- 
 
 ## Regras da plataforma 
 
 O Zighub é **expressamente proibido** para: 
 - Cobranças e recuperação de crédito 
 - Vendas e prospecção comercial 
 - Bots e automações de qualquer tipo 
 - Grampo ou interceptação de mensagens 
 - Uso corporativo disfarçado de conta pessoal 
 
 **Violações resultam em banimento permanente.** 
 
 --- 
 
 ## Variáveis de ambiente 
 
 ```env 
 NEXT_PUBLIC_FIREBASE_API_KEY= 
 NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN= 
 NEXT_PUBLIC_FIREBASE_PROJECT_ID= 
 NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET= 
 NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID= 
 NEXT_PUBLIC_FIREBASE_APP_ID= 
 NEXT_PUBLIC_FIREBASE_VAPID_KEY= 
 NEXT_PUBLIC_LIVEKIT_URL= 
 LIVEKIT_API_KEY= 
 LIVEKIT_API_SECRET= 
 ``` 
 
 --- 
 
 *Documento gerado em 25/04/2026 — Zighub v0.1.0 MVP* 
