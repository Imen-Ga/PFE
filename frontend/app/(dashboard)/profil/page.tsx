"use client";
import { db } from "@/filebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const currentUser = useSelector((state: any) => state.auth.userInfo);

  const createAdmin = async () => {
    if (!currentUser?.uid) return;

    try {
      await setDoc(doc(db, "users", currentUser.uid), {
        name: currentUser.displayName || "No name",
        email: currentUser.email,
        role: currentUser.role,
        date: serverTimestamp(),
      }, { merge: true });

      // REDIRECTION ICI
      router.push("/dashboard/profil"); 
      // ou "/dashboard"
      
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Teacher Dashboard</h1>

      <button onClick={createAdmin}>
        Create Profile
      </button>
      <div className="mt-4">
        <Link href="/" className="text-cyan-400">
          Retour a l'accueil
        </Link>
      </div>
    </div>
  );
};