/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";

type UserOption = {
    id: string;
    username: string;
    role: string;
    email?: string;
};

type SelectedUser = {
    id: string;
    username: string;
    email?: string;
};

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Sélectionner...",
}: {
    options: UserOption[];
    selected: SelectedUser[];
    onChange: (val: SelectedUser[]) => void;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    const filtered = options.filter((o) =>
        o.username?.toLowerCase().includes(search.toLowerCase())
    );

    const toggle = (user: UserOption) => {
        const exists = selected.some((s) => s.id === user.id);
        if (exists) {
            onChange(selected.filter((s) => s.id !== user.id));
        } else {
            onChange([
                ...selected,
                {
                    id: user.id,
                    username: user.username,
                    email: user.email || "",
                },
            ]);
        }
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative w-full mb-4">
            <div
                onClick={() => setOpen((v) => !v)}
                className={`w-full min-h-[48px] p-3 bg-[#0b0f1a] border rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                    open ? "border-cyan-400" : "border-gray-700 hover:border-gray-500"
                }`}
            >
                <div className="flex flex-wrap gap-1 flex-1">
                    {selected.length === 0 ? (
                        <span className="text-gray-500 text-sm">{placeholder}</span>
                    ) : (
                        selected.map((user) => (
                            <span
                                key={user.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-900/50 text-cyan-300 border border-cyan-700 rounded-full text-xs font-medium"
                            >
                                {user.username}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(selected.filter((s) => s.id !== user.id));
                                    }}
                                    className="opacity-60 hover:opacity-100 leading-none"
                                >
                                    ×
                                </button>
                            </span>
                        ))
                    )}
                </div>
                <span className={`text-gray-400 text-xs transition-transform ${open ? "rotate-180" : ""}`}>
                    ▾
                </span>
            </div>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-[#111827] border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-700">
                        <input
                            autoFocus
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full text-sm bg-transparent outline-none text-white placeholder-gray-500"
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="py-4 text-center text-sm text-gray-500">
                                Aucun résultat
                            </div>
                        ) : (
                            filtered.map((user) => {
                                const isSelected = selected.some((s) => s.id === user.id);
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => toggle(user)}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                                            isSelected
                                                ? "bg-cyan-900/20 text-white"
                                                : "text-gray-300 hover:bg-gray-800"
                                        }`}
                                    >
                                        <div
                                            className={`w-4 h-4 flex-shrink-0 rounded flex items-center justify-center border ${
                                                isSelected
                                                    ? "bg-cyan-500 border-cyan-500"
                                                    : "border-gray-600"
                                            }`}
                                        >
                                            {isSelected && (
                                                <svg
                                                    viewBox="0 0 10 10"
                                                    fill="none"
                                                    stroke="white"
                                                    strokeWidth="2"
                                                    className="w-2.5 h-2.5"
                                                >
                                                    <polyline points="1.5,5 4,7.5 8.5,2.5" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="flex flex-col">
                                            <span>{user.username}</span>
                                            {user.email && (
                                                <span className="text-xs text-gray-400">
                                                    {user.email}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="flex justify-between items-center px-3 py-2 border-t border-gray-700">
                        <span className="text-xs text-gray-500">
                            {selected.length} sélectionné(s)
                        </span>
                        {selected.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                className="text-xs text-cyan-400 hover:underline"
                            >
                                Tout effacer
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}