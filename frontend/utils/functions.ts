export const getInitials = (n: string) =>
    n?.split(" ").map((w) => w[0]).slice(0, 3).join("").toUpperCase() || "?";