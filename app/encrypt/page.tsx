"use client";

import { useState } from "react";

export default function EncryptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadFile, setDownloadFile] = useState("");
  const [iv, setIv] = useState("");
  const [copied, setCopied] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert("Pilih video terlebih dahulu");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("video", file);
    

    try {
      const res = await fetch("/api/encrypt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal enkripsi");
      }

      setMessage(data.message);
      setDownloadFile(data.file);
      setIv(data.iv); // ← SIMPAN IV

    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
    
  };
  const copyIV = async () => {
      if (!iv) return;

      await navigator.clipboard.writeText(iv);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">
          Enkripsi Video (AES + RSA)
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) =>
              setFile(e.target.files ? e.target.files[0] : null)
            }
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Mengenkripsi..." : "Enkripsi Video"}
          </button>
        </form>
        {iv && (
          <div className="mt-4 bg-gray-100 p-3 rounded">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold">
                Key untuk deskripsi video
              </p>

              <button
                onClick={copyIV}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <p className="text-xs break-all text-gray-700">
              {iv}
            </p>
          </div>
        )}

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">
            {message}
          </p>
        )}

        {downloadFile && (
          <a
            href={`/api/download?file=${downloadFile}`}
            className="block mt-4 text-center bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Download Video Terenkripsi
          </a>
        )}
        
      </div>
    </div>
  );
}
