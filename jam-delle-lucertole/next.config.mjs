/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Se le immagini sono servite da domini esterni, aggiungili qui.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
