"use client";

import { useState } from "react";

export default function DecryptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [iv, setIv] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !iv) return alert("Pilih file dan masukkan IV!");

    setLoading(true);
    const formData = new FormData();
    formData.append("video", file);
    formData.append("iv", iv.trim());

    try {
      const res = await fetch("/api/decrypt-download", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal dekripsi");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Video Restorer
        </h1>

        <form onSubmit={handleDecrypt} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File Terenkripsi (.dat)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input IV (Kunci Akses)
            </label>
            <textarea
              value={iv}
              onChange={(e) => setIv(e.target.value)}
              placeholder="Tempel IV di sini..."
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono h-24"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Mendekripsi & Mengambil Kunci..." : "Dekripsi Video"}
          </button>
        </form>

        {videoUrl && (
          <div className="mt-8 space-y-4 animate-in fade-in duration-500">
            <div className="p-1 bg-black rounded-xl overflow-hidden shadow-lg">
              <video src={videoUrl} controls className="w-full" />
            </div>
            <a
              href={videoUrl}
              download="decrypted_video.mp4"
              className="block text-center w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
            >
              Simpan Video ke Galeri
            </a>
          </div>
        )}
      </div>
    </div>
  );
}