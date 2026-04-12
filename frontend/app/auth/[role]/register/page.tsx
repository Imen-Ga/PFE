"use client";

import { auth, db } from "@/filebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const param = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const addUser = async ({
    email,
    password,
    role,
    username,
    birthdate,
    phoneNbr,
  }: {
    email: string;
    password: string;
    role: string;
    username: string;
    birthdate: string;
    phoneNbr: string;
  }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        password,
        username,
        birthDate: birthdate,
        role,
        phoneNbr,
        createdAt: new Date(),
      });

      return { success: true };
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;
    const role = (form.elements.namedItem("role") as HTMLSelectElement)?.value;
    const username = (form.elements.namedItem("username") as HTMLInputElement)?.value;
    const birthdate = (form.elements.namedItem("birthdate") as HTMLInputElement)?.value;
    const phoneNbr = (form.elements.namedItem("phoneNbr") as HTMLInputElement)?.value;

    if (!email || !password || !role || !username || !birthdate || !phoneNbr) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      setIsLoading(true);
      const result = await addUser({ email, password, role, username, birthdate, phoneNbr });

      if (result.success) {
        alert("Compte cree avec succes");
        form.reset();
        router.push(`/auth/${String(param.role || "student-teacher")}/login`);
        return;
      }

      alert(result.error || "Erreur lors de la creation du compte");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(11, 15, 26, 0.8), rgba(2, 6, 23, 0.8)), url('/gifs/presence.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-1/2 p-10 flex flex-col justify-center">
        <h2 className="text-cyan-400 text-xl mb-6">PresenceFacile</h2>
        <h1 className="text-5xl font-bold leading-tight">
          Creer un <br />
          <span className="text-cyan-400">compte utilisateur</span>
        </h1>
        <p className="text-gray-400 mt-6 max-w-md">
          Remplissez les informations pour creer un nouveau compte.
        </p>
      </div>

      <div className="w-1/2 flex items-center justify-center">
        <div className="bg-[#111827] p-8 rounded-2xl w-100 shadow-2xl border border-gray-800 flex flex-col">
          <h2 className="text-center text-2xl font-semibold mb-2">Creer un compte</h2>
          <p className="text-center text-gray-400 mb-6">
            Les champs sont similaires a la page d&apos;ajout admin
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="exemple@email.com"
              className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
            />
            <select
              name="role"
              defaultValue=""
              className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
            >
              <option value="" disabled>
                Selectionner un role
              </option>
              <option value="Student">Etudiant</option>
              <option value="Teacher">Enseignant</option>
            </select>
            <input
              type="text"
              name="username"
              placeholder="Nom complet"
              className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
            />
            <input
              type="text"
              name="birthdate"
              placeholder="12-12-2000"
              className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
            />
            <input
              type="tel"
              name="phoneNbr"
              placeholder="Numero de telephone"
              className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creation en cours..." : "Creer un compte"}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/auth/${String(param.role || "student-teacher")}/login`)}
              className="w-full mt-3 py-3 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition"
            >
              Retour a la connexion
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
