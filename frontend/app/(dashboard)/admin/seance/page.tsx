"use client";

import { db } from "@/filebase";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

type SeanceRow = {
    id: string;
    seanceName: string;
    date: string;
    heure_de_debut: string;
    heure_de_fin: string;
    responsable: string;
    participants: string[];
};

type PageMessage = {
    type: "success" | "error";
    text: string;
};

export default function SeanceTable() {
    const [seances, setSeances] = useState<SeanceRow[]>([]);
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
        const loadSeances = async () => {
            try {
                const seanceSnapshot = await getDocs(collection(db, "seance"));
                const seanceData = seanceSnapshot.docs.map((seanceDoc) => {
                    const data = seanceDoc.data() as {
                        seanceName?: string;
                        date?: string;
                        heure_de_debut?: string;
                        heure_de_fin?: string;
                        responsable?: string;
                        participants?: string[];
                    };

                    return {
                        id: seanceDoc.id,
                        seanceName: data.seanceName || "-",
                        date: data.date || "-",
                        heure_de_debut: data.heure_de_debut || "-",
                        heure_de_fin: data.heure_de_fin || "-",
                        responsable: data.responsable || "-",
                        participants: Array.isArray(data.participants) ? data.participants : [],
                    };
                });

                setSeances(seanceData);
            } catch (error) {
                console.error(error);
                setMessage({ type: "error", text: "Erreur lors du chargement des seances" });
            } finally {
                setIsLoading(false);
            }
        };

        loadSeances();
    }, []);

    const handleFieldChange = (
        seanceId: string,
        field: "seanceName" | "date" | "heure_de_debut" | "heure_de_fin" | "responsable",
        value: string,
    ) => {
        setSeances((prev) =>
            prev.map((seance) => (seance.id === seanceId ? { ...seance, [field]: value } : seance)),
        );
    };

    const handleParticipantsChange = (seanceId: string, value: string) => {
        const participants = value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        setSeances((prev) => prev.map((seance) => (seance.id === seanceId ? { ...seance, participants } : seance)));
    };

    const handleSaveSeance = async (seance: SeanceRow) => {
        if (!seance.seanceName || !seance.date || !seance.heure_de_debut || !seance.heure_de_fin || !seance.responsable) {
            setMessage({ type: "error", text: "Tous les champs obligatoires doivent etre remplis" });
            return;
        }

        const selectedDate = new Date(`${seance.date}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            setMessage({ type: "error", text: "La date de la seance ne peut pas etre dans le passe" });
            return;
        }

        const [startHour, startMinute] = seance.heure_de_debut.split(":").map(Number);
        const [endHour, endMinute] = seance.heure_de_fin.split(":").map(Number);
        const startInMinutes = startHour * 60 + startMinute;
        const endInMinutes = endHour * 60 + endMinute;

        if (endInMinutes < startInMinutes) {
            setMessage({ type: "error", text: "L'heure de fin doit etre superieure ou egale a l'heure de debut" });
            return;
        }

        try {
            setIsSavingById((prev) => ({ ...prev, [seance.id]: true }));

            await updateDoc(doc(db, "seance", seance.id), {
                seanceName: seance.seanceName,
                date: seance.date,
                heure_de_debut: seance.heure_de_debut,
                heure_de_fin: seance.heure_de_fin,
                responsable: seance.responsable,
                participants: seance.participants,
            });

            setMessage({ type: "success", text: "Seance modifiee" });
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Erreur lors de la modification de la seance" });
        } finally {
            setIsSavingById((prev) => ({ ...prev, [seance.id]: false }));
        }
    };

    const handleDeleteSeance = async (seance: SeanceRow) => {
        const isConfirmed = window.confirm(`Supprimer la seance ${seance.seanceName} ?`);
        if (!isConfirmed) return;

        try {
            setIsDeletingById((prev) => ({ ...prev, [seance.id]: true }));
            await deleteDoc(doc(db, "seance", seance.id));
            setSeances((prev) => prev.filter((item) => item.id !== seance.id));
            setMessage({ type: "success", text: "Seance supprimee" });
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Erreur lors de la suppression de la seance" });
        } finally {
            setIsDeletingById((prev) => ({ ...prev, [seance.id]: false }));
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-10 text-white bg-linear-to-br from-[#0b0f1a] via-[#0f172a] to-[#020617]">
            <div className="max-w-6xl mx-auto bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold">Liste des seances</h1>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/ajouter-seance"
                            className="px-4 py-2 rounded-lg bg-linear-to-r from-emerald-400 to-cyan-500 hover:opacity-90 transition"
                        >
                            Ajouter seance
                        </Link>
                        <Link
                            href="/admin"
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
                ) : seances.length === 0 ? (
                    <p className="text-gray-400">Aucune seance trouvee.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="text-cyan-300 border-b border-gray-700">
                                    <th className="py-3 pr-4">Nom de la seance</th>
                                    <th className="py-3 pr-4">Date</th>
                                    <th className="py-3 pr-4">Heure debut</th>
                                    <th className="py-3 pr-4">Heure fin</th>
                                    <th className="py-3 pr-4">Responsable</th>
                                    <th className="py-3 pr-4">Participants</th>
                                    <th className="py-3 pr-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seances.map((seance) => (
                                    <tr key={seance.id} className="border-b border-gray-800 text-gray-200">
                                        <td className="py-3 pr-4">
                                            <input
                                                value={seance.seanceName}
                                                onChange={(e) => handleFieldChange(seance.id, "seanceName", e.target.value)}
                                                className="w-44 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <input
                                                type="date"
                                                value={seance.date}
                                                onChange={(e) => handleFieldChange(seance.id, "date", e.target.value)}
                                                className="w-40 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <input
                                                type="time"
                                                value={seance.heure_de_debut}
                                                onChange={(e) => handleFieldChange(seance.id, "heure_de_debut", e.target.value)}
                                                className="w-32 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <input
                                                type="time"
                                                value={seance.heure_de_fin}
                                                onChange={(e) => handleFieldChange(seance.id, "heure_de_fin", e.target.value)}
                                                className="w-32 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <input
                                                value={seance.responsable}
                                                onChange={(e) => handleFieldChange(seance.id, "responsable", e.target.value)}
                                                className="w-40 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <input
                                                value={seance.participants.join(", ")}
                                                onChange={(e) => handleParticipantsChange(seance.id, e.target.value)}
                                                className="w-56 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveSeance(seance)}
                                                    disabled={!!isSavingById[seance.id]}
                                                    className="px-4 py-2 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {isSavingById[seance.id] ? "Enregistrement..." : "Enregistrer"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteSeance(seance)}
                                                    disabled={!!isDeletingById[seance.id]}
                                                    className="px-4 py-2 rounded-lg border border-red-400 text-red-300 hover:bg-red-400/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {isDeletingById[seance.id] ? "Suppression..." : "Supprimer"}
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
