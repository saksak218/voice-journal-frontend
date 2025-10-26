// app/login/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please provide email and password");
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="space-y-8 w-full max-w-md">
        <div>
          <h2 className="mt-6 font-extrabold text-gray-900 text-3xl text-center">
            Sign in to your account
          </h2>
          <p className="mt-2 text-gray-600 text-sm text-center">
            Welcome back to Voice Journal
          </p>
        </div>

        <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 px-4 py-3 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4 shadow-sm rounded-md">
            <div>
              <label
                htmlFor="email"
                className="block mb-1 font-medium text-gray-700 text-sm"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block relative px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-blue-500 w-full text-gray-900 sm:text-sm appearance-none placeholder-gray-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-1 font-medium text-gray-700 text-sm"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block relative px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-blue-500 w-full text-gray-900 sm:text-sm appearance-none placeholder-gray-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full font-medium text-white text-sm disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
