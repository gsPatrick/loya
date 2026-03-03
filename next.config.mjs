/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // permite qualquer domínio HTTPS
      },
      {
        protocol: 'http',
        hostname: '**', // opcional: se quiser também liberar http
      },
    ],
  },
};

export default nextConfig;
