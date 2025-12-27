const { fork } = require("child_process");
const path = require("path");

function runUploadWorker(job) {
  return new Promise((resolve, reject) => {
    const worker = fork(
      path.join(__dirname, "../workers/uploadWorker.js"),
      [],
      { stdio: ["inherit", "inherit", "inherit", "ipc"] }
    );

    worker.send(job);

    worker.on("message", msg => {
      worker.kill();
      msg.success ? resolve(msg) : reject(msg);
    });

    worker.on("error", reject);
  });
}

module.exports = { runUploadWorker };
