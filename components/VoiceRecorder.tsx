"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";

interface VoiceRecorderProps {
  onUploadSuccess: () => void;
}

export default function VoiceRecorder({ onUploadSuccess }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("daily");
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError("");

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please allow microphone access.");
    }
  };

  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setTitle("");
    setError("");
    chunksRef.current = [];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleUpload = async () => {
    if (!audioBlob) {
      setError("Please record audio first");
      return;
    }

    // Check duration (max 5 minutes = 300 seconds)
    if (recordingTime > 300) {
      setError("Recording is too long. Maximum duration is 5 minutes.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();

      const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: audioBlob.type,
      });

      formData.append("audio", audioFile);
      formData.append(
        "title",
        title || `Recording ${new Date().toLocaleString()}`
      );
      formData.append("category", category);

      if (category === "custom" && customCategory) {
        formData.append("customCategory", customCategory);
      }

      const response = await api.post("/audio/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        discardRecording();
        setCategory("daily");
        setCustomCategory("");
        onUploadSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload audio");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow p-6 rounded-lg">
      <h3 className="mb-4 font-semibold text-gray-900 text-lg">
        🎤 Record Voice Journal
      </h3>

      {error && (
        <div className="bg-red-50 mb-4 px-4 py-3 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Recording Controls */}
        {!audioBlob ? (
          <div className="flex flex-col items-center space-y-4">
            {/* Timer Display */}
            {isRecording && (
              <div className="text-center">
                <div className="font-mono font-bold text-gray-900 text-4xl">
                  {formatTime(recordingTime)}
                </div>
                <div className="mt-1 text-gray-500 text-sm">
                  {recordingTime > 270 ? (
                    <span className="font-semibold text-red-600">
                      ⚠️ {300 - recordingTime} seconds remaining
                    </span>
                  ) : (
                    "Recording..."
                  )}
                </div>
              </div>
            )}

            {/* Recording Button */}
            <div className="flex justify-center items-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="bg-red-600 hover:bg-red-700 shadow-lg p-6 rounded-full text-white hover:scale-105 transition-all"
                  title="Start Recording"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                <>
                  {!isPaused ? (
                    <button
                      onClick={pauseRecording}
                      className="bg-yellow-500 hover:bg-yellow-600 shadow-lg p-4 rounded-full text-white transition-all"
                      title="Pause"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="bg-green-500 hover:bg-green-600 shadow-lg p-4 rounded-full text-white transition-all"
                      title="Resume"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={stopRecording}
                    className="bg-gray-800 hover:bg-gray-900 shadow-lg p-4 rounded-full text-white transition-all"
                    title="Stop & Save"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {!isRecording && (
              <p className="text-gray-500 text-sm text-center">
                Click the microphone to start recording
                <br />
                Maximum duration: 5 minutes
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Playback Section */}
            <div className="bg-green-50 p-4 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-green-700">
                  ✅ Recording Complete
                </span>
                <span className="text-gray-600 text-sm">
                  Duration: {formatTime(recordingTime)}
                </span>
              </div>

              <audio controls src={audioUrl || undefined} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>

            {/* Title Input */}
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your recording a title..."
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

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-md font-medium text-white disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload Recording"}
              </button>
              <button
                onClick={discardRecording}
                disabled={uploading}
                className="hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Discard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
