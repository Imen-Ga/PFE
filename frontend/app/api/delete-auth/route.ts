/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminAuth } from "@/firebase-admin.init";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;
    console.log("userId ",userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: "userId manquant" },
        { status: 400 }
      );
    }

    await adminAuth.deleteUser(userId);

    return NextResponse.json({
      success: true,
      message: "Utilisateur supprimé de Firebase Auth",
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}