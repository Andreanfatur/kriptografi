import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Nama file tidak ditemukan" },
        { status: 400 }
      );
    }

    // 🔐 Proteksi path traversal
    const safeFileName = path.basename(file);

    const filePath = path.join(
      process.cwd(),
      "storage",
      "encrypted",
      safeFileName
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal download file" },
      { status: 500 }
    );
  }
}
