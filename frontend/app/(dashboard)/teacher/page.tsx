"use client";

import { db } from "@/filebase";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";

type UserRow = {
  id: string;
  username: string;
};

type SeanceRow = {
  id: string;
  seanceName: any;
  date: any;
  heure_de_debut: any;
  heure_de_fin: any;
  responsable: any;
  participants: any[];
  presences?: any[];
};

export default function TeacherDashboard() {
  const [seances, setSeances] = useState<SeanceRow[]>([]);
  const [selectedSeance, setSelectedSeance] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);

  // 🔒 SAFE DISPLAY
  const safe = (value: any) => {
    if (!value) return "-";
    if (typeof value === "string" || typeof value === "number") return value;
    if (typeof value === "object") {
      return value.username || value.email || "-";
    }
    return "-";
  };

  const getUserName = (idOrObj: any) => {
    if (!idOrObj) return "-";
    if (typeof idOrObj === "object") return idOrObj.username || idOrObj.email || "-";
    const user = users.find((u) => u.id === idOrObj);
    return user ? user.username : idOrObj;
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
        const usersSnap = await getDocs(collection(db, "users"));
        const usersData = usersSnap.docs.map((doc) => ({
          id: doc.id,
          username: doc.data().username || "-",
        }));
        setUsers(usersData);

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
              precences: Array.isArray(d.presences)
                ? d.presences
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-cyan-400"></div>
          <p className="mt-4 text-gray-300">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-cyan-500/20 backdrop-blur-sm">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Tableau de bord enseignant
          </h1>
          <p className="text-gray-400 mt-2">Gérez vos séances et suivez la présence</p>
        </div>

        {seances.length === 0 && (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-400 text-lg">Aucune séance trouvée</p>
            <p className="text-gray-500 text-sm mt-2">Vous n'êtes responsable d'aucune séance pour le moment</p>
          </div>
        )}

        {/* ✅ LISTE DÉROULANTE - Enhanced */}
        {seances.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 backdrop-blur-sm">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📖 Sélectionner une séance
            </label>
            <select
              value={selectedSeance}
              onChange={(e) => setSelectedSeance(e.target.value)}
              className="w-full md:w-auto min-w-[300px] bg-slate-900 text-white p-3 rounded-lg border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200 cursor-pointer hover:bg-slate-800"
            >
              {seances.map((s) => (
                <option key={s.id} value={s.id}>
                  {safe(s.seanceName)} • {safe(s.date)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ✅ AFFICHER SEULEMENT LA SÉANCE CHOISIE - Enhanced */}
        {seances
          .filter((s) => s.id === selectedSeance)
          .map((s) => (
            <div key={s.id} className="bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-cyan-500/50">

              {/* Header with gradient accent */}
              <div className="bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent p-6 border-b border-slate-700">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-cyan-300">
                      {safe(s.seanceName)}
                    </h2>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        {safe(s.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        {safe(s.heure_de_debut)} → {safe(s.heure_de_fin)}
                      </span>
                    </div>
                  </div>

                  {/* Badge responsable */}
                  <div className="bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/30">
                    <span className="text-cyan-300 text-sm font-medium">
                      Responsable : {getUserName(s.responsable)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PARTICIPANTS Table - Enhanced */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-200">
                    📋 Liste des participants
                  </h3>
                  <span className="text-sm text-gray-400 bg-slate-700 px-3 py-1 rounded-full">
                    {s.participants.length} étudiant{s.participants.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900">
                      <tr className="text-gray-300 border-b border-slate-700">
                        <th className="text-left p-4 font-semibold">👤 Étudiant</th>
                        <th className="text-center p-4 font-semibold w-32">📊 Statut</th>
                      </tr>
                    </thead>

                    <tbody>
                      {s.participants.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="text-center p-8 text-gray-500">
                            Aucun participant inscrit
                          </td>
                        </tr>
                      ) : (
                        s.participants.map((p: any, i) => {

                          const studentId =
                            typeof p === "object" ? p.id : p;

                          const presence =
                            s.presences?.find(
                              (pr: any) => pr.studentId === studentId
                            );

                          const status = presence?.status || "Absent";

                          return (
                            <tr key={i} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors duration-150">
                              <td className="py-3 px-4 text-gray-200 font-medium">
                                {getUserName(p)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {status === "Présent" ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-lg text-green-300 text-xs font-semibold border border-green-500/30">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Présent
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-lg text-red-300 text-xs font-semibold border border-red-500/30">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                    Absent
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        }
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}

        {/* RETOUR - Enhanced */}
        <div className="mt-8 pt-4 border-t border-slate-700">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-300 transition-all duration-200 font-medium group"
          >
            <span>←</span>
            ← Déconnexion
          </Link>
        </div>

      </div>
    </div>
  );
}