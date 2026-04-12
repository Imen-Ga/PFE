import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/auth/se-connecter",
        destination: "/auth/student-teacher/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
