const { google } = require("googleapis");

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

// Google Auth
const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ["https://www.googleapis.com/auth/drive.file"]
);

const drive = google.drive({
  version: "v3",
  auth,
});

module.exports = drive;
