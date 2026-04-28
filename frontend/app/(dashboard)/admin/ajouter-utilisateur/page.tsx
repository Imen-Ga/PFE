"use client";
import { auth, db } from "@/filebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddUserPage() {
    const [role, setRole] = useState("Etudiant");
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();

    const addUser = async ({
        email,
        password,
        userrole,
        username,
        birthdate,
        phoneNbr,
    }: {
        email: string;
        password: string;
        userrole: string;
        username: string;
        birthdate: string;
        phoneNbr: string;
    }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                //email,
                //password,
                username,
                birthDate: birthdate,
                role: userrole,
                phoneNbr,
                createdAt: new Date(),
                ...(userrole === "Enseignant" ? { studentIds: [] } : {}),
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
        setFeedback(null);

        const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
        const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;
        const username = (form.elements.namedItem("username") as HTMLInputElement)?.value;
        const birthdate = (form.elements.namedItem("birthdate") as HTMLInputElement)?.value;
        const phoneNbr = (form.elements.namedItem("phoneNbr") as HTMLInputElement)?.value;

        if (!email || !password || !role || !username || !birthdate || !phoneNbr) {
            setFeedback({ type: "error", text: "Veuillez remplir tous les champs" });
            return;
        }

        const result = await addUser({ email, password, userrole: role, username, birthdate, phoneNbr });

        if (result.success) {
            setFeedback({ type: "success", text: "Utilisateur ajoute avec succes" });
            form.reset();
            return;
        }

        setFeedback({ type: "error", text: result.error || "Erreur lors de l'ajout de l'utilisateur" });
    };

    return (
        <div className="relative min-h-screen overflow-hidden text-white bg-[#020617]">
            <iframe
                src="/admin/users"
                title="Tableau des utilisateurs"
                className="absolute inset-0 h-full w-full pointer-events-none"
            />
            <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-[2px]" />

            <div
                className="relative z-10 min-h-screen flex justify-end"
                onClick={() => router.push("/admin/users")}
            >
                <aside
                    className="w-full md:max-w-xl min-h-screen bg-[#111827]/95 border-l border-gray-700 shadow-2xl p-6 md:p-8 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-2xl font-semibold mb-2">Ajouter un utilisateur</h2>
                    <p className="text-gray-400 mb-6">Remplissez les informations du nouveau compte</p>

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
                            placeholder="********"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                        />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            name="role"
                            defaultValue=""
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                        >
                            <option value="" disabled>
                                Selectionner un role
                            </option>
                            <option value="Etudiant">Etudiant</option>
                            <option value="Enseignant">Enseignant</option>
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
                            className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition"
                        >
                            Ajouter utilisateur
                        </button>
                        <Link
                            href="/admin"
                            className="block w-full mt-3 py-3 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition text-center"
                        >
                            Fermer
                        </Link>
                    </form>
                </aside>
            </div>
        </div>
    );
}
