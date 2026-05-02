import { auth } from "@/filebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export const signin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    if (!user) {
      throw new Error("Utilisateur introuvable");
    }

    const accessToken = await user.getIdToken();

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
    }

    return {
      user: {
        uid: user.uid,
        email: user.email ?? "",
      },
      accessToken,
    };

  } catch (error: any) {
    console.log("SIGNIN ERROR:", error.code, error.message);

    // 👉 renvoyer un message propre au lieu de throw brut
    throw new Error(error.message || "Erreur de connexion");
  }
};