import io from "socket.io-client";

const socket = io("http://192.168.1.76:8000");

// Join room theo department
socket.emit("joinDepartment", user.department);

// Nghe file mới
socket.on("fileUploaded", (file) => {
  console.log("Có file mới:", file);
  // Update UI list file
});
