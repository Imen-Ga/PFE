"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/filebase";
import { addCurrentUserInfo } from "@/redux/slice/authSlice";

interface Seance {
  id: string;
  date: string;
  time: string;
  matiere: string;
  enseignant: string;
  status: string;
}

export default function StudentDashboard() {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useSelector((state: any) => state.auth.userInfo);
  const dispatch = useDispatch();

  // Effet pour restaurer l'utilisateur depuis localStorage si Redux est vide
  useEffect(() => {
    if (!currentUser) {
      const uid = typeof window !== "undefined" ? localStorage.getItem("uid") : null;
      if (uid) {
        (async () => {
          try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              let createdAt = userData.createdAt;
              if (createdAt && typeof createdAt === "object" && typeof createdAt.toDate === "function") {
                createdAt = createdAt.toDate().toISOString();
              } else if (typeof createdAt !== "string") {
                createdAt = null;
              }
              dispatch(addCurrentUserInfo({
                ...userData,
                createdAt,
                uid,
              }));
            }
          } catch (err) {
            console.error("Erreur restauration utilisateur:", err);
          }
        })();
      }
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      setSeances([]);
      return;
    }
    
    const fetchSeances = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/get-seances-etudiant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.uid }),
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.success) {
          setSeances(data.seances || []);
        } else {
          console.error("Erreur API:", data.error);
          setError(data.error || "Erreur lors du chargement des séances");
          setSeances([]);
        }
      } catch (e: any) {
        console.error("Erreur fetch:", e);
        setError(e.message || "Erreur de connexion au serveur");
        setSeances([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSeances();
  }, [currentUser]);

  // Statistiques dynamiques
  const total = seances.length;
  const presents = seances.filter(s => s.status === "Présent" || s.status === "Present").length;
  const absents = seances.filter(s => s.status === "Absent").length;
  const taux = total > 0 ? ((presents / total) * 100).toFixed(1) + "%" : "0%";
  
  const stats = [
    { title: "Total des séances", value: total, color: "from-blue-500 to-cyan-500" },
    { title: "Présents", value: presents, color: "from-emerald-500 to-green-500" },
    { title: "Absents", value: absents, color: "from-red-500 to-rose-500" },
    { title: "Taux de présence", value: taux, color: "from-purple-500 to-indigo-500" },
  ];

  // Fonction pour obtenir le nom du responsable
  const getEnseignantName = (enseignant: string) => {
    if (!enseignant || enseignant === "-" || enseignant === "Non assigné") {
      return "Non assigné";
    }
    return enseignant;
  };

  // Fonction pour formater la date
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "Date non définie") return dateStr;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Interface Étudiant
            </h1>
            <p className="text-sm opacity-75 mt-1">Gérez votre présence aux séances</p>
          </div>
          {currentUser && (
            <div className="bg-white/10 backdrop-blur-xl rounded-lg px-4 py-2">
              <p className="text-sm opacity-75">Bienvenue,</p>
              <p className="font-semibold">{currentUser.username || currentUser.nom || currentUser.email}</p>
            </div>
          )}
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br ${stat.color} bg-opacity-20 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/10`}>
              <p className="text-sm text-white/80 font-semibold">{stat.title}</p>
              <h2 className="text-3xl font-bold mt-2">{stat.value}</h2>
            </div>
          ))}
        </div>
        
        {/* Tableau d'historique */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 shadow-2xl border border-white/20">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-semibold">📋 Historique de présence</h2>
            <button
              onClick={() => {
                setLoading(true);
                fetchSeances();
              }}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
            >
              🔄 Actualiser
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              <p className="mt-4 text-gray-300">Chargement de vos séances...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 inline-block">
                <p className="text-red-300">❌ {error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 rounded-lg bg-red-500/30 hover:bg-red-500/50 transition text-sm"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : seances.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-medium">Aucune séance trouvée</p>
              <p className="text-sm opacity-70 mt-2">Vous n'êtes inscrit à aucune séance pour le moment</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b border-white/20">
                    <tr className="text-gray-300">
                      <th className="pb-3 font-semibold">📅 Date</th>
                      <th className="pb-3 font-semibold">⏰ Horaire</th>
                      <th className="pb-3 font-semibold">📚 Séance</th>
                      <th className="pb-3 font-semibold">👨‍🏫 Enseignant</th>
                      <th className="pb-3 font-semibold">✅ Statut</th>
                      <th className="pb-3 font-semibold">ℹ️ Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seances.map((seance, i) => (
                      <tr key={seance.id || i} className="border-b border-white/10 hover:bg-white/5 transition">
                        <td className="py-3">{formatDate(seance.date)}</td>
                        <td className="py-3 font-mono text-xs">{seance.time}</td>
                        <td className="py-3 font-medium">{seance.matiere}</td>
                        <td className="py-3">{getEnseignantName(seance.enseignant)}</td>
                        <td className="py-3">
                          {seance.status === "Présent" || seance.status === "Present" ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/50">
                              <span>✅</span> Présent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-medium border border-red-500/50">
                              <span>❌</span> Absent
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <button 
                            type="button" 
                            className="px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/10 transition text-xs flex items-center gap-1"
                            onClick={() => alert(
                              `📋 Détails de la séance:\n\n` +
                              `📚 Matière: ${seance.matiere}\n` +
                              `📅 Date: ${formatDate(seance.date)}\n` +
                              `⏰ Horaire: ${seance.time}\n` +
                              `👨‍🏫 Enseignant: ${getEnseignantName(seance.enseignant)}\n` +
                              `✅ Statut: ${seance.status === "Présent" || seance.status === "Present" ? "Présent" : "Absent"}`
                            )}
                          >
                            <span>📖</span> Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Résumé */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-sm text-gray-300">
                  <span>Total séances: <strong className="text-white">{seances.length}</strong></span>
                  <span>Présences: <strong className="text-emerald-400">{presents}</strong></span>
                  <span>Absences: <strong className="text-red-400">{absents}</strong></span>
                  <span>Taux de présence: <strong className="text-cyan-400">{taux}</strong></span>
                </div>
              </div>
            </>
          )}
          
          <div className="mt-6 flex gap-3">
            <Link
              href="/"
              className="inline-block px-5 py-2 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition"
            >
              ← Retour accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}