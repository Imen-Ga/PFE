"use client"; 

import { useRouter } from "next/navigation";

export default function StartPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white p-8"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.86), rgba(0, 0, 0, 0.86)), url('/gifs/presence.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1 className="text-6xl font-bold mb-7 text-cyan-400">PrésenceFacile</h1>
      <p className="text-gray-400 text-2xl font-semibold max-w-xl text-center mb-12">
          Système de gestion de présence basé sur la reconnaissance faciale
      </p>

      <div className="flex flex-col">
        <button
          onClick={() => router.push("/auth/login")}
          className="px-10 py-5 my-6 text-1xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl hover:opacity-90 transition"
        >
           Se connecter
        </button>

      </div>
    </div>
  );
}