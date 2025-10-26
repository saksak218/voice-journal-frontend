// app/dashboard/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AudioJournal } from "@/types/audio";
import VoiceRecorder from "@/components/VoiceRecorder";
import FileUpload from "@/components/FileUpload";
import AudioList from "@/components/AudioList";

export default function DashboardPage() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [audios, setAudios] = useState<AudioJournal[]>([]);
  const [filteredAudios, setFilteredAudios] = useState<AudioJournal[]>([]);
  const [loadingAudios, setLoadingAudios] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"record" | "upload">("record");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated) {
      fetchAudios();
    }
  }, [loading, isAuthenticated, router]);

  const fetchAudios = async () => {
    try {
      setLoadingAudios(true);
      const response = await api.get("/audio");
      console.log(response);
      setAudios(response.data.data);
      setFilteredAudios(response.data.data);
    } catch (error) {
      console.error("Error fetching audios:", error);
    } finally {
      setLoadingAudios(false);
    }
  };

  // Filter audios when category or search changes
  useEffect(() => {
    let filtered = audios;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (audio) => audio.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((audio) =>
        audio.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAudios(filtered);
  }, [selectedCategory, searchQuery, audios]);

  if (loading || loadingAudios) {
    return (
      <div className="flex justify-center items-center bg-gray-50 min-h-screen">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="font-bold text-gray-900 text-xl">
                🎙️ Voice Journal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              {user.role === "admin" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md font-medium text-white text-sm"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-medium text-white text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="px-4 sm:px-0">
          {/* Stats Summary */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3 mb-6">
            <div className="bg-white shadow p-4 rounded-lg">
              <div className="text-gray-600 text-sm">Total Journals</div>
              <div className="font-bold text-gray-900 text-2xl">
                {audios.length}
              </div>
            </div>
            <div className="bg-white shadow p-4 rounded-lg">
              <div className="text-gray-600 text-sm">Daily Journals</div>
              <div className="font-bold text-blue-600 text-2xl">
                {audios.filter((a) => a.category === "daily").length}
              </div>
            </div>
            <div className="bg-white shadow p-4 rounded-lg">
              <div className="text-gray-600 text-sm">Best Moments</div>
              <div className="font-bold text-green-600 text-2xl">
                {audios.filter((a) => a.category === "best-moments").length}
              </div>
            </div>
          </div>

          {/* Record/Upload Tabs */}
          <div className="mb-6">
            <div className="mb-4 border-gray-200 border-b">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab("record")}
                  className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "record"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  🎤 Record
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "upload"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  📤 Upload File
                </button>
              </div>
            </div>

            {activeTab === "record" ? (
              <VoiceRecorder onUploadSuccess={fetchAudios} />
            ) : (
              <FileUpload onUploadSuccess={fetchAudios} />
            )}
          </div>

          {/* Filters */}
          <div className="bg-white shadow mb-6 p-4 rounded-lg">
            <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search journals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="daily">Daily Journal</option>
                  <option value="best-moments">Best Moments</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audio List */}
          <div>
            <h2 className="mb-4 font-bold text-gray-900 text-xl">
              Your Journals ({filteredAudios.length})
            </h2>
            <AudioList audios={filteredAudios} onDelete={fetchAudios} />
          </div>
        </div>
      </main>
    </div>
  );
}
