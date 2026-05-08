"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/filebase";
import { signOut } from "firebase/auth";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slice/authSlice";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem("uid");
            dispatch(logout());
            window.location.href = "/auth/login";
        } catch (error) {
            console.error("Erreur deconnexion", error);
        }
    };

    const links = [
        { href: "/admin", label: "Dashboard", icon: "📊" },
        { href: "/admin/users", label: "Tableau Utilisateurs", icon: "👥" },
        { href: "/admin/seance", label: "Tableau Séances", icon: "📅" },
    ];

    return (
        <div className="flex h-screen bg-[#020617] text-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0b0f1a] border-r border-gray-800 flex flex-col justify-between shrink-0 z-20">
                <div>
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">Admin Panel</h2>
                        <p className="text-xs text-gray-400 mt-1">Espace d'administration</p>
                    </div>
                    <nav className="p-4 space-y-2">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                                        isActive 
                                            ? "bg-[#1e293b] text-cyan-400 font-medium border border-gray-700" 
                                            : "text-gray-400 hover:text-white hover:bg-[#1e293b]/50 border border-transparent"
                                    }`}
                                >
                                    <span className="text-xl">{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition"
                    >
                        <span className="text-xl">🚪</span>
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative bg-[#020617]">
                {children}
            </main>
        </div>
    );
}
