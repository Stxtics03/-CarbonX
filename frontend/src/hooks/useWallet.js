// src/hooks/useWallet.js
import { useState, useCallback } from "react";

function generateWalletId() {
  const seg = (n) =>
    Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  return `0x${seg(8)}-${seg(4)}-${seg(4)}-${seg(4)}-${seg(12)}`;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function useWallet(initialUser) {
  const [walletId, setWalletId] = useState(initialUser?.walletId || generateWalletId());
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState([]);

  const regenerateWallet = useCallback(() => setWalletId(generateWalletId()), []);
  const copyWalletId = useCallback(() => {
    navigator.clipboard.writeText(walletId).catch(() => {});
  }, [walletId]);

  /**
   * uploadFiles(files, onComplete?)
   *
   * Simulates an upload + IPFS anchoring for each file.
   * Once a file reaches 100% and the 600ms settle delay passes,
   * the completed media entry is added to state AND onComplete(entry)
   * is called — so AdminDashboard can award credits and log history
   * without needing to know anything about the upload internals.
   *
   * onComplete is optional; if omitted the hook works exactly as before.
   */
  const uploadFiles = useCallback((files, onComplete) => {
    const valid = [...files].filter(
      (f) =>
        (f.type.startsWith("image/") || f.type.startsWith("video/")) &&
        f.size <= 52428800
    );

    valid.forEach((file) => {
      const id       = `${Date.now()}_${Math.random()}`;
      const url      = URL.createObjectURL(file);
      const isImage  = file.type.startsWith("image/");

      // Pre-generate blockchain metadata so onComplete receives a complete entry
      const blockHash = `0x${Array.from({ length: 16 }, () =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)]
      ).join("")}`;

      const ipfsHash = `Qm${Array.from({ length: 20 }, () =>
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789"[
          Math.floor(Math.random() * 58)
        ]
      ).join("")}`;

      const entry = {
        id,
        name:      file.name,
        type:      isImage ? "image" : "video",
        url,
        size:      file.size,
        sizeLabel: formatSize(file.size),
        gps:       `${(13.0 + Math.random()).toFixed(4)}°N, ${(77.5 + Math.random()).toFixed(4)}°E`,
        timestamp: new Date().toISOString(),
        blockHash,
        ipfsHash,
      };

      // Register in uploading list
      setUploading((prev) => [...prev, { id, name: file.name, progress: 0 }]);

      // Simulate incremental progress
      let pct = 0;
      const interval = setInterval(() => {
        pct = Math.min(pct + Math.random() * 20 + 8, 100);
        setUploading((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: Math.floor(pct) } : u))
        );

        if (pct >= 100) {
          clearInterval(interval);

          // Short settle delay (simulates IPFS anchoring)
          setTimeout(() => {
            // Remove from uploading queue
            setUploading((prev) => prev.filter((u) => u.id !== id));

            // Add to media library
            setMediaFiles((prev) => [...prev, entry]);

            // Notify AdminDashboard — credits + history are handled there
            if (typeof onComplete === "function") {
              onComplete(entry);
            }
          }, 600);
        }
      }, 120);
    });
  }, []);

  const deleteMedia = useCallback((id) => {
    setMediaFiles((prev) => {
      const found = prev.find((m) => m.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const stats = {
    photos:  mediaFiles.filter((m) => m.type === "image").length,
    videos:  mediaFiles.filter((m) => m.type === "video").length,
    storage: formatSize(mediaFiles.reduce((s, m) => s + m.size, 0)),
  };

  return {
    walletId,
    regenerateWallet,
    copyWalletId,
    mediaFiles,
    uploading,
    uploadFiles,
    deleteMedia,
    stats,
  };
}