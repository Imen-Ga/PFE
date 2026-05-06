"use client";

import { db } from "@/filebase";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MultiSelect } from "@/compoenents/MultiSelect";

type UserRow = {
    id: string;
    username: string;
    role: string;
};

type SeanceRow = {
    id: string;
    seanceName: string;
    date: string;
    heure_de_debut: string;
    heure_de_fin: string;
    responsable: string | any; // Peut être string ou objet
    participants: string[];
};

type PageMessage = {
    type: "success" | "error";
    text: string;
};

type SelectedUser = {
    id: string;
    username: string;
    email?: string;
};

export default function SeanceTable() {
    const [originalSeances, setOriginalSeances] = useState<SeanceRow[]>([]);
    // Pour la sélection multiple à supprimer
    const [selectedToRemove, setSelectedToRemove] = useState<Record<string, string[]>>({});
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [seances, setSeances] = useState<SeanceRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [isSavingById, setIsSavingById] = useState<Record<string, boolean>>({});
    const [isDeletingById, setIsDeletingById] = useState<Record<string, boolean>>({});
    const [message, setMessage] = useState<PageMessage | null>(null);

    // --- Drawer States ---
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [responsable, setResponsable] = useState<SelectedUser[]>([]);
    const [participants, setParticipants] = useState<SelectedUser[]>([]);

    useEffect(() => {
        if (!message) return;
        const timeoutId = window.setTimeout(() => setMessage(null), 3500);
        return () => window.clearTimeout(timeoutId);
    }, [message]);

    useEffect(() => {
        const loadSeancesAndUsers = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                const usersData = usersSnapshot.docs.map((userDoc) => {
                    const data = userDoc.data() as { username?: string; role?: string };
                    return {
                        id: userDoc.id,
                        username: data.username || "-",
                        role: data.role || "",
                    };
                });
                setUsers(usersData);

                const seanceSnapshot = await getDocs(collection(db, "seance"));
                const seanceData = seanceSnapshot.docs.map((seanceDoc) => {
                    const data = seanceDoc.data() as {
                        seanceName?: string;
                        date?: string;
                        heure_de_debut?: string;
                        heure_de_fin?: string;
                        responsable?: string | any;
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
                setOriginalSeances(seanceData);
            } catch (error) {
                console.error(error);
                setMessage({ type: "error", text: "Erreur lors du chargement" });
            } finally {
                setIsLoading(false);
            }
        };
        loadSeancesAndUsers();
    }, []);

    // ✅ Fonction pour extraire le nom du responsable (string ou objet)
    const getResponsableDisplay = (responsable: string | any): string => {
        // Si c'est un objet
        if (typeof responsable === 'object' && responsable !== null) {
            if (responsable.username) return responsable.username;
            if (responsable.id) return responsable.id;
            return "Responsable inconnu";
        }
        // Si c'est un string (ID)
        const user = users.find((u) => u.id === responsable);
        return user ? user.username : responsable;
    };

    // ✅ Fonction pour extraire l'ID du responsable (pour les mises à jour)
    const getResponsableId = (responsable: string | any): string => {
        if (typeof responsable === 'object' && responsable !== null) {
            return responsable.id || "";
        }
        return responsable;
    };

    const handleFieldChange = (
        seanceId: string,
        field: "seanceName" | "date" | "heure_de_debut" | "heure_de_fin" | "responsable",
        value: string,
    ) => {
        setSeances((prev) =>
            prev.map((seance) => (seance.id === seanceId ? { ...seance, [field]: value } : seance))
        );
    };

    // Vérifie si une séance a été modifiée
    const isSeanceModified = (seance: SeanceRow) => {
        const original = originalSeances.find((s) => s.id === seance.id);
        if (!original) return false;
        // Comparer les champs simples
        if (
            seance.seanceName !== original.seanceName ||
            seance.date !== original.date ||
            seance.heure_de_debut !== original.heure_de_debut ||
            seance.heure_de_fin !== original.heure_de_fin ||
            getResponsableId(seance.responsable) !== getResponsableId(original.responsable)
        ) {
            return true;
        }
        // Comparer les participants (ordre et contenu)
        if (seance.participants.length !== original.participants.length) return true;
        for (let i = 0; i < seance.participants.length; i++) {
            if (seance.participants[i] !== original.participants[i]) return true;
        }
        return false;
    };

    // (Plus besoin de handleToggleParticipant, suppression uniquement)

    // Pour cocher/décocher un participant à supprimer
    const handleToggleRemove = (seanceId: string, userId: string) => {
        setSelectedToRemove((prev) => {
            const current = prev[seanceId] || [];
            if (current.includes(userId)) {
                return { ...prev, [seanceId]: current.filter((id) => id !== userId) };
            } else {
                return { ...prev, [seanceId]: [...current, userId] };
            }
        });
    };

    // Pour retirer un ou plusieurs participants sélectionnés
    const handleRemoveSelected = (seanceId: string) => {
        setSeances((prev) =>
            prev.map((seance) =>
                seance.id === seanceId
                    ? { ...seance, participants: seance.participants.filter((id) => !(selectedToRemove[seanceId] || []).includes(id)) }
                    : seance
            )
        );
        setSelectedToRemove((prev) => ({ ...prev, [seanceId]: [] }));
    };

    const handleSaveSeance = async (seance: SeanceRow) => {
        if (!seance.seanceName || !seance.date || !seance.heure_de_debut || !seance.heure_de_fin || !seance.responsable) {
            setMessage({ type: "error", text: "Tous les champs obligatoires doivent être remplis" });
            return;
        }

        const selectedDate = new Date(`${seance.date}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            setMessage({ type: "error", text: "La date ne peut pas être dans le passé" });
            return;
        }

        const [startHour, startMinute] = seance.heure_de_debut.split(":").map(Number);
        const [endHour, endMinute] = seance.heure_de_fin.split(":").map(Number);

        if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
            setMessage({ type: "error", text: "L'heure de fin doit être après l'heure de début" });
            return;
        }

        try {
            setIsSavingById((prev) => ({ ...prev, [seance.id]: true }));

            // Extraire l'ID du responsable pour la sauvegarde
            const responsableId = getResponsableId(seance.responsable);

            await updateDoc(doc(db, "seance", seance.id), {
                seanceName: seance.seanceName,
                date: seance.date,
                heure_de_debut: seance.heure_de_debut,
                heure_de_fin: seance.heure_de_fin,
                responsable: responsableId,
                participants: seance.participants,
            });

            setMessage({ type: "success", text: "Séance modifiée" });
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Erreur lors de la modification" });
        } finally {
            setIsSavingById((prev) => ({ ...prev, [seance.id]: false }));
        }
    };

    const handleDeleteSeance = async (seance: SeanceRow) => {
        if (!confirm(`Supprimer la séance "${seance.seanceName}" ?`)) return;

        try {
            setIsDeletingById((prev) => ({ ...prev, [seance.id]: true }));
            await deleteDoc(doc(db, "seance", seance.id));
            setSeances((prev) => prev.filter((item) => item.id !== seance.id));
            setMessage({ type: "success", text: "Séance supprimée" });
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Erreur lors de la suppression" });
        } finally {
            setIsDeletingById((prev) => ({ ...prev, [seance.id]: false }));
        }
    };

    // --- Ajout de séance (Drawer) ---
    const teacherUsers = users.filter((u) => ["enseignant", "teacher"].includes(u.role.trim().toLowerCase()));
    const studentUsers = users.filter((u) => ["etudiant", "student"].includes(u.role.trim().toLowerCase()));

    const todayLocal = new Date();
    const minDate = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;

    const handleAddSeance = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isAdding) return;

        setIsAdding(true);
        setMessage(null);

        const form = e.currentTarget;
        const name = (form.elements.namedItem("nomseance") as HTMLInputElement)?.value;
        const date = (form.elements.namedItem("date") as HTMLInputElement)?.value;
        const heurededebut = (form.elements.namedItem("heurededebut") as HTMLInputElement)?.value;
        const heuredefin = (form.elements.namedItem("heuredefin") as HTMLInputElement)?.value;
        const responsableValue = responsable[0]?.id;
        const participantsValues = participants.map((p) => p.id);

        try {
            if (!name || !date || !heurededebut || !heuredefin || !responsableValue || participantsValues.length === 0) {
                setMessage({ type: "error", text: "Veuillez remplir tous les champs du formulaire d'ajout." });
                setIsAdding(false);
                return;
            }

            const selectedDate = new Date(`${date}T00:00:00`);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                setMessage({ type: "error", text: "La date ne peut pas être dans le passé." });
                setIsAdding(false);
                return;
            }

            const newSeanceRef = await addDoc(collection(db, "seance"), {
                seanceName: name,
                date: date,
                heure_de_debut: heurededebut,
                heure_de_fin: heuredefin,
                responsable: responsableValue,
                participants: participantsValues,
                createdAt: new Date(),
            });

            // Add locally to the state
            const newSeance: SeanceRow = {
                id: newSeanceRef.id,
                seanceName: name,
                date: date,
                heure_de_debut: heurededebut,
                heure_de_fin: heuredefin,
                responsable: responsableValue,
                participants: participantsValues,
            };

            setSeances([newSeance, ...seances]);
            setOriginalSeances([newSeance, ...originalSeances]);

            setMessage({ type: "success", text: "Séance ajoutée avec succès" });
            form.reset();
            setResponsable([]);
            setParticipants([]);
            setIsAddDrawerOpen(false);

        } catch (error: any) {
            console.error(error);
            setMessage({ type: "error", text: error.message || "Erreur lors de l'ajout" });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-10 text-white bg-linear-to-br from-[#0b0f1a] via-[#0f172a] to-[#020617]">
            <div className="max-w-6xl mx-auto bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">Liste des séances</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAddDrawerOpen(true)}
                            className="px-4 py-2 rounded-lg bg-linear-to-r from-emerald-400 to-cyan-500 hover:opacity-90 transition"
                        >
                            Ajouter séance
                        </button>
                        <Link
                            href="/admin"
                            className="px-4 py-2 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition"
                        >
                            ← Déconnexion
                        </Link>
                    </div>
                </div>

                {message && (
                    <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${message.type === "success"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border-red-500/40 bg-red-500/10 text-red-300"
                        }`}>
                        {message.text}
                    </div>
                )}

                {isLoading ? (
                    <p className="text-gray-300">Chargement...</p>
                ) : seances.length === 0 ? (
                    <p className="text-gray-400">Aucune séance trouvée.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="text-cyan-300 border-b border-gray-700">
                                    <th className="py-3 pr-4">Nom</th>
                                    <th className="py-3 pr-4">Date</th>
                                    <th className="py-3 pr-4">Début</th>
                                    <th className="py-3 pr-4">Fin</th>
                                    <th className="py-3 pr-4">Responsable</th>
                                    <th className="py-3 pr-4">Participants</th>
                                    <th className="py-3 pr-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seances.map((seance) => (
                                    <tr key={seance.id} className="border-b border-gray-800">
                                        <td className="py-3 pr-4">
                                            <input
                                                value={seance.seanceName}
                                                onChange={(e) => handleFieldChange(seance.id, "seanceName", e.target.value)}
                                                className="w-44 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <input
                                                type="date"
                                                value={seance.date}
                                                onChange={(e) => handleFieldChange(seance.id, "date", e.target.value)}
                                                className="w-40 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <input
                                                type="time"
                                                value={seance.heure_de_debut}
                                                onChange={(e) => handleFieldChange(seance.id, "heure_de_debut", e.target.value)}
                                                className="w-32 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <input
                                                type="time"
                                                value={seance.heure_de_fin}
                                                onChange={(e) => handleFieldChange(seance.id, "heure_de_fin", e.target.value)}
                                                className="w-32 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400"
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            {/* ✅ Affichage sécurisé du responsable */}
                                            <div className="p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg">
                                                {getResponsableDisplay(seance.responsable)}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    className="w-56 p-2 bg-[#0b0f1a] border border-gray-700 rounded-lg outline-none focus:border-cyan-400 text-left"
                                                    onClick={() => setOpenDropdownId(openDropdownId === seance.id ? null : seance.id)}
                                                >
                                                    {seance.participants.length === 0
                                                        ? "Aucun participant"
                                                        : seance.participants
                                                            .map(pid => {
                                                                const user = users.find(u => u.id === pid);
                                                                return user ? user.username : pid;
                                                            })
                                                            .join(", ")}
                                                </button>
                                                {openDropdownId === seance.id && (
                                                    <div className="absolute z-10 mt-2 w-56 max-h-60 overflow-y-auto bg-[#1e293b] border border-gray-700 rounded-lg shadow-lg p-2">
                                                        {seance.participants.length === 0 ? (
                                                            <div className="text-gray-400 p-2">Aucun participant</div>
                                                        ) : (
                                                            seance.participants.map((participant, idx) => {
                                                                // Si participant est un objet, on tente d'en extraire un id/email, sinon on stringify
                                                                let key = typeof participant === 'string' ? participant : (participant?.id || participant?.email || JSON.stringify(participant) + idx);
                                                                let display = (() => {
                                                                    if (typeof participant === 'string') {
                                                                        const user = users.find(u => u.id === participant);
                                                                        return user ? user.username : participant;
                                                                    } else if (participant?.username) {
                                                                        return participant.username;
                                                                    } else if (participant?.email) {
                                                                        return participant.email;
                                                                    } else {
                                                                        return JSON.stringify(participant);
                                                                    }
                                                                })();
                                                                return (
                                                                    <div key={key} className="flex items-center gap-2 py-1 px-2 hover:bg-cyan-900/30 rounded">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!(selectedToRemove[seance.id] || []).includes(key)}
                                                                            onChange={() => handleToggleRemove(seance.id, key)}
                                                                        />
                                                                        <span>{display}</span>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="mt-2 w-full py-1 rounded bg-red-700 hover:bg-red-600 text-white disabled:opacity-50"
                                                            disabled={!(selectedToRemove[seance.id] && selectedToRemove[seance.id].length > 0)}
                                                            onClick={() => handleRemoveSelected(seance.id)}
                                                        >
                                                            Supprimer
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="mt-2 w-full py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white"
                                                            onClick={() => setOpenDropdownId(null)}
                                                        >
                                                            Fermer
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleSaveSeance(seance)}
                                                    disabled={!!isSavingById[seance.id] || !isSeanceModified(seance)}
                                                    className="p-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 transition disabled:opacity-50"
                                                    title="Enregistrer"
                                                >
                                                    {isSavingById[seance.id] ? "⏳" : "💾"}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSeance(seance)}
                                                    disabled={!!isDeletingById[seance.id]}
                                                    className="p-2 rounded-lg bg-red-700 hover:bg-red-600 transition disabled:opacity-50"
                                                    title="Supprimer"
                                                >
                                                    {isDeletingById[seance.id] ? "⏳" : "🗑️"}
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
                    onClick={() => setIsAddDrawerOpen(false)}
                />
            )}

            {/* --- Drawer Content --- */}
            <div className={`fixed top-0 right-0 h-full w-full md:max-w-xl bg-[#111827] border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto p-6 md:p-8 ${isAddDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-white">Ajouter une séance</h2>
                    <button
                        type="button"
                        onClick={() => setIsAddDrawerOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleAddSeance}>
                    <input
                        name="nomseance"
                        placeholder="Nom de la séance"
                        className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                    />

                    <input
                        type="date"
                        name="date"
                        min={minDate}
                        className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                    />

                    <input
                        type="time"
                        name="heurededebut"
                        className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                    />

                    <input
                        type="time"
                        name="heuredefin"
                        className="w-full mb-4 p-3 bg-[#0b0f1a] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                    />

                    <div className="mb-4 text-white">
                        <MultiSelect
                            options={teacherUsers}
                            selected={responsable}
                            onChange={(val) => setResponsable(val.length > 0 ? [val[val.length - 1]] : [])}
                            placeholder="Sélectionner un responsable"
                        />
                    </div>

                    <div className="mb-4 text-white">
                        <MultiSelect
                            options={studentUsers}
                            selected={participants}
                            onChange={setParticipants}
                            placeholder="Sélectionner les participants"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAdding ? "Ajout en cours..." : "Ajouter séance"}
                    </button>
                </form>
            </div>
        </div>
    );
}