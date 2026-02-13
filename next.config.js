/** @type {import('next').NextConfig} */
const basePath = process.env.BASE_PATH || "";
const useExport = process.env.OUTPUT_EXPORT === "1";

const nextConfig = {
  reactStrictMode: true,
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  ...(useExport && {
    output: "export",
    images: { unoptimized: true },
  }),
  turbopack: {},
  webpack: (config) => {
    // Handle GLB/GLTF files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    })
    return config
  },
}

module.exports = nextConfig
