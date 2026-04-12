import Link from "next/link";

export default function AuthPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black text-white p-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-6 text-cyan-400">Page d'authentification</h1>
                <p className="text-gray-400 text-lg max-w-md text-center mb-6">
                    Veuillez sélectionner votre rôle pour vous connecter à votre espace sécurisé.
                </p>
                <Link
                    href="/"
                    className="inline-block px-5 py-2 rounded-lg border border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 transition"
                >
                    Retour a l'accueil
                </Link>
            </div>
        </div>
    );
}
