import { NextResponse } from "next/server";
import { getAdminAuth } from "@/firebase-admin.init";
// initialise admin si pas encore fait
export async function POST(req: Request) {
    try {
                const auth = getAdminAuth(); // IMPORTANT
        const body = await req.json();
        const { userId } = body; 
        const data = await auth.getUser(userId)

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}