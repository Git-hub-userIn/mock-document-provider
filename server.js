const express = require("express");
const path = require("path");

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

const API_KEY = "mock-ariba-key-7001";

const documents = {
  id: "CW9001",
  name: "Mock Ariba Contract Workspace (IT Procurement)",
  documentType: "Contract Workspace (Procurement)",
  active: true,
  status: "Published",
  childrenDocument: [
    {
      id: "WS7001-FLD-010",
      name: "Final Documents",
      documentType: "Folder",
      active: true,
      childrenDocument: [
        {
          id: "Doc7001-001",
          name: "IT_Procurement_Contract_Final.pdf",
          documentType: "Document",
          active: true,
          status: "Published",
        },
        {
          id: "Doc7001-002",
          name: "Land_Procurement_Contract_Final.pdf",
          documentType: "Document",
          active: true,
          status: "Published",
        },
      ],
    },
  ],
};

// GET /auth
app.get("/auth", (req, res) => {
  console.log(`[mock] GET /auth | APIKey=${req.headers["apikey"]}`);
  if (req.headers["apikey"] !== API_KEY)
    return res.status(401).json({ error: "Unauthorized" });
  return res.json({ message: "Valid API Key" });
});

// GET /documents
app.get("/documents", (req, res) => {
  console.log(`[mock] GET /documents | APIKey=${req.headers["apikey"]}`);
  if (req.headers["apikey"] !== API_KEY)
    return res.status(401).json({ error: "Unauthorized" });
  return res.json(documents);
});

// GET /documents/:id/files
app.get("/documents/:id/files", (req, res) => {
  console.log(
    `[mock] GET /documents/${req.params.id}/files | APIKey=${req.headers["apikey"]}`
  );
  if (req.headers["apikey"] !== API_KEY)
    return res.status(401).json({ error: "Unauthorized" });
  const filePath = path.join(__dirname, "files", "3001.pdf");
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${req.params.id}.pdf`
  );
  res.sendFile(filePath);
});

app.get("/", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`Mock server running on port ${PORT}`));
