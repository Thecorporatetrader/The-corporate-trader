/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces plain static HTML/CSS/JS in ./out with no Node server required.
  // Deployable to any static host: Vercel, Netlify, GitHub Pages, or your
  // existing cPanel/shared hosting. Remove this once real forms/auth/API
  // routes are added, since static export can't run server-side code.
  output: 'export',
};

export default nextConfig;
