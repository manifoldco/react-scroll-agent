const { existsSync, mkdirSync } = require('fs');
const { resolve } = require('path');
const { rollup } = require('rollup');
const babel = require('rollup-plugin-babel');
const { uglify } = require('rollup-plugin-uglify');

if (!existsSync('dist')) {
  mkdirSync(resolve(__dirname, 'dist'));
}

const plugins = {
  cjs: [babel(), uglify()],
  esm: [babel()],
  iife: [babel(), uglify()],
};

const build = format =>
  rollup({
    input: './src/ScrollAgent.js',
    plugins: plugins[format],
  }).then(bundle =>
    bundle.write({
      file: `./dist/${format}.js`,
      format,
      name: 'ScrollAgent',
    })
  );

build('cjs');
build('iife');
build('esm');
