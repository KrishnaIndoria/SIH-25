const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer({ dest: "uploads/" });

// Serve static frontend from public/
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Upload timetable files -> forward to Python API
app.post("/api/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const form = new FormData();

    // Attach all uploaded files
    req.files.forEach((file) => {
      form.append("file", fs.createReadStream(file.path), file.originalname);
    });

    // Forward request to Python backend
    const response = await axios.post("http://127.0.0.1:5000/upload", form, {
      headers: form.getHeaders(),
    });

    // Cleanup uploaded files
    req.files.forEach((file) => fs.unlinkSync(file.path));

    res.json(response.data);
  } catch (err) {
    console.error("Error forwarding file:", err.message);
    res.status(500).json({ error: "Failed to process file" });
  }
});

// Start Node server
app.listen(3000, () => {
  console.log("Node server running at http://127.0.0.1:3000");
});
