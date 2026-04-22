/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminAuth, getAdminDb } from "@/firebase-admin.init";
import { NextResponse } from "next/server";

type UpdateAuthBody = {
  userId?: string;
  email?: string;
  password?: string;
  username?: string;
  role?: string;
  phoneNbr?: string;
  birthDate?: string;
};

export async function POST(req: Request) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const body = (await req.json()) as UpdateAuthBody;
    const { userId, email, password, username, role, phoneNbr, birthDate } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId manquant" }, { status: 400 });
    }

    const authUpdates: { email?: string; password?: string } = {};

    if (typeof email === "string" && email.trim() && email !== "-") {
      authUpdates.email = email.trim();
    }

    if (typeof password === "string" && password.trim() && password !== "-") {
      authUpdates.password = password.trim();
    }

    if (Object.keys(authUpdates).length > 0) {
      await adminAuth.updateUser(userId, authUpdates);
    }

    await adminDb
      .collection("users")
      .doc(userId)
      .set(
        {
          email: typeof email === "string" ? email : "",
          username: typeof username === "string" ? username : "",
          role: typeof role === "string" ? role : "",
          phoneNbr: typeof phoneNbr === "string" ? phoneNbr : "",
          birthDate: typeof birthDate === "string" ? birthDate : "",
        },
        { merge: true }
      );

    return NextResponse.json({
      success: true,
      message: "Utilisateur mis a jour dans Firebase Auth et Firestore",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
