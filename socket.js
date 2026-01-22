import io from "socket.io-client";

const socket = io("https://backendvdocs.duckdns.org");

// Join room theo department
socket.emit("joinDepartment", user.department);

// Nghe file mới
socket.on("fileUploaded", (file) => {
  console.log("Có file mới:", file);
  // Update UI list file
});
