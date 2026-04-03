"use client"; 

import { useRouter } from "next/navigation";

export default function StartPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black text-white p-8">
      <h1 className="text-5xl font-bold mb-6 text-cyan-400">FaceCheck</h1>
      <p className="text-gray-400 text-lg max-w-md text-center mb-10">
        Système de présence automatisé par IA pour étudiants et enseignants.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/auth/login")}
          className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl hover:opacity-90 transition"
        >
          Se connecter
        </button>


      </div>
    </div>
  );
}