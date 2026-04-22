/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/filebase";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { signin } from "@/redux/action/login";
import { addCurrentUserInfo } from "@/redux/slice/authSlice";
import { useDispatch } from "react-redux";
export default function LoginPage() {
  const router = useRouter();
  const param = useParams();
  console.log("ROLE PARAM:", param.role); // 🔍 DEBUG: vérifier le rôle reçu
  const isStudentTeacherPage = param.role == "etudiant-enseignant";
  const dispatch = useDispatch();
  const [role, setRole] = useState<"etudiant" | "enseignant">("etudiant");
  const [isLoading, setIsLoading] = useState(false);
async function login(e: any) {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  if (!email || !password) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  try {
    setIsLoading(true);
    // 🔐 login Firebase
    const userCredential = await signin({ email, password });

    const uid = userCredential.user.uid;

    // 📥 récupérer données Firestore
    const docRef = doc(db, "users", uid);
    const userDoc = await getDoc(docRef);
    const firestoreRole = String(userDoc.data()?.role || "").trim().toLowerCase();

    const isStudentRole = [ "etudiant"].includes(firestoreRole);
    const isTeacherRole = [ "enseignant"].includes(firestoreRole);

    if (isStudentTeacherPage) {
      if (role === "etudiant" && !isStudentRole) {
        alert("Ce compte n'est pas un compte Etudiant.");
        return;
      }

      if (role === "enseignant" && !isTeacherRole) {
        alert("Ce compte n'est pas un compte Enseignant.");
        return;
      }
    }

    const selectedRoleLabel = role === "enseignant" ? "enseignant" : "etudiant";
    const resolvedRole = param.role == "admin" ? "admin" : selectedRoleLabel;

    // 🧠 stocker dans Redux
    dispatch(addCurrentUserInfo({
      uid: uid,
      email: userCredential.user.email,
      role: resolvedRole || "etudiant",
    }));

    // 🚀 REDIRECTION DYNAMIQUE
    if (isStudentTeacherPage) {
      router.push(role === "enseignant" ? "/teacher" : "/student");
    } else {
      router.push("/admin/users");
    }


  } catch (error) {
    console.error(error);
    alert("Erreur de connexion");
  } finally {
    setIsLoading(false);
  }
}

  return (
    <div
      className="flex min-h-screen text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(11, 15, 26, 0.78), rgba(2, 6, 23, 0.78)), url('/gifs/presence.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >

      {/* LEFT: présentation */}
      <div className="w-1/2 p-10 flex flex-col justify-center">
        <h2 className="text-cyan-400 text-xl mb-6">PrésenceFacile</h2>
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
          { isStudentTeacherPage &&(
          <div className="flex gap-2 mb-4">

            
            <button
              onClick={() => setRole("etudiant")}
              className={`flex-1 py-2 rounded-lg ${
                role === "etudiant"
                  ? "bg-linear-to-r from-cyan-500 to-purple-500"
                  : "bg-gray-700"
                }`}
                >
              Étudiant
            </button>

            <button
              onClick={() => setRole("enseignant")}
              className={`flex-1 py-2 rounded-lg ${
                role === "enseignant"
                  ? "bg-linear-to-r from-cyan-500 to-purple-500"
                  : "bg-gray-700"
                }`}
                >
              Enseignant
            </button>
          </div>
            )
}

          {/* Inputs */}
          <form onSubmit={login}>
          <input
            type="email"
            name="email"
            placeholder="exemple@email.com"
            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
            // onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            name="password"

            placeholder="••••••••"
            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
            // onChange={(e) => setPwd(e.target.value)}
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
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Connexion en cours" : "Se connecter"}
          </button>
          </form>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full mt-4 py-3 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition"
          >
            Retour accueil
          </button>

        </div>
      </div>
    </div>
  );
}