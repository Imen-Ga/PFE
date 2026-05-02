"use client";

import { MultiSelect } from "@/compoenents/MultiSelect";
import { db } from "@/filebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserOption = {
    id: string;
    username: string;
    role: string;
    email?: string;
};

type SelectedUser = {
    id: string;
    username: string;
    email?: string;
};

export default function AjouterSeance() {
    const [users, setUsers] = useState<UserOption[]>([]);
    const [responsable, setResponsable] = useState<SelectedUser[]>([]);
    const [participants, setParticipants] = useState<SelectedUser[]>([]);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const todayLocal = new Date();
    const minDate = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(
        todayLocal.getDate()
    ).padStart(2, "0")}`;

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                const usersData = usersSnapshot.docs.map((userDoc) => {
                    const data = userDoc.data() as { username?: string; role?: string; email?: string };
                    return {
                        id: userDoc.id,
                        username: data.username || "Sans nom",
                        role: data.role || "",
                        email: data.email || "",
                    };
                });
                setUsers(usersData);
            } catch (error) {
                console.error("Erreur chargement users:", error);
                setFeedback({ type: "error", text: "Erreur chargement des utilisateurs" });
            }
        };
        loadUsers();
    }, []);

    const teacherUsers = users.filter((u) =>
        ["enseignant", "teacher"].includes(u.role.trim().toLowerCase())
    );

    const studentUsers = users.filter((u) =>
        ["etudiant", "student"].includes(u.role.trim().toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setFeedback(null);

        const form = e.currentTarget;
        const name = (form.elements.namedItem("nomseance") as HTMLInputElement)?.value;
        const date = (form.elements.namedItem("date") as HTMLInputElement)?.value;
        const heurededebut = (form.elements.namedItem("heurededebut") as HTMLInputElement)?.value;
        const heuredefin = (form.elements.namedItem("heuredefin") as HTMLInputElement)?.value;
        const responsableValue = responsable[0]?.id;
        const participantsValues = participants.map((p) => p.id);

        try {
            if (!name || !date || !heurededebut || !heuredefin || !responsableValue || participantsValues.length === 0) {
                setFeedback({ type: "error", text: "Veuillez remplir tous les champs" });
                return;
            }

            const selectedDate = new Date(`${date}T00:00:00`);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                setFeedback({ type: "error", text: "La date ne peut pas être dans le passé." });
                return;
            }

            await addDoc(collection(db, "seance"), {
                seanceName: name,
                date: date,
                heure_de_debut: heurededebut,
                heure_de_fin: heuredefin,
                responsable: responsableValue,
                participants: participantsValues,
                createdAt: new Date(),
            });

            setFeedback({ type: "success", text: "Séance ajoutée avec succès" });
            form.reset();
            setResponsable([]);
            setParticipants([]);
            
            // Redirection après 1 seconde
            setTimeout(() => router.push("/admin/seance"), 1000);

        } catch (error: any) {
            console.error(error);
            setFeedback({ type: "error", text: error.message || "Erreur lors de l'ajout" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden text-white bg-[#020617]">
            <iframe
                src="/admin/seance"
                title="Tableau des séances"
                className="absolute inset-0 h-full w-full pointer-events-none"
            />
            <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-[2px]" />

            <div className="relative z-10 min-h-screen flex justify-end">
                <aside
                    className="w-full md:max-w-xl min-h-screen bg-[#111827]/95 border-l border-gray-700 shadow-2xl p-6 md:p-8 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">Ajouter une séance</h2>
                        <button
                            type="button"
                            onClick={() => router.push("/admin/seance")}
                            className="text-gray-400 hover:text-white transition-colors text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {feedback && (
                        <div className={`mb-4 p-3 rounded-lg ${feedback.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {feedback.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <input 
                            name="nomseance" 
                            placeholder="Nom de la séance"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400"
                        />

                        <input 
                            type="date" 
                            name="date" 
                            min={minDate}
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400"
                        />

                        <input 
                            type="time" 
                            name="heurededebut"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400"
                        />

                        <input 
                            type="time" 
                            name="heuredefin"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400"
                        />

                        <div className="mb-4">
                            <MultiSelect
                                options={teacherUsers}
                                selected={responsable}
                                onChange={setResponsable}
                                placeholder="Sélectionner un responsable"
                            />
                        </div>

                        <div className="mb-4">
                            <MultiSelect
                                options={studentUsers}
                                selected={participants}
                                onChange={setParticipants}
                                placeholder="Sélectionner les participants"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Ajout en cours..." : "Ajouter séance"}
                        </button>
                    </form>
                </aside>
            </div>
        </div>
    );
}