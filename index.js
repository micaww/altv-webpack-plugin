const webpack = require('webpack');

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
            compilation.hooks.processAssets.tap({
                name: 'AltvPlugin',
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
            }, assets => {
                for (const [name, asset] of Object.entries(assets)) {
                    // alt
                    if (ALT_RUNTIMES.some(module => doesAssetImport(asset, module))) {
                        addImportHeader(assets, name, ALT_ID, 'alt');
                    }

                    // natives
                    if (doesAssetImport(asset, 'natives')) {
                        addImportHeader(assets, name, NATIVES_ID, 'natives');
                    }
                }
            });
        });
    }
}

/**
 * Adds the ESM import for the alt:V runtime to the top of the file.
 *
 * @param {object} assets - webpack assets
 * @param {string} name - asset name
 * @param {string} importName - the name of the imported variable
 * @param {string} moduleName - the name of the module to import
 */
function addImportHeader(assets, name, importName, moduleName) {
    assets[name] = new webpack.sources.ConcatSource(
        `import ${importName} from '${moduleName}';\n`,
        assets[name]
    );
}

/**
 * Checks if an asset imports a module.
 *
 * @param {object} asset - webpack asset
 * @param {string} moduleName - the name of the module.
 */
function doesAssetImport(asset, moduleName) {
    for (const child of asset.original().getChildren()) {
        if (child.source().includes(`"${moduleName}"`)) {
            return true;
        }
    }

    return false;
}

module.exports = AltvPlugin;
