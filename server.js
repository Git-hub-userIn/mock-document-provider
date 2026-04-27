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
        {
          id: "Doc7001-003",
          name: "Rights_Procurement_Contract_Final.pdf",
          documentType: "Document",
          active: true,
          status: "Published",
        },
        {
          id: "DOC-1000",
          name: "MSA_Acme_Final0.pdf",
          documentType: "Document",
          is_active: true,
          state: "pending_signature",
          download_url: "http://localhost:3001/documents/DOC-1001/download",
          retrieved_at: "2026-04-16T23:47:55.000Z",
        },
        {
          id: "DOC-1001",
          name: "MSA_Acme_Final.pdf",
          documentType: "Document",
          is_active: true,
          state: "pending_signature",
          download_url: "http://localhost:3001/documents/DOC-1001/download",
          retrieved_at: "2026-04-16T23:47:55.000Z",
        },
        {
          id: "DOC-1002",
          name: "MSA_Acme_Final2.pdf",
          documentType: "Document",
          is_active: true,
          state: "pending_signature",
          download_url: "http://localhost:3001/documents/DOC-1001/download",
          retrieved_at: "2026-04-16T23:47:55.000Z",
        },
        {
          id: "DOC-1003",
          name: "MSA_Acme_Final3.pdf",
          documentType: "Document",
          is_active: true,
          state: "pending_signature",
          download_url: "http://localhost:3001/documents/DOC-1001/download",
          retrieved_at: "2026-04-16T23:47:55.000Z",
        },
        {
          id: "DOC-1004",
          name: "MSA_Acme_Final4.pdf",
          documentType: "Document",
          is_active: true,
          state: "pending_signature",
          download_url: "http://localhost:3001/documents/DOC-1001/download",
          retrieved_at: "2026-04-16T23:47:55.000Z",
        },
        {
          id: "DOC-1005",
          name: "MSA_Acme_Final5.pdf",
          documentType: "Document",
          is_active: true,
          state: "pending_signature",
          download_url: "http://localhost:3001/documents/DOC-1001/download",
          retrieved_at: "2026-04-16T23:47:55.000Z",
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
