/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");

  function login(e: any) {
    e.preventDefault();
    if (!email || !pwd) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    // sauvegarder le rôle
    localStorage.setItem("role", role);
    
    // rediriger selon rôle
    if (role === "student") {
      router.push("/auth/se-connecter"); // page dashboard étudiant
    } else {
      router.push("/auth/se-connecter"); // page dashboard enseignant
    }
  }

  return (
    <div className="flex min-h-screen text-white bg-linear-to-br from-[#0b0f1a] via-[#0f172a] to-[#020617]">

      {/* LEFT: présentation */}
      <div className="w-1/2 p-10 flex flex-col justify-center">
        <h2 className="text-cyan-400 text-xl mb-6">FaceCheck</h2>
        <h1 className="text-5xl font-bold leading-tight">
          Reconnaissance Faciale <br />
          <span className="text-cyan-400">Intelligente</span>
        </h1>
        <p className="text-gray-400 mt-6 max-w-md">
          Système de présence automatisé par IA pour étudiants et enseignants.
          Sécurisé, rapide et précis.
        </p>
      </div>

      {/* RIGHT: formulaire login */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="bg-[#111827] p-8 rounded-2xl w-100 shadow-2xl border border-gray-800 flex flex-col">

          <h2 className="text-center text-2xl font-semibold mb-2">Connexion</h2>
          <p className="text-center text-gray-400 mb-6">
            Accédez à votre espace sécurisé
          </p>

          {/* Boutons Étudiant / Enseignant */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRole("student")}
              className={`flex-1 py-2 rounded-lg ${
                role === "student"
                  ? "bg-linear-to-r from-cyan-500 to-purple-500"
                  : "bg-gray-700"
                }`}
                >
              Étudiant
            </button>

            <button
              onClick={() => setRole("teacher")}
              className={`flex-1 py-2 rounded-lg ${
                role === "teacher"
                  ? "bg-linear-to-r from-cyan-500 to-purple-500"
                  : "bg-gray-700"
                }`}
                >
              Enseignant
            </button>
          </div>

          {/* Inputs */}
          <form onSubmit={login}>
          <input
            type="email"
            placeholder="exemple@email.com"
            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="••••••••"
            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
            onChange={(e) => setPwd(e.target.value)}
            />

          {/* Checkbox / Mot de passe oublié */}
          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <label>
              <input type="checkbox" className="mr-2" />
              Se souvenir
            </label>
            <span
              onClick={() => router.push("/auth/forget-pass")}
              className="text-cyan-400 cursor-pointer"
              >
              Mot de passe oublié?
            </span>
          </div>

          {/* Bouton login */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition mb-4"
          >
            Se connecter
          </button>
          </form>
          <p className="text-center text-gray-400 mt-4 text-sm">
            Pas encore de compte ?
            <span className="text-cyan-400 cursor-pointer"> Créer un compte</span>
          </p>

        </div>
      </div>
    </div>
  );
}