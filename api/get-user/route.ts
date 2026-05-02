import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
// initialise admin si pas encore fait
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId } = body; 
        const data = await admin.auth().getUser(userId)

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}