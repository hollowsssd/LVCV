// next.config.ts
import type { NextConfig } from '@/node_modules/next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    // Nếu bạn còn dùng http ở môi trường nội bộ, thêm dòng sau:
    // remotePatterns: [{ protocol: 'http', hostname: 'placehold.co' }, ...]
  },
};

export default nextConfig;