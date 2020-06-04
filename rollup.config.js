import babel from "@rollup/plugin-babel";
import {eslint} from "rollup-plugin-eslint";
import resolve from "@rollup/plugin-node-resolve";

const sev = ["info", "warning", "error"];
const eslintFormatter = (results) => {
  const msgs = results.reduce((arr, v) => v.messages.length
    ? v.messages.reduce((a, m) => [...a, `${v.filePath}(${m.line}, ${m.column}): ${sev[m.severity]}: ${m.message}`], arr)
    : arr, []);
  return msgs.length === 0 ? undefined : "\n" + msgs.join("\n");
};

export default {
  input: "src/index.js",
  output: {
    file: "dist/service.js",
    format: "cjs",
    sourcemap: true
  },
  plugins: [
    eslint({formatter: eslintFormatter}),
    babel({babelHelpers: "bundled"}),
    resolve()
  ]
};
