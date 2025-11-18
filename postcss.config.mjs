// postcss.config.mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // (!!) 使用错误日志中提到的正确插件包 (!!)
    '@tailwindcss/postcss': {}, 
    'autoprefixer': {},
  },
};
export default config;