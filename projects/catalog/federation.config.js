const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'catalog',

  // Share TS path-mapped workspace libs (see tsconfig.json compilerOptions.paths)
  // This prevents bundling the same library into multiple MFEs (which can trigger NG0912 collisions).
  sharedMappings: ['ui'],



  exposes: {
    './routes': './projects/catalog/src/app/remote-routes.ts'
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    // New feature for more performance and avoiding
    // issues with node libs. Comment this out to
    // get the traditional behavior:
    // NOTE: Keep OFF for now (see shell federation.config.js)
    ignoreUnusedDeps: false
  }
});
