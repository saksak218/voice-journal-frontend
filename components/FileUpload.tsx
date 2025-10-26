"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import api from "@/lib/api";

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("daily");
  const [customCategory, setCustomCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/mp3",
        "audio/m4a",
        "audio/ogg",
        "audio/webm",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError(
          "Invalid file type. Please upload an audio file (.mp3, .wav, .m4a, .ogg, .webm)"
        );
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        setError("File is too large. Maximum size is 10MB.");
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("title", title || file.name);
      formData.append("category", category);

      if (category === "custom" && customCategory) {
        formData.append("customCategory", customCategory);
      }

      const response = await api.post("/audio/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        // Reset form
        setFile(null);
        setTitle("");
        setCategory("daily");
        setCustomCategory("");
        setUploadProgress(0);

        // Clear file input
        const fileInput = document.getElementById(
          "audio-file"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        onUploadSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload audio");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow p-6 rounded-lg">
      <h3 className="mb-4 font-semibold text-gray-900 text-lg">
        📤 Upload Audio File
      </h3>

      {error && (
        <div className="bg-red-50 mb-4 px-4 py-3 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block mb-2 font-medium text-gray-700 text-sm">
            Select Audio File
          </label>
          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block hover:file:bg-blue-100 file:bg-blue-50 file:mr-4 file:px-4 file:py-2 file:border-0 file:rounded-md w-full file:font-semibold text-gray-500 file:text-blue-700 text-sm file:text-sm"
          />
          <p className="mt-1 text-gray-500 text-xs">
            Supported formats: MP3, WAV, M4A, OGG, WebM (Max 10MB)
          </p>
        </div>

        {/* Show selected file */}
        {file && (
          <div className="bg-blue-50 px-4 py-3 border border-blue-200 rounded text-blue-700">
            <p className="text-sm">
              <strong>Selected:</strong> {file.name} (
              {(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          </div>
        )}

        {/* Title Input */}
        <div>
          <label className="block mb-1 font-medium text-gray-700 text-sm">
            Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your audio a title..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block mb-1 font-medium text-gray-700 text-sm">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value="daily">Daily Journal</option>
            <option value="best-moments">Best Moments</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Custom Category Input */}
        {category === "custom" && (
          <div>
            <label className="block mb-1 font-medium text-gray-700 text-sm">
              Custom Category Name
            </label>
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter category name..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="bg-gray-200 rounded-full w-full h-2">
              <div
                className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || uploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-md w-full font-medium text-white disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload Audio"}
        </button>
      </form>
    </div>
  );
}
