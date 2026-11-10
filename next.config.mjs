/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` writes a plain HTML site to ./out that any host can serve
  // (Hostinger, Vercel, Netlify, cPanel). No Node server needed.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Dev only: lets `npm run dev` be opened from your network address (phone / another PC on the same Wi-Fi)
  // without the "Blocked cross-origin request to /_next/hmr" warning. Has no effect on the built site.
  allowedDevOrigins: ['172.30.245.92', '172.30.*.*', '192.168.*.*', '10.*.*.*'],
};

export default nextConfig;
