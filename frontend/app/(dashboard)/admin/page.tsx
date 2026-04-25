import Link from "next/link";
export default function AdminDashboardHome() {
    return (
        <div
            className="min-h-screen text-white p-6 md:p-10"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(11, 15, 26, 0.74), rgba(2, 6, 23, 0.82)), url('/gifs/presence.gif')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-[#111827]/90 border border-gray-700 rounded-2xl p-6 md:p-8 shadow-2xl">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Accueil administrateur</h1>
                    <p className="text-gray-300">Gerez rapidement les utilisateurs et les seances.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/admin/users"
                        className="rounded-xl border border-gray-700 bg-[#111827]/90 hover:bg-[#182238] transition p-5"
                    >
                        <h2 className="text-lg font-semibold mb-1">Tableau utilisateurs</h2>
                        <p className="text-sm text-gray-300">Modifier, enregistrer et supprimer les comptes.</p>
                    </Link>

                    <Link
                        href="/admin/seance"
                        className="rounded-xl border border-gray-700 bg-[#111827]/90 hover:bg-[#182238] transition p-5"
                    >
                        <h2 className="text-lg font-semibold mb-1">Tableau seances</h2>
                        <p className="text-sm text-gray-300">Consulter et gerer les seances.</p>
                    </Link>
                    <Link
                        href="/auth/login"
                        className="px-4 py-2 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition md:col-span-2 justify-self-center"
                        >
                        Retour accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}