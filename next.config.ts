/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "encrypted-tbn0.gstatic.com",
      "live.staticflickr.com",
      "i1.sndcdn.com",
      "mrwallpaper.com",
      "resunest.prayushgiri.com",
    ],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

