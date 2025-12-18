import { NextResponse } from "next/server";
import { encryptVideo } from "@/lib/encryption";
import { EncryptionModel } from "@/models/EncryptionModel";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("video") as File;

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await encryptVideo(buffer);

  const fileName = `${Date.now()}_encrypted.dat`;
  const filePath = path.join(process.cwd(), "storage", "encrypted", fileName);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, result.encryptedVideo);

  await EncryptionModel.create({
    encryptedAESKey: result.encryptedAESKey,
    iv: result.iv,
    publicKey: result.publicKey,
    privateKey: result.privateKey,
    fileName,
  });

  return NextResponse.json({
    message: "Video berhasil dienkripsi",
    file: fileName,
    iv: result.iv,
  });
}
