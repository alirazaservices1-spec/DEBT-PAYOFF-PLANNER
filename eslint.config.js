const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // RN copy uses contractions and quoted phrases in <Text>; escaping hurts readability.
      "react/no-unescaped-entities": "off",
    },
  },
]);
