"use client";
import { auth, db } from "@/filebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
export default function Dashboard() {
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

        const result = await addUser({ email, password, role, username, birthdate, phoneNbr });

        if (result.success) {
            alert("Utilisateur ajoute avec succes");
            form.reset();
            return;
        }

        alert(result.error || "Erreur lors de l'ajout de l'utilisateur");
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
                <h2 className="text-cyan-400 text-xl mb-6">PrésenceFacile</h2>
                <h1 className="text-5xl font-bold leading-tight">
                   interface <br />
                    <span className="text-cyan-400">Administrateur</span>
                </h1>
                <p className="text-gray-400 mt-6 max-w-md">
                    Créez des comptes utilisateurs .
                </p>
            </div>

            <div className="w-1/2 flex items-center justify-center">
                <div className="bg-[#111827] p-8 rounded-2xl w-100 shadow-2xl border border-gray-800 flex flex-col">
                    <h2 className="text-center text-2xl font-semibold mb-2">Ajouter un utilisateur</h2>
                    <p className="text-center text-gray-400 mb-6">Remplissez les informations du nouveau compte</p>

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
                            placeholder="Numéro de téléphone"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                        />

                        <button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition"
                        >
                            Ajouter utilisateur
                        </button>
                        <Link
                            href="/admin/users"
                            className="block w-full mt-3 py-3 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition text-center"
                        >
                            Voir le tableau des utilisateurs
                        </Link>
                        <Link
                            href="/"
                            className="block w-full mt-3 py-3 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition text-center"
                        >
                            Retour accueil
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}