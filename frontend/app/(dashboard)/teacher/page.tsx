import Link from "next/link";

export default function TeacherDashboard() {
  const students = [
    { name: "Imen Gannoun", id: "CS2024001", time: "09:15", status: "Present", confidence: "98%", sessions: "23/25" },
    { name: "Faycel", id: "CS2024002", time: "09:12", status: "Present", confidence: "95%", sessions: "24/25" },
    { name: "Ela", id: "CS2024003", time: "-", status: "Absent", confidence: "-", sessions: "20/25" },
    { name: "David", id: "CS2024004", time: "09:18", status: "Present", confidence: "92%", sessions: "22/25" },
    { name: "Sarah", id: "CS2024005", time: "09:20", status: "Non verifie", confidence: "75%", sessions: "25/25" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold">Interface Enseignant</h2>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl bg-slate-800"><div className="p-4">Total etudiants: <b>45</b></div></div>
          <div className="rounded-xl bg-slate-800"><div className="p-4 text-green-400">Presents: <b>38</b></div></div>
          <div className="rounded-xl bg-slate-800"><div className="p-4 text-red-400">Absents: <b>7</b></div></div>
          <div className="rounded-xl bg-slate-800"><div className="p-4 text-yellow-400">Non identifies: <b>2</b></div></div>
        </div>

        {/* Session */}
        <div className="rounded-xl bg-slate-800">
          <div className="flex justify-between items-center p-4">
            <div>
              <h3 className="font-semibold">Seance en cours</h3>
              <p className="text-sm text-gray-400">Informatique 101 - Salle A204</p>
            </div>
            <button type="button" className="bg-purple-600 px-4 py-2 rounded-lg">Exporter rapport</button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-slate-800">
          <div className="p-4 space-y-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">Presence des etudiants</h3>
              <div className="flex items-center gap-2">
                <span>Recherche:</span>
                <input
                  placeholder="Rechercher un etudiant..."
                  className="w-60 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th className="text-left">Etudiant</th>
                  <th>ID</th>
                  <th>Heure arrivee</th>
                  <th>Statut</th>
                  <th>Confiance</th>
                  <th>Total seances</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i} className="border-t border-slate-700">
                    <td>{s.name}</td>
                    <td>{s.id}</td>
                    <td>{s.time}</td>
                    <td>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          s.status === "Present"
                            ? "bg-green-600"
                            : s.status === "Absent"
                              ? "bg-red-600"
                              : "bg-yellow-500"
                          }`}
                      >
                        {s.status === "Present" ? "Present" : s.status === "Absent" ? "Absent" : "Non verifie"}
                      </span>
                    </td>
                    <td>{s.confidence}</td>
                    <td>{s.sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      </div>
    </div>
  );
}
