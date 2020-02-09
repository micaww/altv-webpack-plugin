const { ConcatSource } = require('webpack-sources');

const ALT_RUNTIMES = ['alt', 'alt-client', 'alt-server']; // all modules we will intercept
const ALT_ID = 'alt'; // the variable name to import the alt:V runtime as

class AltvPlugin {
    apply(compiler) {
        const options = compiler.options;

        const externals = Array.isArray(options.externals) ? options.externals : [options.externals];

        // make all alt:V runtimes external so Webpack doesn't try to bundle them in
        const altExternals = {};
        ALT_RUNTIMES.forEach(id => altExternals[id] = ALT_ID);
        externals.push(altExternals);

        options.externals = externals;

        compiler.hooks.compilation.tap('AltvPlugin', compilation => {
            compilation.hooks.optimizeChunkAssets.tap('AltvPlugin', chunks => {
                for (const chunk of chunks) {
                    const hasAltImport = doesChunkImportAlt(chunk);

                    if (hasAltImport) {
                        for (const fileName of chunk.files) {
                            addImportHeader(compilation, fileName);
                        }
                    }
                }
            });
        });
    }
}

/**
 * Adds the ESM import for the alt:V runtime to the top of the file.
 *
 * @param {object} compilation - webpack's compilation object
 * @param {string} fileName - the name of the output file in a chunk
 */
function addImportHeader(compilation, fileName) {
    const currentSource = compilation.assets[fileName];

    compilation.assets[fileName] = new ConcatSource(
        `import alt from 'alt';\n\n`,
        currentSource
    );
}

/**
 * Checks if a chunk imports any alt:V runtime.
 *
 * @param {object} chunk - webpack compilation chunk
 */
function doesChunkImportAlt(chunk) {
    for (const module of chunk._modules) {
        if (ALT_RUNTIMES.includes(module.id)) return true;
    }

    return false;
}

module.exports = AltvPlugin;