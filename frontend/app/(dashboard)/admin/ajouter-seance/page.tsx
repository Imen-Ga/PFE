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

export default function Dashboard() {
    const [users, setUsers] = useState<UserOption[]>([]);
    const [responsable, setResponsable] = useState("");
    const [participants, setParticipants] = useState("");
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();

    const todayLocal = new Date();
    const minDate = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(
        todayLocal.getDate(),
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
                    email: data.email || userDoc.id,
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
            console.log(participants)
            await addDoc(collection(db, "seance"), {
                seanceName: name,
                date,
                heure_de_debut: heurededebut,
                heure_de_fin: heuredefin,
                responsable,
                participants: participants[0],
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
        setFeedback(null);

        const name = (form.elements.namedItem("nomseance") as HTMLInputElement)?.value;
        const date = (form.elements.namedItem("date") as HTMLInputElement)?.value;
        const heurededebut = (form.elements.namedItem("heurededebut") as HTMLInputElement)?.value;
        const heuredefin = (form.elements.namedItem("heuredefin") as HTMLInputElement)?.value;
        const responsable = (form.elements.namedItem("responsable") as HTMLInputElement)?.value;
        const participantsValues = participants;

        if (!name || !date || !heurededebut || !heuredefin || !responsable || !participantsValues) {
            setFeedback({ type: "error", text: "Veuillez remplir tous les champs" });
            return;
        }

        const selectedDate = new Date(`${date}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            setFeedback({ type: "error", text: "La date de la seance ne peut pas être dans le passé." });
            return;
        }

        // Vérification heure de début dans le passé si la date est aujourd'hui
        if (selectedDate.getTime() === today.getTime()) {
            const now = new Date();
            const [startHour, startMinute] = heurededebut.split(":").map(Number);
            const startInMinutes = startHour * 60 + startMinute;
            const nowInMinutes = now.getHours() * 60 + now.getMinutes();
            if (startInMinutes < nowInMinutes) {
                setFeedback({ type: "error", text: "L'heure de début doit être postérieure à l'heure actuelle." });
                return;
            }
        }

        const [startHour, startMinute] = heurededebut.split(":").map(Number);
        const [endHour, endMinute] = heuredefin.split(":").map(Number);
        const startInMinutes = startHour * 60 + startMinute;
        const endInMinutes = endHour * 60 + endMinute;

        if (endInMinutes < startInMinutes) {
            setFeedback({ type: "error", text: "L'heure de fin doit etre superieure ou egale a l'heure de debut." });
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
            setFeedback({ type: "success", text: "Seance ajoutee avec succes" });
            form.reset();
            setResponsable("");
            setParticipants("");
            return;
        }

        setFeedback({ type: "error", text: result.error || "Erreur lors de l'ajout de l'utilisateur" });
    };

    return (
        <div className="relative min-h-screen overflow-hidden text-white bg-[#020617]">
            <iframe
                src="/admin/seance"
                title="Tableau des seances"
                className="absolute inset-0 h-full w-full pointer-events-none"
            />
            <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-[2px]" />

            <div
                className="relative z-10 min-h-screen flex justify-end"
                onClick={() => router.push("/admin/seance")}
            >
                <aside
                    className="w-full md:max-w-xl min-h-screen bg-[#111827]/95 border-l border-gray-700 shadow-2xl p-6 md:p-8 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-2xl font-semibold mb-2">Ajouter une seance</h2>
                    <p className="text-gray-400 mb-6">Remplissez les informations de la seance</p>

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
                            type="text"
                            name="nomseance"
                            placeholder="Nom de la séance"
                            className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                        />
                        <input
                                type="date"
                                name="date"
                            min={minDate}
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
                                <option key={user.id} value={user.id}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                        {/* <select
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
                        </select> */}
                        <MultiSelect
                            options={studentUsers}
                            selected={participants }
                            onChange={ setParticipants}
                            placeholder="Selectionner les participants"
                        />
                        <button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition"
                        >
                            Ajouter seance
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