"use client";
import { db } from "@/filebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

type UserOption = {
    id: string;
    username: string;
    role: string;
};

export default function Dashboard() {
    const [users, setUsers] = useState<UserOption[]>([]);
    const [responsable, setResponsable] = useState("");
    const [participants, setParticipants] = useState("");

    useEffect(() => {
        const loadUsers = async () => {
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = usersSnapshot.docs.map((userDoc) => {
                const data = userDoc.data() as { username?: string; role?: string };
                return {
                    id: userDoc.id,
                    username: data.username || "Sans nom",
                    role: data.role || "",
                };
            });

            setUsers(usersData);
        };

        loadUsers().catch((error) => {
            console.error("Erreur lors du chargement des utilisateurs:", error);
        });
    }, []);

    const teacherUsers = users.filter((user) => {
        const normalizedRole = user.role.trim().toLowerCase();
        return normalizedRole === "enseignant" || normalizedRole === "teacher";
    });
    const studentUsers = users.filter((user) => {
        const normalizedRole = user.role.trim().toLowerCase();
        return normalizedRole === "etudiant" || normalizedRole === "student";
    });
    const addSeance = async ({
        name,
        date,
        heurededebut,
        heuredefin,
        responsable,
        participants,
    }: {
        name: string;
        date: string;
        heurededebut: string;
        heuredefin: string;
        responsable: string;
        participants: string[];
    }) => {
        try {
            await addDoc(collection(db, "seance"), {
                seanceName: name,
                date,
                heure_de_debut: heurededebut,
                heure_de_fin: heuredefin,
                responsable,
                participants,
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

        const name = (form.elements.namedItem("nomseance") as HTMLInputElement)?.value;
        const date = (form.elements.namedItem("date") as HTMLInputElement)?.value;
        const heurededebut = (form.elements.namedItem("heurededebut") as HTMLInputElement)?.value;
        const heuredefin = (form.elements.namedItem("heuredefin") as HTMLInputElement)?.value;
        const responsable = (form.elements.namedItem("responsable") as HTMLInputElement)?.value;
        const participantsValues = participants;

        if (!name || !date || !heurededebut || !heuredefin || !responsable || !participantsValues) {
            alert("Veuillez remplir tous les champs");
            return;
        }

        const result = await addSeance({
            name,
            date,
            heurededebut,
            heuredefin,
            responsable,
            participants: [participantsValues],
        });

        if (result.success) {
            alert("Séance ajoutée avec succès");
            form.reset();
            setResponsable("");
            setParticipants("");
            return;
        }

        alert(result.error || "Erreur lors de l'ajout de l'utilisateur");
    };

    return (
        <div
            className="min-h-screen text-white flex items-center justify-center p-4 md:p-8"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(11, 15, 26, 0.8), rgba(2, 6, 23, 0.8)), url('/gifs/presence.gif')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="w-full max-w-md">
                <div className="bg-[#111827] p-6 md:p-8 rounded-2xl w-full shadow-2xl border border-gray-800 flex flex-col">
                    <h2 className="text-center text-2xl font-semibold mb-2">Ajouter une seance</h2>
                    <p className="text-center text-gray-400 mb-6">Remplissez les informations de la seance</p>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="nomseance"
                            placeholder="Nom de la séance"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                        />
                        <input
                                type="date"
                                name="date"
                                className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                            />
                        <input
                            type="time"
                            name="heurededebut"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                        />
                        <input
                            type="time"
                            name="heuredefin"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                        />
                        <select
                            value={responsable}
                            onChange={(e) => setResponsable(e.target.value)}
                            name="responsable"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                        >
                            <option value="" disabled>
                                Selectionner un responsable
                            </option>
                            {teacherUsers.map((user) => (
                                <option key={user.id} value={user.username}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                        <select
                            value={participants}
                            onChange={(e) => setParticipants(e.target.value)}
                            name="participants"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                        >
                            <option value="" disabled>
                                Selectionner les participants
                            </option>
                            {studentUsers.map((user) => (
                                <option key={user.id} value={user.username}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition"
                        >
                            Ajouter seance
                        </button>
                        <Link
                            href="/admin/seance"
                            className="block w-full mt-3 py-3 rounded-lg bg-linear-to-r from-emerald-400 to-cyan-500 hover:opacity-90 transition text-center"
                        >
                            Voir tableau des seances
                        </Link>

                        <Link
                            href="/admin"
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