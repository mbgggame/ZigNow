"use client"; 
export default function TermsPage() { 
  return ( 
    <div style={{ minHeight: "100vh", background: "#2D0050", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}> 
      <div style={{ background: "white", borderRadius: 20, padding: 40, maxWidth: 600, width: "100%" }}> 
        <h1 style={{ color: "#4A0080", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Zighub</h1> 
        <p style={{ color: "#6B00B3", marginBottom: 32, fontSize: 14 }}>Regras da plataforma</p> 
        
        {[ 
          { icon: "🚫", title: "Sem cobranças", desc: "É expressamente proibido realizar cobranças, recuperação de crédito ou qualquer mensagem financeira não solicitada." }, 
          { icon: "🚫", title: "Sem vendas", desc: "Proibido usar o Zighub para prospecção comercial, vendas ou marketing de qualquer natureza." }, 
          { icon: "🤖", title: "Sem bots", desc: "Apenas pessoas reais podem se comunicar. Bots, automações e respostas automáticas são terminantemente proibidos." }, 
          { icon: "🔒", title: "Privacidade garantida", desc: "O Zighub não pode ser grampeado. Qualquer tentativa de interceptação é detectada e bloqueada imediatamente." }, 
          { icon: "⚠️", title: "Tolerância zero", desc: "Contas que violem estas regras são banidas permanentemente sem aviso prévio." }, 
        ].map((rule, i) => ( 
          <div key={i} style={{ display: "flex", gap: 16, marginBottom: 24, padding: 16, background: "#F0E6FF", borderRadius: 12 }}> 
            <span style={{ fontSize: 28 }}>{rule.icon}</span> 
            <div> 
              <p style={{ fontWeight: 700, color: "#4A0080", margin: "0 0 4px" }}>{rule.title}</p> 
              <p style={{ color: "#555", fontSize: 14, margin: 0 }}>{rule.desc}</p> 
            </div> 
          </div> 
        ))} 

        <div style={{ background: "#4A0080", borderRadius: 12, padding: 16, textAlign: "center" }}> 
          <p style={{ color: "white", fontSize: 13, margin: 0 }}> 
            Zighub — O mensageiro onde você fala em paz. 💜 
          </p> 
        </div> 
      </div> 
    </div> 
  ); 
} 
