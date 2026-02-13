const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'shell',

  // Share TS path-mapped workspace libs (see tsconfig.json compilerOptions.paths)
  // This prevents bundling the same library into multiple MFEs (which can trigger NG0912 collisions).
  sharedMappings: ['ui'],


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
    // NOTE: We keep this OFF for now because it can aggressively remove
    // sharedMappings (TS path-mapped workspace libs) during analysis in dev,
    // which leads to the same library being bundled into multiple MFEs and can
    // trigger Angular NG0912 component id collisions.
    ignoreUnusedDeps: false
  }
});
