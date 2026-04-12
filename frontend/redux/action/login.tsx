import { auth } from "@/filebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export const signin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  const user = userCredential.user;

  // token Firebase
  const accessToken = await user.getIdToken();

  // stockage localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
}

  return { user, accessToken };
};