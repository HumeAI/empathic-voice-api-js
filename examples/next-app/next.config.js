/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_HUME_API_KEY: process.env['HUME_API_KEY'],
  },
};

module.exports = nextConfig;
