import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center bg-gray-900 p-4 min-h-screen">
      <div className="space-y-6 bg-gray-800 shadow-2xl p-8 rounded-xl w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="flex justify-center items-center bg-indigo-600 rounded-full w-16 h-16">
            <span className="font-bold text-white text-3xl">🎤</span>
          </div>
        </div>

        <h1 className="font-extrabold text-white text-3xl">
          Welcome to <span className="text-indigo-400">Voice Journal</span>
        </h1>
        <p className="mb-8 text-gray-400">Your Personal Voice Journal</p>

        <Button
          className="bg-indigo-600 hover:bg-indigo-700 focus:ring-opacity-50 shadow-md px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full font-semibold text-white hover:scale-[1.02] transition duration-300 cursor-pointer transform"
          aria-label="Login to the voice journal"
        >
          <Link href="/login">Login to the voice journal</Link>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="border-gray-700 border-t w-full"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-800 px-2 text-gray-500">OR</span>
          </div>
        </div>

        <Button
          asChild
          className="focus:ring-opacity-50 px-4 py-3 border border-indigo-400 hover:border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full font-semibold text-indigo-400 hover:text-indigo-300 transition duration-300"
          aria-label="Sign up for a new account"
        >
          <Link href="/register">Sign up</Link>
        </Button>
      </div>
    </div>
  );
}
