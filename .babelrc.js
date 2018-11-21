"use strict";




var
    // used babel-plugins array
    commonPlugins = [
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-syntax-dynamic-import",
        "@babel/plugin-transform-arrow-functions",
        "@babel/plugin-transform-async-to-generator",
        "@babel/plugin-transform-block-scoped-functions",
        "@babel/plugin-transform-block-scoping",
        "@babel/plugin-transform-computed-properties",
        "@babel/plugin-transform-destructuring",
        "@babel/plugin-transform-exponentiation-operator",
        "@babel/plugin-transform-literals",
        "@babel/plugin-transform-parameters",
        "@babel/plugin-transform-regenerator",
        "@babel/plugin-transform-runtime",
        "@babel/plugin-transform-shorthand-properties",
        "@babel/plugin-transform-spread",
        "@babel/plugin-transform-template-literals"
    ],

    // ES environment config
    esEnv = {
        presets: [
            [
                "@babel/preset-env",
                {
                    modules: false,
                    shippedProposals: true,
                    forceAllTransforms: true,
                },
            ],
        ],
        plugins: commonPlugins,
        comments: false,
    }




// configuration
module.exports = function (api) {
    api.cache.using(() => process.env.BABEL_ENV);
    console.log("Compiling for", "'" + api.env() + "'", "...")

    return {

        env: {

            // deneb production environment
            production: esEnv,

            // deneb development environment
            development: {
                presets: [
                    [
                        "@babel/preset-env",
                        {
                            modules: "commonjs",
                            shippedProposals: true,
                        },
                    ],
                ],
                plugins: commonPlugins.concat([
                    "@babel/plugin-transform-modules-commonjs",
                    [
                        "file-loader",
                        {
                            "name": "[name].[ext]",
                            "extensions": ["sql"],
                            "publicPath": "./",
                            "outputPath": null,
                            "context": "",
                            "limit": 0,
                        },
                    ],
                ]),
                comments: false,
            },

        },

    }
}
