const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "Scuffed Uno";
      args[0].template = "client/public/index.html";
      return args;
    });

    config.entry("app").clear();
    config.entry("app").add("./client/src/main.js");
  },

  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),
      },
    },

    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, "client/public"),
            to: path.join(__dirname, "client/dist"),
            globOptions: {
              ignore: ["index.html"],
            },
          },
        ],
      }),
    ],
  },

  pwa: {
    name: "Scuffed Uno",
    themeColor: "#570001",
    msTileColor: "#570001",
    backgroundColor: "#570001",
    orientation: "landscape",
    startUrl: "/",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "default",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    manifestPath: "public/site.webmanifest",
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: "client/public/service-worker.js",
      // ...other Workbox options...
      exclude: [/\.map$/, /_redirects/],
    },
  },

  outputDir: "client/dist",
};
