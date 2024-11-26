/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Suppresses all ESLint errors/warnings during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Allows build to succeed even if there are TypeScript errors
  },
};

export default nextConfig;
