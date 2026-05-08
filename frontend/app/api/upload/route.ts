import { writeFile } from "fs/promises";
import path from "path";

// Required for formData() to work in App Router
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const data = await req.formData();
        console.log("DATA:", data);
        const file = data.get("image") as File;
        const email = data.get("email");

        if (!file || file.size === 0) {
            return Response.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filePath = path.join("C:/pfe/images", email + ".jpg");

        await writeFile(filePath, buffer);

        return Response.json({
            success: true,
            filePath: `/images/${email}`,
        });

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        return Response.json({ error: "Upload failed" }, { status: 500 });
    }
}