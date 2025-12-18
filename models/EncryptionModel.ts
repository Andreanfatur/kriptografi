import { initDatabase } from "@/lib/initDb";

export class EncryptionModel {
  static async create(data: {
    encryptedAESKey: string;
    iv: string;
    publicKey: string;
    privateKey: string;
    fileName: string;
  }) {
    const pool = await initDatabase();

    const result = await pool.query(
      `INSERT INTO encryption_keys
       (encrypted_aes_key, iv, public_key, private_key, file_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.encryptedAESKey,
        data.iv,
        data.publicKey,
        data.privateKey,
        data.fileName,
      ]
    );

    return result.rows[0];
  }
}
