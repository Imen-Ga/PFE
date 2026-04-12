import Link from "next/link";

export default function StudentDashboard() {
  const stats = [
    { title: "Total des seances", value: 42 },
    { title: "Presents", value: 38 },
    { title: "Absents", value: 4 },
    { title: "Taux de presence", value: "90.5%" },
  ];

  const records = [
    {
      date: "15 Dec 2024",
      time: "09:15 AM",
      session: "Informatique 101",
      status: "Present",
    },
    {
      date: "14 Dec 2024",
      time: "02:30 PM",
      session: "Mathematiques 201",
      status: "Absent",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Interface etudiant</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-xl rounded-xl">
              <div className="p-4">
                <p className="text-sm text-[#0b1f4d] font-semibold">{stat.title}</p>
                <h2 className="text-xl font-semibold">{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl">
          <div className="p-4">
            <h2 className="mb-4 font-semibold">Historique de presence</h2>
            <table className="w-full text-sm">
              <thead className="text-left opacity-70">
                <tr>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Seance</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td>{rec.date}</td>
                    <td>{rec.time}</td>
                    <td>{rec.session}</td>
                    <td>
                      {rec.status === "Present" && (
                        <span className="bg-green-500 px-2 py-1 rounded text-xs font-medium">Present</span>
                      )}
                      {rec.status === "Absent" && (
                        <span className="bg-red-500 px-2 py-1 rounded text-xs font-medium">Absent</span>
                      )}
                    </td>
                    <td>
                      <button type="button" className="px-3 py-1 rounded border border-white/30 hover:bg-white/10 transition">
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6">
              <Link
                href="/"
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
