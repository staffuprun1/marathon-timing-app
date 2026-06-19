/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [".next/**", "public/sw.js", "public/workbox-*.js"],
  },
];

export default eslintConfig;
