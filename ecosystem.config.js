module.exports = {
  apps: [
    {
      name: "backendvdocs",
      script: "./index.js",
      env: {
        PORT: 3000,
        MONGO_URI: "mongodb://127.0.0.1:27017/fileuploads",
      },
    },
  ],
};