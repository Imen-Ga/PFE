"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/filebase";
import { Chart, registerables } from "chart.js";
import { useChart } from "@/hooks/useAppChart";

Chart.register(...registerables);

export default function AdminDashboardHome() {
    const [stats, setStats] = useState({
        teachers: 0,
        students: 0,
        absencePercentage: "0",
    });

    const [loading, setLoading] = useState(true);

    // refs charts
    const usersChartRef = useRef<HTMLCanvasElement>(null);
    const absenceChartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // USERS
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

                // SEANCES
                const seancesSnap = await getDocs(collection(db, "seance"));
                let totalExpected = 0;
                let totalPresents = 0;

                seancesSnap.docs.forEach(doc => {
                    const data = doc.data();
                    const participants = data.participants || [];
                    const presences = data.presences || [];

                    totalExpected += participants.length;

                    const presents = presences.filter(
                        (p: any) =>
                            p.status === "Présent" || p.status === "Present"
                    ).length;

                    totalPresents += presents;
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

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // charts
    useChart(usersChartRef, () => ({
        type: "doughnut",
        data: {
            labels: ["Profs", "Étudiants"],
            datasets: [{
                data: [stats.teachers, stats.students],
                backgroundColor: ["#10b981", "#06b6d4"],
                borderWidth: 0,
            }]
        },
        options: {
            cutout: "70%",
            plugins: { legend: { display: false } },
        }
    }), [stats]);

    useChart(absenceChartRef, () => ({
        type: "doughnut",
        data: {
            labels: ["Présents", "Absents"],
            datasets: [{
                data: [
                    100 - Number(stats.absencePercentage),
                    Number(stats.absencePercentage)
                ],
                backgroundColor: ["#22c55e", "#f43f5e"],
                borderWidth: 0,
            }]
        },
        options: {
            cutout: "70%",
            plugins: { legend: { display: false } },
        }
    }), [stats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#020617]">
                <div className="animate-spin h-12 w-12 border-b-2 border-cyan-500 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 min-h-screen bg-[#020617] text-white">
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Interface Admin</h1>
                    <p className="text-gray-400">Statistiques en temps réel</p>
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* USERS */}
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm mb-3">
                            Répartition utilisateurs
                        </p>

                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-emerald-400">
                                👨‍🏫 {stats.teachers} Profs
                            </span>
                            <span className="text-cyan-400">
                                🎓 {stats.students} Étudiants
                            </span>
                        </div>
                        <div className="h-52 relative">
                            <canvas ref={usersChartRef} className="w-full h-full"></canvas>
                        </div>
                    </div>

                    {/* ABSENCE */}
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm mb-3">
                            Taux d'absences
                        </p>

                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-green-400">
                                Présents {100 - Number(stats.absencePercentage)}%
                            </span>
                            <span className="text-rose-400">
                                Absents {stats.absencePercentage}%
                            </span>
                        </div>

                        <div className="h-52">
                            <canvas ref={absenceChartRef}></canvas>
                        </div>
                    </div>

                </div>

                {/* FOOTER TEXT */}
                <div className="mt-8 bg-[#111827] border border-gray-800 rounded-2xl p-6">
                    <p className="text-gray-400">
                        Les statistiques sont calculées automatiquement à partir des présences enregistrées dans les séances.
                    </p>
                </div>

            </div>
        </div>
    );
}