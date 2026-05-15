import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Token ou mot de passe manquant." }, { status: 400 });
  }
  try {
    // Utiliser l'API REST de Firebase Auth pour appliquer confirmPasswordReset
    // car firebase-admin n'a pas cette méthode, il faut donc appeler l'API REST
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API Firebase manquante." }, { status: 500 });
    }
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oobCode: token, newPassword: password }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Erreur lors de la réinitialisation." }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur." }, { status: 500 });
  }
}
