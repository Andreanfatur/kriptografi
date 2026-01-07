// models/EncryptionModel.ts
import { initDatabase } from "@/lib/initDb";

export const EncryptionModel = {
  findOne: async (criteria: { iv: string }) => {
    const pool = await initDatabase();
    const result = await pool.query(
      "SELECT * FROM encryption_keys WHERE iv = $1 LIMIT 1",
      [criteria.iv]
    );
    return result.rows[0] || null;
  },
  
  create: async (data: any) => {
    const pool = await initDatabase();
    const query = `
      INSERT INTO encryption_keys (encrypted_aes_key, iv, public_key, private_key, file_name)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [
      data.encryptedAESKey,
      data.iv,
      data.publicKey,
      data.privateKey,
      data.fileName
    ];
    return await pool.query(query, values);
  }
};