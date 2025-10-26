// components/AudioList.tsx
"use client";

import { useState } from "react";
import { AudioJournal } from "@/types/audio";
import api from "@/lib/api";

interface AudioListProps {
  audios: AudioJournal[];
  onDelete: () => void;
}

export default function AudioList({ audios, onDelete }: AudioListProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this audio journal?")) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/audio/${id}`);
      onDelete();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete audio");
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "daily":
        return "bg-blue-100 text-blue-800";
      case "best-moments":
        return "bg-green-100 text-green-800";
      case "custom":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (audios.length === 0) {
    return (
      <div className="bg-white shadow p-12 rounded-lg text-center">
        <div className="mb-4 text-6xl">🎤</div>
        <h3 className="mb-2 font-semibold text-gray-900 text-xl">
          No audio journals yet
        </h3>
        <p className="text-gray-600">
          Start by recording or uploading your first voice journal!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {audios.map((audio) => (
        <div
          key={audio._id}
          className="bg-white shadow hover:shadow-md p-6 rounded-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-gray-900 text-lg">
                {audio.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-gray-600 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(
                    audio.category
                  )}`}
                >
                  {audio.category === "custom" && audio.customCategory
                    ? audio.customCategory
                    : audio.category.replace("-", " ")}
                </span>
                <span>•</span>
                <span>{formatDate(audio.createdAt)}</span>
                <span>•</span>
                <span>{formatFileSize(audio.fileSize)}</span>
                {audio.duration > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(audio.duration)}</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => handleDelete(audio._id)}
              disabled={deletingId === audio._id}
              className="disabled:opacity-50 ml-4 text-red-600 hover:text-red-800"
              title="Delete"
            >
              {deletingId === audio._id ? (
                <span className="text-sm">Deleting...</span>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Audio Player */}
          <div className="mt-4">
            <audio
              controls
              className="w-full"
              preload="metadata"
              onPlay={() => setPlayingId(audio._id)}
              onPause={() => setPlayingId(null)}
            >
              <source src={audio.fileUrl} type={`audio/${audio.format}`} />
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* File Info */}
          <div className="mt-3 text-gray-500 text-xs">
            <span className="font-medium">Format:</span>{" "}
            {audio.format.toUpperCase()} •
            <span className="ml-2 font-medium">Filename:</span> {audio.fileName}
          </div>
        </div>
      ))}
    </div>
  );
}
