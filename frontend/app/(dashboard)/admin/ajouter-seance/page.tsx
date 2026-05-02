"use client";
import { MultiSelect } from "@/compoenents/MultiSelect";
import { db } from "@/filebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserOption = {
    id: string;
    username: string;
    role: string;
    email?: string;
};

// ✅ type utilisé par MultiSelect
type SelectedUser = {
    username: string;
    email: string;
};

export default function Dashboard() {
    const [users, setUsers] = useState<UserOption[]>([]);

    // ✅ FIX ICI
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
        };

        loadUsers().catch(console.error);
    }, []);

    const teacherUsers = users.filter((u) =>
        ["enseignant", "teacher"].includes(u.role.trim().toLowerCase())
    );

    const studentUsers = users.filter((u) =>
        ["etudiant", "student"].includes(u.role.trim().toLowerCase())
    );

    const addSeance = async (data: any) => {
        try {
            await addDoc(collection(db, "seance"), {
                seanceName: data.name,
                date: data.date,
                heure_de_debut: data.heurededebut,
                heure_de_fin: data.heuredefin,

                // ✅ on garde ton concept (username + email)
                responsable: data.responsable,
                participants: data.participants,

                createdAt: new Date(),
            });

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

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

        const responsableValue = responsable[0];
        const participantsValues = participants;

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

            const result = await addSeance({
                name,
                date,
                heurededebut,
                heuredefin,
                responsable: responsableValue,
                participants: participantsValues,
            });

            if (result.success) {
                setFeedback({ type: "success", text: "Séance ajoutée avec succès" });
                form.reset();
                setResponsable([]);
                setParticipants([]);
            } else {
                setFeedback({ type: "error", text: result.error || "Erreur lors de l'ajout" });
            }

        } catch (error) {
            console.error(error);
            setFeedback({ type: "error", text: "Erreur serveur" });

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden text-white bg-[#020617]">
            <iframe
                src="/admin/seance"
                title="Tableau des seances"
                className="absolute inset-0 h-full w-full pointer-events-none"
            />

            <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-[2px]" />

            <div className="relative z-10 min-h-screen flex justify-end"
                onClick={() => router.push("/admin/seance")}
            >
                <aside
                    className="w-full md:max-w-xl min-h-screen bg-[#111827]/95 border-l border-gray-700 shadow-2xl p-6 md:p-8 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-2xl font-semibold mb-2">Ajouter une séance</h2>
                    <p className="text-gray-400 mb-6">Remplissez les informations</p>

                    {feedback && (
                        <p className={`mb-4 px-3 py-2 rounded-lg text-sm border ${
                            feedback.type === "error"
                                ? "border-red-400/40 bg-red-500/10 text-red-200"
                                : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                        }`}>
                            {feedback.text}
                        </p>
                    )}

                    <form onSubmit={handleSubmit}>
                        <input name="nomseance" placeholder="Nom de la séance"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg"
                        />

                        <input type="date" name="date" min={minDate}
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg"
                        />

                        <input type="time" name="heurededebut"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg"
                        />

                        <input type="time" name="heuredefin"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg"
                        />

                        <MultiSelect
                            options={teacherUsers}
                            selected={responsable}
                            onChange={(value) =>
                                setResponsable(value.length > 1 ? [value[value.length - 1]] : value)
                            }
                            placeholder="Responsable"
                        />

                        <MultiSelect
                            options={studentUsers}
                            selected={participants}
                            onChange={setParticipants}
                            placeholder="Participants"
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Ajout en cours..." : "Ajouter séance"}
                        </button>

                        <Link
                            href="/admin"
                            className="block w-full text-center py-3 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10"
                        >
                            Fermer
                        </Link>
                    </form>
                </aside>
            </div>
        </div>
    );
}