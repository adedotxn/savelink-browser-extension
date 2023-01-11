/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env :  {
    NEXT_PUBLIC_GOOGLE_ID: process.env.GOOGLE_ID,
    NEXT_PUBLIC_GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    NEXT_PUBLIC_CALLBACK_URL: process.env.CALLBACK_URL,
    NEXT_PUBLIC_SECRET: process.env.SECRET

  }
}

module.exports = nextConfig
