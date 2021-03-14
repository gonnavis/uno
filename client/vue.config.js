module.exports = {
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "Scuffed Uno";
      return args;
    });
  },
  pwa: {
    name: "Scuffed Uno",
    themeColor: "#570001",
    msTileColor: "#570001",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "default",
    manifestPath: "public/site.webmanifest",
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: "public/service-worker.js",
      // ...other Workbox options...
      exclude: [/\.map$/, /_redirects/],
    },
  },
};
