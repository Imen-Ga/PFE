"use client";

import { auth, db } from "@/filebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";


type UserRow = {
    id: string;
    email: string;
    username: string;
    role: string;
    phoneNbr: string;
    birthDate: string;
    password: string;
};

type PageMessage = {
    type: "success" | "error";
    text: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
};

export default function UsersTablePage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [originalUsers, setOriginalUsers] = useState<UserRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingById, setIsSavingById] = useState<Record<string, boolean>>({});
    const [isDeletingById, setIsDeletingById] = useState<Record<string, boolean>>({});
    const [message, setMessage] = useState<PageMessage | null>(null);

    // --- Drawer States ---
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [role, setRole] = useState("Etudiant");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!message) return;

        const timeoutId = window.setTimeout(() => {
            setMessage(null);
        }, 3500);

        return () => window.clearTimeout(timeoutId);
    }, [message]);

    // Extrait la fonction de chargement pour pouvoir la réutiliser
    const loadUsers = async () => {
        try {
            // 1. Charger les utilisateurs Firestore
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = usersSnapshot.docs.map((userDoc) => {
                const data = userDoc.data() as {
                    username?: string;
                    role?: string;
                    phoneNbr?: string;
                    birthDate?: string;
                    password?: string;
                };
                return {
                    id: userDoc.id,
                    username: data.username || "-",
                    role: data.role || "-",
                    phoneNbr: data.phoneNbr || "-",
                    birthDate: data.birthDate || "-",
                    password: data.password || "-",
                    email: "-", // sera fusionné ensuite
                };
            });

            // 2. Charger les emails depuis Authentication
            const authRes = await fetch("/api/list-auth-users");
            const authData = await authRes.json();
            const authUsers: { uid: string; email: string | null }[] = authData.users || [];

            // 3. Fusionner les emails dans les users Firestore (par id/uid)
            const mergedUsers = usersData.map((user) => {
                const authUser = authUsers.find((au) => au.uid === user.id);
                return {
                    ...user,
                    email: authUser?.email || user.email,
                };
            });

            setUsers(mergedUsers);
            setOriginalUsers(mergedUsers);
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Erreur lors du chargement des utilisateurs" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleFieldChange = (userId: string, field: keyof Omit<UserRow, "id">, value: string) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId
                    ? {
                        ...user,
                        [field]: value,
                    }
                    : user,
            ),
        );
    };

    // Vérifie si un utilisateur a été modifié
    const isUserModified = (user: UserRow) => {
        const original = originalUsers.find((u) => u.id === user.id);
        if (!original) return false;
        return (
            user.username !== original.username ||
            user.email !== original.email ||
            user.role !== original.role ||
            user.phoneNbr !== original.phoneNbr ||
            user.birthDate !== original.birthDate ||
            user.password !== original.password
        );
    };

    const handleSaveUser = async (user: UserRow) => {
        try {
            setIsSavingById((prev) => ({ ...prev, [user.id]: true }));

            const response = await fetch("/api/update-auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.id,
                    email: user.email,
                    password: user.password,
                    username: user.username,
                    role: user.role,
                    phoneNbr: user.phoneNbr,
                    birthDate: user.birthDate,
                }),
            });

            const result = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(result?.error || "Echec de la mise a jour");
            }

            setMessage({ type: "success", text: "Informations utilisateur mises a jour" });
        } catch (error: unknown) {
            console.error(error);
            setMessage({
                type: "error",
                text: getErrorMessage(error, "Erreur lors de la mise a jour de l'utilisateur"),
            });
        } finally {
            setIsSavingById((prev) => ({ ...prev, [user.id]: false }));
        }
    };

    const handleDeleteUser = async (user: UserRow) => {
        const isConfirmed = window.confirm(`Supprimer l'utilisateur ${user.username} ?`);
        if (!isConfirmed) return;

        try {
            setIsDeletingById((prev) => ({ ...prev, [user.id]: true }));

            const response = await fetch("/api/delete-auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: user.id }),
            });

            const result = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(result?.error || "Echec de la suppression");
            }

            setUsers((prevUsers) => prevUsers.filter((item) => item.id !== user.id));
            setMessage({ type: "success", text: "Utilisateur supprimé" });
        } catch (error: unknown) {
            console.error(error);
            setMessage({
                type: "error",
                text: getErrorMessage(error, "Erreur lors de la suppression de l'utilisateur"),
            });
        } finally {
            setIsDeletingById((prev) => ({ ...prev, [user.id]: false }));
        }
    };

    // --- Ajout d'utilisateur (Drawer) ---
    const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsAdding(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        // Vérification de l'âge pour les étudiants
        if (role === "Etudiant") {
            const birthdateStr = formData.get("birthdate") as string;
            if (birthdateStr) {
                const birthDateObj = new Date(birthdateStr);
                const today = new Date();
                if (birthDateObj > today) {
                    setMessage({ type: "error", text: "La date de naissance ne peut pas être dans le futur." });
                    setIsAdding(false);
                    return;
                }
                let age = today.getFullYear() - birthDateObj.getFullYear();
                const m = today.getMonth() - birthDateObj.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
                    age--;
                }
                if (age < 17) {
                    setMessage({ type: "error", text: "L'étudiant doit avoir au moins 17 ans." });
                    setIsAdding(false);
                    return;
                }
            }
        }

        try {
            let imageUrl = undefined;
            if (role === "Etudiant") {
                // Upload image seulement pour les étudiants
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                if (!uploadRes.ok) {
                    const text = await uploadRes.text();
                    throw new Error(`Upload failed: ${text}`);
                }
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.filePath;
            }

            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            const username = formData.get("username") as string;
            const birthdate = formData.get("birthdate") as string;
            const phoneNbr = formData.get("phoneNbr") as string;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userData: any = {
                username,
                email,
                birthDate: birthdate,
                role,
                phoneNbr,
                status: "absent",
            };
            if (role === "Etudiant") {
                userData.image = imageUrl;
            }

            await setDoc(doc(db, "users", user.uid), userData);

            // Recharger immédiatement la liste des utilisateurs
            await loadUsers();

            setMessage({ type: "success", text: "Utilisateur ajouté avec succès" });
            setIsAddDrawerOpen(false);
            form.reset();
            setShowPassword(false);

        } catch (error) {
            console.error(error);
            setMessage({
                type: "error",
                text: getErrorMessage(error, "Erreur lors de l'ajout de l'utilisateur"),
            });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-10 text-white bg-linear-to-br from-[#0b0f1a] via-[#0f172a] to-[#020617]">
            <div className="max-w-6xl mx-auto bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold">Tableau des utilisateurs</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAddDrawerOpen(true)}
                            className="px-4 py-2 rounded-lg bg-linear-to-r from-emerald-400 to-cyan-500 hover:opacity-90 transition"
                        >
                            Ajouter utilisateur
                        </button>
                    </div>
                </div>

                {message && (
                    <div
                        className={`mb-4 rounded-lg border px-4 py-3 text-sm ${message.type === "success"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-red-500/40 bg-red-500/10 text-red-300"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {isLoading ? (
                    <p className="text-gray-300">Chargement...</p>
                ) : users.length === 0 ? (
                    <p className="text-gray-400">Aucun utilisateur trouve.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="text-cyan-300 border-b border-gray-700">
                                    <th className="py-3 pr-4">Nom</th>
                                    <th className="py-3 pr-4">Email</th>
                                    <th className="py-3 pr-4">Role</th>
                                    <th className="py-3 pr-4">Telephone</th>
                                    <th className="py-3 pr-4">Date naissance</th>
                                    <th className="py-3 pr-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-800 text-gray-200">
                                        <td className="py-3 pr-4">
                                            <input
                                                value={user.username}
                                                onChange={(e) => handleFieldChange(user.id, "username", e.target.value)}
                                                className="w-40 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <input
                                                value={user.email}
                                                onChange={(e) => handleFieldChange(user.id, "email", e.target.value)}
                                                className="w-52 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleFieldChange(user.id, "role", e.target.value)}
                                                className="w-32 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400"
                                            >
                                                <option value="Etudiant">Etudiant</option>
                                                <option value="Enseignant">Enseignant</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <input
                                                value={user.phoneNbr}
                                                onChange={(e) => handleFieldChange(user.id, "phoneNbr", e.target.value)}
                                                className="w-40 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <input
                                                value={user.birthDate}
                                                onChange={(e) => handleFieldChange(user.id, "birthDate", e.target.value)}
                                                className="w-36 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveUser(user)}
                                                    disabled={!!isSavingById[user.id] || !isUserModified(user)}
                                                    className="p-2 rounded-lg bg-cyan-700 hover:bg-cyan-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                    title="Enregistrer"
                                                >
                                                    {isSavingById[user.id] ? (
                                                        <span className="text-xs">...</span>
                                                    ) : (
                                                        <span role="img" aria-label="save">💾</span>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteUser(user)}
                                                    disabled={!!isDeletingById[user.id]}
                                                    className="p-2 rounded-lg bg-red-700 hover:bg-red-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                    title="Supprimer"
                                                >
                                                    {isDeletingById[user.id] ? (
                                                        <span className="text-xs">...</span>
                                                    ) : (
                                                        <span role="img" aria-label="delete">🗑️</span>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- Drawer Overlay --- */}
            {isAddDrawerOpen && (
                <div
                    className="fixed inset-0 bg-[#020617]/60 backdrop-blur-[2px] z-40 transition-opacity"
                    onClick={() => {
                        setIsAddDrawerOpen(false);
                        setShowPassword(false);
                    }}
                />
            )}

            {/* --- Drawer Content --- */}
            <div className={`fixed top-0 right-0 h-full w-full md:max-w-xl bg-[#111827] border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto p-6 md:p-8 ${isAddDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">Ajouter un utilisateur</h2>
                        <p className="text-gray-400 text-sm mt-1">Tous les champs sont obligatoires</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setIsAddDrawerOpen(false);
                            setShowPassword(false);
                        }}
                        className="text-gray-400 hover:text-white transition-colors text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleAddUser} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Adresse email <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="exemple@email.com"
                            className="w-full p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400 text-white"
                            required
                        />
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Mot de passe <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                className="w-full p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400 text-white pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                        />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Rôle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Rôle <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            name="role"
                            className="w-full p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400 text-white"
                            required
                        >
                            <option value="Etudiant">Étudiant</option>
                            <option value="Enseignant">Enseignant</option>
                        </select>
                    </div>

                    {/* Nom complet */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nom complet <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Jean Dupont"
                            className="w-full p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400 text-white"
                            required
                        />
                    </div>

                    {/* Date de naissance */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Date de naissance <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            name="birthdate"
                            className="w-full p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400 text-white"
                            required
                        />
                    </div>

                    {/* Téléphone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Numéro de téléphone <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phoneNbr"
                            placeholder="+33 6 12 34 56 78"
                            className="w-full p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400 text-white"
                            required
                        />
                    </div>

                    {/* Image : seulement pour les étudiants */}
                    {role === "Etudiant" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Photo de profil <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                className="w-full p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Formats acceptés : JPG, PNG, GIF (max 5MB)</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {isAdding ? "Ajout en cours..." : "Ajouter utilisateur"}
                    </button>
                </form>
            </div>
        </div>
    );
}