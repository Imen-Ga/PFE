"use client";

import { db } from "@/filebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function VerifyLogin({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // Auto-redirect only on authentication pages, except login/forget-pass.
        if (!pathname.startsWith("/auth") || pathname === "/auth/login" || pathname === "/auth/forget-pass") {
          return;
        }

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          return;
        }

        const uid = localStorage.getItem("uid");
        if (!uid) {
          return;
        }

        const userDoc = await getDoc(doc(db, "users", uid));
        if (!userDoc.exists()) {
          return;
        }

        const userData = userDoc.data();
        let targetPath = "";

        if (userData?.role === "Admin") {
          targetPath = "/admin";
        } else if (userData?.role === "Enseignant") {
          targetPath = "/teacher";
        } else if (userData?.role === "Etudiant") {
          targetPath = "/student";
        }

        // Avoid redirect loop when already in the correct role area.
        if (targetPath && !pathname.startsWith(targetPath)) {
          router.replace(targetPath);
        }
      } catch (error) {
        console.error("Failed to verify access", error);
      }
    };

    void verifyAccess();
  }, [pathname, router]);

  return <>{children}</>;
}
