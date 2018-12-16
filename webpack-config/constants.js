module.exports = {
    filesJs: /\.js$/,
    filesCss: /\.css$/,
    filesPug: /\.pug$/,
    containsVue: /^\?vue/,
    filesVue: /\.vue$/,
    filesLess: /\.less$/,
    // fileToExcludeFromBabel: /bower_components/,
    fileToExcludeFromBabel: /(node_modules|bower_components)/,

    dirDist: 'dist',
    dirSource: 'src',
    dirIsomorphicResources: 'src/resources',
    dirWWW: 'www',
    dirWWWAlias: '/assets',

    entryAppAdmin: './src/vue-apps/admin/admin-client-browser-entry.js',
    entryAppPub: './src/vue-apps/pub/pub-client-browser-entry.js',
    entryLogin: './src/vue-apps/login/login-entry.js'
};