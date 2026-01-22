const { fork } = require("child_process");
const path = require("path");

function runWorker(workerFile, payload) {
  return new Promise((resolve, reject) => {
    const worker = fork(workerFile);

    worker.send(payload);

    worker.on("message", (msg) => {
      if (msg.success) resolve(msg);
      else reject(msg.error);
      worker.kill();
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(`Worker exited ${code}`);
    });
  });
}

process.on("message", async (job) => {
  try {
    if (job.type === "document") {
      await runWorker(
        path.join(__dirname, "documentWorker.js"),
        job
      );
    } else {
      // PDF + FILE upload
      await runWorker(
        path.join(__dirname, "pdfWorker.js"),
        job
      );
    }

    process.send({ success: true });
  } catch (err) {
    console.error("Dispatcher error:", err);
    process.send({ success: false, error: err });
  }
});
