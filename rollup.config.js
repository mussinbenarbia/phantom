import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import replace from "@rollup/plugin-replace";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const extensions = [".ts"];

const babelRuntimeVersion = pkg.devDependencies["@babel/runtime"].replace(
  /^[^0-9]*/,
  ""
);

const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return (id) => pattern.test(id);
};

export default [
  // Experimental
  {
    input: "src/index.ts",
    output: {
      file: "x/phantom.js",
      format: "cjs",
      indent: false,
      exports: "named",
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({ useTsconfigDeclarationDir: true }),
      babel({
        extensions,
        plugins: [
          ["@babel/plugin-transform-runtime", { version: babelRuntimeVersion }],
        ],
        runtimeHelpers: true,
      }),
    ],
  },
  // CommonJS
  {
    input: "src/index.ts",
    output: {
      file: "lib/phantom.js",
      format: "cjs",
      indent: false,
      exports: "named",
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({ useTsconfigDeclarationDir: true }),
      babel({
        extensions,
        plugins: [
          ["@babel/plugin-transform-runtime", { version: babelRuntimeVersion }],
        ],
        runtimeHelpers: true,
      }),
    ],
  },

  // ES
  {
    input: "src/index.ts",
    output: {
      file: "es/phantom.js",
      format: "es",
      indent: false,
      exports: "auto",
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({
        tsconfigOverride: { compilerOptions: { declaration: false } },
      }),
      babel({
        extensions,
        plugins: [
          [
            "@babel/plugin-transform-runtime",
            { version: babelRuntimeVersion, useESModules: true },
          ],
        ],
        runtimeHelpers: true,
      }),
    ],
  },

  // ES for Browsers
  {
    input: "src/index.ts",
    output: { file: "es/phantom.mjs", format: "es", indent: false },
    plugins: [
      nodeResolve({
        extensions,
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      typescript({
        tsconfigOverride: {
          compilerOptions: { declaration: false, target: "es2019" },
        },
      }),
      babel({
        extensions,
        exclude: "node_modules/**",
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },

  // UMD Development
  {
    input: "src/index.ts",
    output: {
      file: "dist/phantom.js",
      format: "umd",
      name: "Phantom",
      indent: false,
      exports: "named",
    },
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({
        tsconfigOverride: { compilerOptions: { declaration: false } },
      }),
      babel({
        extensions,
        exclude: "node_modules/**",
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("development"),
      }),
    ],
  },

  // UMD Production
  {
    input: "src/index.ts",
    output: {
      file: "dist/phantom.min.js",
      format: "umd",
      name: "Phantom",
      indent: false,
      exports: "named",
    },
    plugins: [
      nodeResolve({
        extensions,
      }),
      typescript({
        tsconfigOverride: {
          compilerOptions: { declaration: false, target: "es2019" },
        },
      }),
      babel({
        extensions,
        exclude: "node_modules/**",
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
];
