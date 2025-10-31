process.env.CSS_TRANSFORMER_WASM = process.env.CSS_TRANSFORMER_WASM || '1';

const { default: tailwindcss } = await import("@tailwindcss/postcss");
const { default: autoprefixer } = await import("autoprefixer");

export default {
  plugins: [tailwindcss(), autoprefixer()]
};
