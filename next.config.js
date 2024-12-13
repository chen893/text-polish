/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开启图片优化功能
  images: {
    domains: ['localhost'], // 允许的图片域名
    // 如果需要使用外部图片服务，在这里添加域名
  },

  // 严格模式，用于捕获潜在问题
  reactStrictMode: true,

  // 输出目录
  distDir: '.next',

  // 开启 SWC 压缩
  swcMinify: true,

  // 实验性功能
  // experimental: {
  // 使用新的 App Router 功能
  // appDir: true,
  // 开启服务器操作
  // serverActions: true,
  // },

  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 禁用 x-powered-by header
  poweredByHeader: false,

  // 压缩
  compress: true,
};

module.exports = nextConfig;
