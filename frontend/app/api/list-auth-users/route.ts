import { NextResponse } from "next/server";
import { getAdminAuth } from "@/firebase-admin.init";

export async function GET() {
  try {
    const auth = getAdminAuth();
    const users: { uid: string; email: string | null }[] = [];
    let nextPageToken: string | undefined;

    do {
      const result = await auth.listUsers(1000, nextPageToken);
      result.users.forEach((userRecord) => {
        users.push({ uid: userRecord.uid, email: userRecord.email });
      });
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
