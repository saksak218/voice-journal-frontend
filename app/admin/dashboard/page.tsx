"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface AdminStats {
  totalUsers: number;
  totalAudios: number;
  totalStorageBytes: number;
  totalStorageGB: string;
  storageCostUSD: string;
  totalDurationSeconds: number;
  avgDurationSeconds: number;
  formatStats: Array<{
    _id: string;
    count: number;
    totalSize: number;
  }>;
  categoryStats: Array<{
    _id: string;
    count: number;
  }>;
}

interface UserActivity {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  audioCount: number;
  totalStorageBytes: number;
  totalStorageMB: string;
}

export default function AdminPage() {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/dashboard");
    } else if (isAdmin) {
      fetchStats();
      fetchUsers();
    }
  }, [loading, isAdmin, router]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await api.get("/admin/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get("/admin/users");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading || loadingStats) {
    return (
      <div className="flex justify-center items-center bg-gray-50 min-h-screen">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
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
                👨‍💼 Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium text-white text-sm"
              >
                User Dashboard
              </button>
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
          {/* Main Statistics */}
          <div className="mb-8">
            <h2 className="mb-4 font-bold text-gray-900 text-2xl">Overview</h2>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white shadow p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="font-bold text-gray-900 text-2xl">
                      {stats?.totalUsers || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">Total Audio Files</p>
                    <p className="font-bold text-gray-900 text-2xl">
                      {stats?.totalAudios || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">Storage Used</p>
                    <p className="font-bold text-gray-900 text-2xl">
                      {stats?.totalStorageGB || "0.00"} GB
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">Estimated Cost</p>
                    <p className="font-bold text-gray-900 text-2xl">
                      ${stats?.storageCostUSD || "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-2 mb-8">
            {/* Format Statistics */}
            <div className="bg-white shadow p-6 rounded-lg">
              <h3 className="mb-4 font-semibold text-gray-900 text-lg">
                Audio Formats
              </h3>
              {stats?.formatStats && stats.formatStats.length > 0 ? (
                <div className="space-y-3">
                  {stats.formatStats.map((format) => (
                    <div
                      key={format._id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 text-sm uppercase">
                          {format._id}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          {format.count} files
                        </p>
                        <p className="text-gray-500 text-xs">
                          {(format.totalSize / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No data available</p>
              )}
            </div>

            {/* Category Statistics */}
            <div className="bg-white shadow p-6 rounded-lg">
              <h3 className="mb-4 font-semibold text-gray-900 text-lg">
                Categories
              </h3>
              {stats?.categoryStats && stats.categoryStats.length > 0 ? (
                <div className="space-y-3">
                  {stats.categoryStats.map((category) => (
                    <div
                      key={category._id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 text-sm capitalize">
                          {category._id.replace("-", " ")}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          {category.count} files
                        </p>
                        <p className="text-gray-500 text-xs">
                          {(
                            (category.count / (stats?.totalAudios || 1)) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No data available</p>
              )}
            </div>
          </div>

          {/* Duration Stats */}
          <div className="bg-white shadow mb-8 p-6 rounded-lg">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">
              Audio Duration Stats
            </h3>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Total Duration</p>
                <p className="font-bold text-blue-900 text-xl">
                  {formatDuration(stats?.totalDurationSeconds || 0)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Average Duration</p>
                <p className="font-bold text-green-900 text-xl">
                  {formatDuration(stats?.avgDurationSeconds || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-gray-200 border-b">
              <h3 className="font-semibold text-gray-900 text-lg">
                User Activity
              </h3>
            </div>
            <div className="overflow-x-auto">
              {loadingUsers ? (
                <div className="p-6 text-gray-500 text-center">
                  Loading users...
                </div>
              ) : (
                <table className="divide-y divide-gray-200 min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                        Audio Files
                      </th>
                      <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                        Storage Used
                      </th>
                      <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {user.name}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                          {user.audioCount}
                        </td>
                        <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                          {user.totalStorageMB} MB
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
