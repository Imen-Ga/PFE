"use client";

import { db } from "@/filebase";
import { deleteUserAuth } from "@/functions";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import Link from "next/link";
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

export default function UsersTablePage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingById, setIsSavingById] = useState<Record<string, boolean>>({});
    const [isDeletingById, setIsDeletingById] = useState<Record<string, boolean>>({});
    const [message, setMessage] = useState<PageMessage | null>(null);

    useEffect(() => {
        if (!message) return;

        const timeoutId = window.setTimeout(() => {
            setMessage(null);
        }, 3500);

        return () => window.clearTimeout(timeoutId);
    }, [message]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                const usersData = usersSnapshot.docs.map((userDoc) => {
                    const data = userDoc.data() as {
                        email?: string;
                        username?: string;
                        role?: string;
                        phoneNbr?: string;
                        birthDate?: string;
                        password?: string;
                    };

                    return {
                        id: userDoc.id,
                        email: data.email || "-",
                        username: data.username || "-",
                        role: data.role || "-",
                        phoneNbr: data.phoneNbr || "-",
                        birthDate: data.birthDate || "-",
                        password: data.password || "-",
                    };
                });

                setUsers(usersData);
            } catch (error) {
                console.error(error);
                setMessage({ type: "error", text: "Erreur lors du chargement des utilisateurs" });
            } finally {
                setIsLoading(false);
            }
        };

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

    const handleSaveUser = async (user: UserRow) => {
        try {
            setIsSavingById((prev) => ({ ...prev, [user.id]: true }));

            await setDoc(
                doc(db, "users", user.id),
                {
                    username: user.username,
                    role: user.role,
                    phoneNbr: user.phoneNbr,
                    birthDate: user.birthDate,
                    
                },
                { merge: true },
            );

            setMessage({ type: "success", text: "Informations utilisateur mises a jour" });
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Erreur lors de la mise a jour de l'utilisateur" });
        } finally {
            setIsSavingById((prev) => ({ ...prev, [user.id]: false }));
        }
    };

    const handleDeleteUser = async (user: UserRow) => {
        const isConfirmed = window.confirm(`Supprimer l'utilisateur ${user.username} ?`);
        if (!isConfirmed) return;

        try {
            setIsDeletingById((prev) => ({ ...prev, [user.id]: true }));

            await deleteDoc(doc(db, "users", user.id));

            await fetch("/api/users/delete-auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: user.id }),
            });

            setUsers((prevUsers) => prevUsers.filter((item) => item.id !== user.id));
            setMessage({ type: "success", text: "Utilisateur supprimé" });
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Erreur lors de la suppression de l'utilisateur" });
        } finally {
            setIsDeletingById((prev) => ({ ...prev, [user.id]: false }));
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-10 text-white bg-linear-to-br from-[#0b0f1a] via-[#0f172a] to-[#020617]">
            <div className="max-w-6xl mx-auto bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold">Tableau des utilisateurs</h1>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="px-4 py-2 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition"
                        >
                            Retour admin
                        </Link>
                        <Link
                            href="/"
                            className="px-4 py-2 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition"
                        >
                            Retour accueil
                        </Link>
                    </div>
                </div>

                {message && (
                    <div
                        className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                            message.type === "success"
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
                                    <th className="py-3 pr-4">Mot de passe</th>
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
                                            <input
                                                value={user.role}
                                                onChange={(e) => handleFieldChange(user.id, "role", e.target.value)}
                                                className="w-32 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
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
                                            <input
                                                value={user.password}
                                                onChange={(e) => handleFieldChange(user.id, "password", e.target.value)}
                                                className="w-40 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleSaveUser(user)}
                                                disabled={!!isSavingById[user.id]}
                                                className="px-4 py-2 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {isSavingById[user.id] ? "Enregistrement..." : "Enregistrer"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={!!isDeletingById[user.id]}
                                                className="px-4 py-2 rounded-lg border border-red-400 text-red-300 hover:bg-red-400/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {isDeletingById[user.id] ? "Suppression..." : "Supprimer"}
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
        </div>
    );
}
