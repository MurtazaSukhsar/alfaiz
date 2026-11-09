/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` writes a plain HTML site to ./out that any host can serve
  // (Hostinger, Vercel, Netlify, cPanel). No Node server needed.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
