"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/filebase";

export default function AdminDashboardHome() {
    const [stats, setStats] = useState({
        teachers: 0,
        students: 0,
        absencePercentage: "0",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Fetch Users
                const usersSnap = await getDocs(collection(db, "users"));
                let tCount = 0;
                let sCount = 0;
                usersSnap.docs.forEach(doc => {
                    const data = doc.data();
                    const role = (data.role || "").trim().toLowerCase();
                    if (["enseignant", "teacher"].includes(role)) {
                        tCount++;
                    } else if (["etudiant", "student"].includes(role)) {
                        sCount++;
                    }
                });

                // 2. Fetch Seances to calculate absences
                const seancesSnap = await getDocs(collection(db, "seance"));
                let totalExpected = 0;
                let totalPresents = 0;

                seancesSnap.docs.forEach(doc => {
                    const data = doc.data();
                    const participants = Array.isArray(data.participants) ? data.participants : [];
                    const presences = Array.isArray(data.presences) ? data.presences : [];

                    totalExpected += participants.length;

                    const presentsForSeance = presences.filter((p: any) => p.status === "Présent" || p.status === "Present").length;
                    totalPresents += presentsForSeance;
                });

                let absencePerc = 0;
                if (totalExpected > 0) {
                    const totalAbsents = totalExpected - totalPresents;
                    absencePerc = (totalAbsents / totalExpected) * 100;
                }

                setStats({
                    teachers: tCount,
                    students: sCount,
                    absencePercentage: absencePerc.toFixed(1),
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-full flex items-center justify-center bg-linear-to-br from-[#0b0f1a] via-[#0f172a] to-[#020617]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 min-h-full min-h-screen bg-linear-to-br from-[#0b0f1a] via-[#0f172a] to-[#020617] text-white">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
                    <p className="text-gray-400">Vue d'ensemble de l'établissement</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Carte Professeurs */}
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center gap-6">
                        <div className="p-4 bg-emerald-500/10 rounded-xl text-emerald-400 text-3xl">
                            👨‍🏫
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Nombre de Profs</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats.teachers}</p>
                        </div>
                    </div>

                    {/* Carte Élèves */}
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center gap-6">
                        <div className="p-4 bg-cyan-500/10 rounded-xl text-cyan-400 text-3xl">
                            🎓
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Nombre d'Élèves</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats.students}</p>
                        </div>
                    </div>

                    {/* Carte Absences */}
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center gap-6">
                        <div className="p-4 bg-rose-500/10 rounded-xl text-rose-400 text-3xl">
                            📉
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Taux d'absences</p>
                            <p className="text-3xl font-bold text-white mt-1">{stats.absencePercentage}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-xl mt-8">
                    <h2 className="text-xl font-bold mb-4">Bienvenue sur l'espace d'administration</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Utilisez la barre latérale pour naviguer entre la gestion des utilisateurs (étudiants, enseignants, administrateurs) et la gestion des séances. 
                        Les statistiques ci-dessus sont mises à jour en temps réel selon les données enregistrées lors des présences.
                    </p>
                </div>
            </div>
        </div>
    );
}