# alt:V Webpack Plugin

### Why?

Webpack v4 does not support outputting external dependencies as ESM imports. The alt:V client-side engine will only
allow you to import the `alt` runtime using an ESM import. Webpack v5 will have this ability, but this plugin can be used until then.

### What's it do?

This plugin will take all of your alt:V dependencies (`alt`, `alt-client`, `alt-server`), marks them as external dependencies, 
and adds a single ESM import at the top of each output file that will be used in place of all of these modules.

### Installation

#### Download the plugin

The plugin is available via npm:

```
npm i -D altv-webpack-plugin
```

#### Add the plugin to your Webpack config

```js
const AltvWebpackPlugin = require('altv-webpack-plugin');

module.exports = {
    entry: './src/client/index.js',
    plugins: [
        new AltvWebpackPlugin() // no configuration needed
    ]
    ...
};
```
