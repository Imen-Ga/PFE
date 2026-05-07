export function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
    return (
        <span className="flex items-center gap-1.5 text-xs text-neutral-500">
            {dashed
                ? <span style={{ width: 16, height: 2, background: color, display: "inline-block", borderRadius: 1, borderTop: `2px dashed ${color}`, height: 0 }} />
                : <span style={{ width: 9, height: 9, background: color, borderRadius: 2, display: "inline-block" }} />}
            {label}
        </span>
    );
}