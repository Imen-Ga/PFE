"use client";

import { db } from "@/filebase";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";

type SeanceRow = {
  id: string;
  seanceName: any;
  date: any;
  heure_de_debut: any;
  heure_de_fin: any;
  responsable: any;
  participants: any[];
};

export default function TeacherDashboard() {
  const [seances, setSeances] = useState<SeanceRow[]>([]);
  const [selectedSeance, setSelectedSeance] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 🔒 SAFE DISPLAY
  const safe = (value: any) => {
    if (!value) return "-";
    if (typeof value === "string" || typeof value === "number") return value;
    if (typeof value === "object") {
      return value.username || value.email || "-";
    }
    return "-";
  };

  useEffect(() => {
    const auth = getAuth();

    // 🔥 attendre que user soit chargé
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDocs(collection(db, "seance"));

        const data = snap.docs
          .map((doc) => {
            const d = doc.data() as any;

            return {
              id: doc.id,
              seanceName: d.seanceName,
              date: d.date,
              heure_de_debut: d.heure_de_debut,
              heure_de_fin: d.heure_de_fin,
              responsable: d.responsable,
              participants: Array.isArray(d.participants)
                ? d.participants
                : [],
            };
          })
          // ✅ FILTRE PAR ENSEIGNANT CONNECTÉ
          .filter((s) => s.responsable === user.uid); 
          // ⚠️ si tu utilises uid → remplace par user.uid

        setSeances(data);

        if (data.length > 0) {
          setSelectedSeance(data[0].id);
        }

      } catch (err) {
        console.error("Erreur Firestore:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-white p-6">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">Interface Enseignant</h1>

        {seances.length === 0 && (
          <p className="text-gray-400">Aucune séance trouvée</p>
        )}

        {/* ✅ LISTE DÉROULANTE */}
        {seances.length > 0 && (
          <select
            value={selectedSeance}
            onChange={(e) => setSelectedSeance(e.target.value)}
            className="bg-slate-800 p-2 rounded-lg"
          >
            {seances.map((s) => (
              <option key={s.id} value={s.id}>
                {safe(s.seanceName)} - {safe(s.date)}
              </option>
            ))}
          </select>
        )}

        {/* ✅ AFFICHER SEULEMENT LA SÉANCE CHOISIE */}
        {seances
          .filter((s) => s.id === selectedSeance)
          .map((s) => (
            <div key={s.id} className="bg-slate-800 p-4 rounded-xl space-y-4">

              {/* INFOS */}
              <div>
                <h2 className="font-semibold text-lg">
                  {safe(s.seanceName)}
                </h2>

                <p className="text-sm text-gray-400">
                  {safe(s.date)} | {safe(s.heure_de_debut)} - {safe(s.heure_de_fin)}
                </p>
              </div>

              {/* RESPONSABLE */}
              <p className="text-cyan-300">
                Responsable : {safe(s.responsable)}
              </p>

              {/* PARTICIPANTS */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-400">
                    <tr>
                      <th className="text-left">Etudiant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>

                  <tbody>
                    {s.participants.map((p, i) => (
                      <tr key={i} className="border-t border-slate-700">
                        <td className="py-2">{safe(p)}</td>
                        <td>
                          <span className="px-2 py-1 bg-red-600 rounded text-xs">
                            Absent
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ))}

        {/* RETOUR */}
        <div className="mt-6">
          <Link
            href="/auth/login"
            className="inline-block px-5 py-2 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition"
          >
            Retour accueil
          </Link>
        </div>

      </div>
    </div>
  );
}