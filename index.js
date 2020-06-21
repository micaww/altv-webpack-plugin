const { ConcatSource } = require('webpack-sources');

const ALT_RUNTIMES = ['alt', 'alt-client', 'alt-server']; // all modules we will intercept

const ALT_ID = 'alt'; // the variable name to import the alt:V runtime as
const NATIVES_ID = 'natives'; // the variable name to import the natives runtime as

class AltvPlugin {
    apply(compiler) {
        const options = compiler.options;

        const externals = Array.isArray(options.externals) ? options.externals : [options.externals];

        // make all alt:V runtimes external so Webpack doesn't try to bundle them in
        const altExternals = {
            natives: NATIVES_ID
        };
        ALT_RUNTIMES.forEach(id => altExternals[id] = ALT_ID);
        externals.push(altExternals);

        options.externals = externals;

        compiler.hooks.compilation.tap('AltvPlugin', compilation => {
            compilation.hooks.optimizeChunkAssets.tap('AltvPlugin', chunks => {
                for (const chunk of chunks) {
                    // alt
                    if (ALT_RUNTIMES.some(module => doesChunkImport(chunk, module))) {
                        for (const fileName of chunk.files) {
                            addImportHeader(compilation, fileName, ALT_ID, 'alt');
                        }
                    }

                    // alt
                    if (doesChunkImport(chunk, 'natives')) {
                        for (const fileName of chunk.files) {
                            addImportHeader(compilation, fileName, NATIVES_ID, 'natives');
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
 * @param {string} importName - the name of the imported variable
 * @param {string} moduleName - the name of the module to import
 */
function addImportHeader(compilation, fileName, importName, moduleName) {
    const currentSource = compilation.assets[fileName];

    compilation.assets[fileName] = new ConcatSource(
        `import ${importName} from '${moduleName}';\n`,
        currentSource
    );
}

/**
 * Checks if a chunk imports a module.
 *
 * @param {object} chunk - webpack compilation chunk
 * @param {string} moduleName - the name of the module.
 */
function doesChunkImport(chunk, moduleName) {
    for (const module of chunk._modules) {
        if (module.id === moduleName) return true;
    }

    return false;
}

module.exports = AltvPlugin;