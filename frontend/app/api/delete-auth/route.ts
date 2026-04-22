/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAdminAuth, getAdminDb } from "@/firebase-admin.init";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId manquant" },
        { status: 400 }
      );
    }

    await adminAuth.deleteUser(userId);
    await adminDb.collection("users").doc(userId).delete();

    return NextResponse.json({
      success: true,
      message: "Utilisateur supprimé de Firebase Auth et Firestore",
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}