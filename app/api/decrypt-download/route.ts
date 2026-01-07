import { NextResponse } from "next/server";
import { decryptVideo } from "@/lib/decryption";
import { initDatabase } from "@/lib/initDb"; // Import inisialisasi pool

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File;
    const ivInput = formData.get("iv") as string;

    if (!file || !ivInput) {
      return NextResponse.json({ error: "File dan IV diperlukan" }, { status: 400 });
    }

    // 1. Inisialisasi koneksi DB (Gunakan Singleton jika memungkinkan)
    const pool = await initDatabase();

    // 2. Query ke PostgreSQL untuk mencari data berdasarkan IV
    const result = await pool.query(
      "SELECT encrypted_aes_key, iv, private_key FROM encryption_keys WHERE iv = $1 LIMIT 1",
      [ivInput.trim()]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "IV tidak ditemukan di database" }, { status: 404 });
    }

    const keyRecord = result.rows[0];
    const encryptedVideoBuffer = Buffer.from(await file.arrayBuffer());

    // 3. Dekripsi
    const decryptedBuffer = await decryptVideo(
      encryptedVideoBuffer,
      keyRecord.encrypted_aes_key, // nama kolom di DB sesuai initDb.ts Anda
      keyRecord.iv,
      keyRecord.private_key
    );

    return new NextResponse(decryptedBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="decrypted_video.mp4"`,
      },
    });
  } catch (error: any) {
    console.error("Decryption Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}