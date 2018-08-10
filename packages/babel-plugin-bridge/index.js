const { existsSync, mkdirSync } = require('fs');
const { resolve } = require('path');
const { ncp } = require('ncp');
const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api, opts) => {
  api.assertVersion(7);

  const modules = opts.modules || 'node_modules';
  const out = opts.out || 'dist/modules';

  return {
    visitor: {
      ImportDeclaration({
        node: {
          source: { value },
        },
      }) {
        const outputDir = resolve(process.cwd(), out);
        if (!existsSync(outputDir)) mkdirSync(outputDir);

        const isLocalModule = value[0] === '.';
        if (isLocalModule) {
          const pathToModule = resolve(__dirname, value);
          const outputPath = resolve(process.cwd(), out, value);
          console.log(pathToModule, outputPath);
          if (!existsSync(outputPath)) {
            ncp(pathToModule, outputPath, err => console.error(err));
          }
          return;
        }

        const pathToModule = resolve(process.cwd(), modules, value);
        const outputPath = resolve(process.cwd(), out, value);
        console.log(pathToModule, outputPath);
        if (!existsSync(pathToModule)) {
          ncp(pathToModule, outputPath, err => console.error(err));
        }
      },
    },
  };
});
