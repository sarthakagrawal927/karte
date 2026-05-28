import config from "@saas-maker/eslint-config/next";
export default [
  { ignores: [".pages-deploy", ".claude/**", "tmp/**"] },
  ...config,
  { settings: { react: { version: "19.0.0" } } },
];
