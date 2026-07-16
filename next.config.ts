import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Docker tek-container image için
  output: "standalone",
};

export default nextConfig;
