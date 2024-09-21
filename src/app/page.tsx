"use client";

import React, { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setVideoInfo(null);

    try {
      const response = await fetch(
        `/api/youtube-info?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch video info");
      }
      const data = await response.json();
      setVideoInfo(data);
    } catch (err) {
      setError(
        `An error occurred while fetching video information: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (videoInfo) {
      try {
        const response = await fetch(
          `/api/youtube-download?url=${encodeURIComponent(url)}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to download video");
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${videoInfo.title}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
      } catch (err) {
        setError(
          `An error occurred while downloading the video: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        YouTube Downloader
      </h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <button
          type="submit"
          disabled={loading || !url}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
        >
          {loading ? "Loading..." : "Get Video Info"}
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {videoInfo && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">{videoInfo.title}</h2>
          <img
            src={videoInfo.thumbnailUrl}
            alt={videoInfo.title}
            className="w-full mb-4"
          />
          <p className="mb-4">{videoInfo.description}</p>
          <button
            onClick={handleDownload}
            className="w-full bg-green-500 text-white p-2 rounded"
          >
            Download Video
          </button>
        </div>
      )}
    </main>
  );
}
