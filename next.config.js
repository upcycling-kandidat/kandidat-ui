/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.adamnor.com',
      },
      {
        protocol: 'https',
        hostname: 'backend.adamnor.com',
      }
    ]
  }
}

module.exports = nextConfig
