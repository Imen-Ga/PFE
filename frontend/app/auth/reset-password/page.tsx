"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  async function handleReset() {
    setFeedback(null);
    if (!password || !confirmPassword) {
      setFeedback({ type: "error", text: "Veuillez remplir tous les champs." });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (!token) {
      setFeedback({ type: "error", text: "Lien invalide ou expiré." });
      return;
    }
    // Appel API pour réinitialiser le mot de passe
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) {
      setFeedback({ type: "success", text: "Mot de passe modifié avec succès." });
      setTimeout(() => router.push("/auth/login"), 1500);
    } else {
      setFeedback({ type: "error", text: "Erreur lors de la modification." });
    }
  }

  return (
    <div className="flex min-h-screen text-white bg-gradient-to-br from-[#0b0f1a] via-[#0f172a] to-[#020617] items-center justify-center">
      <div className="bg-[#111827] p-8 rounded-2xl w-[400px] shadow-2xl border border-gray-800">
        <h2 className="text-center text-2xl font-semibold mb-2">Nouveau mot de passe</h2>
        <p className="text-center text-gray-400 mb-6">Saisissez votre nouveau mot de passe</p>
        {feedback && (
          <p className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
            feedback.type === "error"
              ? "border-red-400/40 bg-red-500/10 text-red-200"
              : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
          }`}>
            {feedback.text}
          </p>
        )}
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
          onChange={e => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <button
          onClick={handleReset}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition mb-4"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
