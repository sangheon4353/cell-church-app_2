const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Metro가 node_modules 내부의 캐시 파일을 추적할 수 있도록 경로 명시
config.resolver.nodeModulesPaths = [
  ...config.resolver.nodeModulesPaths,
  'node_modules'
];

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Vercel(CI환경)에서는 파일 시스템 쓰기를 비활성화하거나 환경에 따라 조절
  forceWriteFileSystem: process.env.NODE_ENV !== 'production', 
});
