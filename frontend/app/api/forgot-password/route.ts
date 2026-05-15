import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Fonction d'envoi d'email (à placer en dehors du handler)
async function sendResetEmail(to: string, link: string) {
  // À personnaliser avec vos infos SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Réinitialisation de votre mot de passe",
    html: `<p>Pour réinitialiser votre mot de passe, cliquez sur ce lien :</p><p><a href="${link}">${link}</a></p>`,
  });
}

// À remplacer par votre logique d'envoi d'email et de génération de token
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email manquant." }, { status: 400 });
  }
  // Générer un token sécurisé (ici, simple exemple)
  const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
  // TODO: Sauvegarder le token et l'email en base de données avec expiration
  // Générer le lien de réinitialisation
  const resetLink = `http://localhost:3000/auth/reset-password?oobCode=${token}`;
  try {
    await sendResetEmail(email, resetLink);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erreur d'envoi d'email:", e);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email." }, { status: 500 });
  }
}
