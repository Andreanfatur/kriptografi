import { NextResponse } from "next/server";
import { decryptVideo } from "@/lib/decryption";
import { EncryptionModel } from "@/models/EncryptionModel";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File;
    const ivInput = formData.get("iv") as string; // IV yang dimasukkan user di frontend

    if (!file || !ivInput) {
      return NextResponse.json(
        { error: "File video dan IV wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Cari metadata di DB berdasarkan IV (sebagai Identifier)
    const keyRecord = await EncryptionModel.findOne({ iv: ivInput.trim() });

    if (!keyRecord) {
      return NextResponse.json(
        { error: "IV tidak ditemukan. Pastikan IV benar atau video sudah terdaftar." },
        { status: 404 }
      );
    }

    // 2. Baca file yang di-upload ke dalam buffer
    const encryptedVideoBuffer = Buffer.from(await file.arrayBuffer());

    // 3. Jalankan proses Hybrid Decryption
    const decryptedBuffer = await decryptVideo(
      encryptedVideoBuffer,
      keyRecord.encrypted_aes_key, // Dari DB
      keyRecord.iv,                // Dari DB (cocok dengan input)
      keyRecord.private_key        // Dari DB
    );

    // 4. Kirim balik sebagai stream video agar bisa diputar/didownload
    return new NextResponse(decryptedBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="decrypted_video.mp4"`,
        "Content-Length": decryptedBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Decryption Route Error:", error);
    return NextResponse.json(
      { error: "Gagal mendekripsi video. File mungkin korup atau IV salah." },
      { status: 500 }
    );
  }
}