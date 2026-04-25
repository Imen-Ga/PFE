/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/filebase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { addCurrentUserInfo } from "@/redux/slice/authSlice";
import { signin } from "@/redux/action/login";
export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
async function login(e: any) {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  setFeedback(null);
  if (!email || !password) {
    setFeedback({ type: "error", text: "Veuillez remplir tous les champs" });
    return;
  }
  try {
    setIsLoading(true);
    const userCredential = await signin({ email, password });
    if(userCredential.accessToken){
        const uid = userCredential.user.uid;
        const docRef = doc(db, "users", uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
            if(userDoc.data()){

                const userData = userDoc.data();
                dispatch(addCurrentUserInfo({
                  password: password,
                  email: userCredential.user.email,
                  ...userData,
                  createdAt: userData.createdAt?.toDate
                    ? userData.createdAt.toDate().toISOString()
                    : (typeof userData.createdAt === "string" ? userData.createdAt : null),
                }));
                localStorage.setItem("uid", uid);
                localStorage.setItem("accessToken", userCredential.accessToken );
                if(userDoc.data().role === "Admin"){
                    router.push("/admin");
                }else if(userDoc.data().role === "Enseignant"){
                    router.push("/teacher");
                }else if(userDoc.data().role === "Etudiant"){
                    router.push("/student");
                }
                else{
                    setFeedback({
                      type: "error",
                      text: "Acces refuse: seuls les comptes administrateur peuvent se connecter ici. Role detecte: " + userDoc.data().role,
                    });
                }
            } 
        }            
    } else {
        setFeedback({ type: "error", text: "Erreur de connexion: token d'accès manquant." });
}

  } catch (error) {
    console.error(error);
    setFeedback({ type: "error", text: "Erreur de connexion" });
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
          {feedback && (
            <p
              className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                feedback.type === "error"
                  ? "border-red-400/40 bg-red-500/10 text-red-200"
                  : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {feedback.text}
            </p>
          )}
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