"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgetPass() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  function forgetPass() {
    if (!email) {
      alert("Veuillez entrer votre email");
      return;
    }
    alert("Code envoyé à: " + email);
    router.push("/auth/reset-password");
  }

  return (
    <div className="flex min-h-screen text-white bg-gradient-to-br from-[#0b0f1a] via-[#0f172a] to-[#020617]">

      {/* LEFT */}
      <div className="w-1/2 p-10 flex flex-col justify-center">
        <h2 className="text-cyan-400 text-xl mb-6">FaceCheck</h2>

        <h1 className="text-5xl font-bold leading-tight">
          Mot de passe <br />
          <span className="text-cyan-400">oublié</span>
        </h1>

        <p className="text-gray-400 mt-6 max-w-md">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-6 mt-10">
          <div className="p-5 bg-[#111827] rounded-xl border border-gray-800">
            <h3>Sécurisé</h3>
            <p className="text-gray-400 text-sm">Protection avancée</p>
          </div>
          <div className="p-5 bg-[#111827] rounded-xl border border-gray-800">
            <h3>Rapide</h3>
            <p className="text-gray-400 text-sm">Réinitialisation immédiate</p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="bg-[#111827] p-8 rounded-2xl w-[400px] shadow-2xl border border-gray-800">

          <h2 className="text-center text-2xl font-semibold mb-2">
            Reset Password
          </h2>

          <p className="text-center text-gray-400 mb-6">
            Entrez votre email
          </p>

          {/* INPUT */}
          <input
            type="email"
            placeholder="exemple@email.com"
            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* BUTTON */}
          <button
            onClick={forgetPass}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition mb-4"
          >
            Envoyer
          </button>

          {/* BACK */}
          <p
            onClick={() => router.push("/auth/login")}
            className="text-center text-cyan-400 cursor-pointer"
          >
            Retour à la connexion
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full mt-4 py-3 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition"
          >
            Retour a l'accueil
          </button>

        </div>
      </div>

    </div>
  );
}
