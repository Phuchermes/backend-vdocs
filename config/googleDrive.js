const { google } = require("googleapis");
const path = require("path");

const KEYFILEPATH = path.join(__dirname, "./magnetic-runway-479704-b7-a3557072f35c");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

module.exports = drive;
