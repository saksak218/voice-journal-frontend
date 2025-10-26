// app/register/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { register } = useAuth();

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

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password
    );

    if (!result.success) {
      setError(result.error || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="space-y-8 w-full max-w-md">
        <div>
          <h2 className="mt-6 font-extrabold text-gray-900 text-3xl text-center">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600 text-sm text-center">
            Start recording your voice journals today
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
                htmlFor="name"
                className="block mb-1 font-medium text-gray-700 text-sm"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="block relative px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-blue-500 w-full text-gray-900 sm:text-sm appearance-none placeholder-gray-500"
                placeholder="John Doe"
              />
            </div>

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
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block mb-1 font-medium text-gray-700 text-sm"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block relative px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-blue-500 w-full text-gray-900 sm:text-sm appearance-none placeholder-gray-500"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full font-medium text-white text-sm disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
