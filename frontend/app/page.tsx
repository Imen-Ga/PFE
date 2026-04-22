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
      <h1 className="text-5xl font-bold mb-6 text-cyan-400">PrésenceFacile</h1>
      <p className="text-gray-400 text-lg max-w-md text-center mb-10">
        Système de présence automatisé par IA pour étudiants et enseignants.
      </p>

      <div className="flex flex-col">
        <button
          onClick={() => router.push("/auth/admin/login")}
          className="px-6 py-3 my-4 bg-linear-to-r from-cyan-400 to-purple-500 rounded-xl hover:opacity-90 transition"
        >
           Administrateur
        </button>
        <button
          onClick={() => router.push("/auth/etudiant-enseignant/login")}
          className="px-6 py-3 my-4 bg-linear-to-r from-cyan-400 to-purple-500 rounded-xl hover:opacity-90 transition"
        >
          Etudiant/Enseignant
        </button>

      </div>
    </div>
  );
}