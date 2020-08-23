module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        jest: true,
        webextensions: true,
    },
    extends: ["eslint:recommended", "plugin:react/recommended"],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
        chrome: true,
        SQL: true,
    },
    parser: "babel-eslint",
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
            modules: true,
            experimentalObjectRestSpread: true,
        },
    },
    plugins: ["react"],
    rules: {
        "no-unused-vars": "off",
        "no-inner-declarations": "off",
        "no-case-declarations": "off",
    },
};
