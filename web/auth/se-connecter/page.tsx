"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SeConnecterPage() {
  const [role, setRole] = useState<"student" | "teacher">("student");

  // lire rôle depuis localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (savedRole === "teacher" || savedRole === "student") {
      setRole(savedRole);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black text-white p-8">
      <h1 className="text-2xl mb-6">
        {role === "student" ? "Espace Étudiant" : "Espace Enseignant"}
      </h1>

      {/* 🎓 Étudiant */}
      {role === "student" && (
        <div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-800 p-4 rounded-xl">Total: 42</div>
            <div className="bg-green-600 p-4 rounded-xl">Présent: 38</div>
            <div className="bg-red-600 p-4 rounded-xl">Absent: 4</div>
            <div className="bg-blue-600 p-4 rounded-xl">Taux: 90%</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl">
            <p>✔ 15 Dec - Présent</p>
            <p>❌ 14 Dec - Absent</p>
          </div>
        </div>
      )}

      {/* 👨‍🏫 Enseignant */}
      {role === "teacher" && (
        <div>
          <div className="bg-gray-800 p-4 rounded-xl">
            <p>Ahmed - Présent</p>
            <p>Sara - Absent</p>
          </div>
        </div>
      )}

      <Link
        href="/"
        className="inline-block mt-8 px-5 py-2 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition"
      >
        Retour a l'accueil
      </Link>
    </div>
  );
}