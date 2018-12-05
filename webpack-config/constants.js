module.exports = {
    filesJs: /\.js$/,
    filesCss: /\.css$/,
    filesPug: /\.pug$/,
    containsVue: /^\?vue/,
    filesVue: /\.vue$/,
    filesLess: /\.less$/,
    fileToExcludeFromBabel: /(node_modules|bower_components)/,

    dirDist: 'dist',
    dirSource: 'src',
    dirIsomorphicResources: 'src/resources',
    dirWWW: 'www',
    dirWWWAlias: '/assets/',

    entryAppAdmin: './src/admin-vue-app/admin-client-browser-entry.js',
    entryAppPub: './src/pub-vue-app/pub-client-browser-entry.js'
};