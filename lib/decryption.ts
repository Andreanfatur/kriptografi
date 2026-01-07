export async function decryptVideo(
  encryptedVideo: Buffer,
  encryptedAESKey: string,
  ivBase64: string,
  privateKeyBase64: string
) {
  // 1. Import Private Key (RSA) dari format PKCS8
  const privateKeyBuffer = Buffer.from(privateKeyBase64, "base64");
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );

  // 2. Dekripsi Kunci AES (Wrapped Key) menggunakan RSA Private Key
  const encryptedAESKeyBuffer = Buffer.from(encryptedAESKey, "base64");
  const aesKeyRaw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedAESKeyBuffer
  );

  // 3. Import AES Key mentah agar bisa digunakan untuk dekripsi data
  const aesKey = await crypto.subtle.importKey(
    "raw",
    aesKeyRaw,
    { name: "AES-GCM" },
    true,
    ["decrypt"]
  );

  // 4. Dekripsi Video menggunakan AES-GCM dan IV yang diberikan
  const iv = new Uint8Array(Buffer.from(ivBase64, "base64"));
  const dataToDecrypt = new Uint8Array(encryptedVideo);

  const decryptedVideo = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    dataToDecrypt // Sekarang bertipe Uint8Array, bukan Buffer mentah
  );

  return Buffer.from(decryptedVideo);
}