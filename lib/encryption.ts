export async function encryptVideo(buffer: Buffer) {
  // AES-256-GCM
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedVideo = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    buffer
  );

  // RSA-2048
  const rsaKey = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);

  const encryptedAESKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    rsaKey.publicKey,
    rawAesKey
  );

  return {
    encryptedVideo: Buffer.from(encryptedVideo),
    encryptedAESKey: Buffer.from(encryptedAESKey).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
    publicKey: Buffer.from(
      await crypto.subtle.exportKey("spki", rsaKey.publicKey)
    ).toString("base64"),
    privateKey: Buffer.from(
      await crypto.subtle.exportKey("pkcs8", rsaKey.privateKey)
    ).toString("base64"),
  };
}
