const express = require("express");
const path = require("path");

//
// =========================
// MOCK DATA
// =========================
//

const documents3001 = [
  {
    workspace_id: "WS-ACME-001",
    title: "Master Service Agreement - Acme",
    type: "workspace",
    is_active: true,
    state: "pending",
    contents: [
      {
        item_id: "FLD-100",
        title: "Initial Drafts",
        type: "folder",
        is_active: true,
        contents: [],
      },
      {
        item_id: "FLD-101",
        title: "Ready for Signature",
        type: "folder",
        is_active: true,
        contents: [
          {
            item_id: "DOC-1001",
            title: "MSA_Acme_Final.pdf",
            type: "file",
            is_active: true,
            state: "pending_signature",
            download_url: "http://localhost:3001/documents/DOC-1001/download",
            retrieved_at: "2026-04-16T23:47:55.000Z",
          },
        ],
      },
    ],
  },
];

const documents4001 = {
  success: true,
  data: {
    uuid: "NWD-NDA-8821",
    label: "NDA - Northwind Distribution",
    nodeCategory: "Directory",
    activeStatus: 1,
    currentStatus: "Signed",
    nodes: [
      {
        uuid: "NWD-DIR-9901",
        label: "Executed Contracts",
        nodeCategory: "Directory",
        activeStatus: 1,
        nodes: [
          {
            uuid: "DOC-1002",
            label: "Northwind_NDA_Signed.pdf",
            nodeCategory: "Document",
            activeStatus: 1,
            currentStatus: "Signed",
            timestamp: "2026-04-16T23:47:55.000Z",
          },
        ],
      },
    ],
  },
};

const documents5001 = {
  header: {
    transactionId: "PO-7843-TRX",
    docName: "Purchase Order 7843 Process",
    kind: "ProcurementWorkflow",
    status: "Rejected",
    active: false,
  },
  subDocuments: [
    {
      docId: "GRP-001",
      docName: "Vendor Intake",
      kind: "Folder",
      active: true,
      subDocuments: [],
    },
    {
      docId: "GRP-002",
      docName: "Financial Approvals",
      kind: "Folder",
      active: true,
      subDocuments: [
        {
          docId: "DOC-1003",
          docName: "PO_7843_Fabrikam.pdf",
          kind: "File",
          active: true,
          status: "Rejected",
          downloadLink: "http://localhost:5001/documents/DOC-1003/download",
          lastSync: "2026-04-16T23:47:55.000Z",
        },
      ],
    },
  ],
};

const documents6001 = {
  id: "CW5078",
  name: "Test CW asimakin 062325 (eSignature testing) 2",
  documentType: "Contract Workspace (Procurement)",
  active: true,
  status: "Draft",
  childrenDocument: [
    {
      id: "WS2609206399",
      name: "Interim contract documents",
      documentType: "Folder",
      active: true,
      childrenDocument: [
        {
          id: "WS2609411500",
          name: "Negotiation documents",
          documentType: "Folder",
          active: true,
          childrenDocument: [],
        },
        {
          id: "WS2609411501",
          name: "SME's review",
          documentType: "Folder",
          active: true,
          childrenDocument: [],
        },
      ],
    },
    {
      id: "WS2609411503",
      name: "Final contract documents",
      documentType: "Folder",
      active: true,
      childrenDocument: [
        {
          id: "WS2609411504",
          name: "Documents for signing (PDF)",
          documentType: "Folder",
          active: true,
          childrenDocument: [
            {
              id: "WS2609411505",
              name: "Contract or job order",
              documentType: "Folder",
              active: true,
              childrenDocument: [
                {
                  id: "Doc2609411551",
                  name: "Goods_KZ_Law_Locals.pdf",
                  documentType: "Document",
                  active: true,
                  status: "Published",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "Doc2634592889",
      name: "Sign_K_S.pdf",
      documentType: "Document",
      active: true,
      status: "Draft",
    },
  ],
};

// Ariba-like mock data — same childrenDocument tree shape as 6001
// but represents a different contract workspace
const documents7001 = {
  id: "CW9001",
  name: "Mock Ariba Contract Workspace (IT Procurement)",
  documentType: "Contract Workspace (Procurement)",
  active: true,
  status: "Published",
  childrenDocument: [
    {
      id: "WS7001-FLD-001",
      name: "Supporting Documents",
      documentType: "Folder",
      active: true,
      childrenDocument: [
        {
          id: "WS7001-FLD-002",
          name: "Vendor Proposals",
          documentType: "Folder",
          active: true,
          childrenDocument: [],
        },
        {
          id: "WS7001-FLD-003",
          name: "Legal Review",
          documentType: "Folder",
          active: true,
          childrenDocument: [],
        },
      ],
    },
    {
      id: "WS7001-FLD-010",
      name: "Final Signed Documents",
      documentType: "Folder",
      active: true,
      childrenDocument: [
        {
          id: "WS7001-FLD-011",
          name: "PDFs for Signature",
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
          ],
        },
      ],
    },
    {
      id: "Doc7001-002",
      name: "IT_Framework_Agreement.pdf",
      documentType: "Document",
      active: true,
      status: "Draft",
    },
  ],
};

function findDocumentInTree(node, targetId) {
  if (!node || typeof node !== "object") return null;
  if (node.id === targetId && node.documentType === "Document") return node;
  const children = Array.isArray(node.childrenDocument) ? node.childrenDocument : [];
  for (const child of children) {
    const found = findDocumentInTree(child, targetId);
    if (found) return found;
  }
  return null;
}

//
// =========================
// PROVIDER 3001 (API KEY)
// =========================
//
const app1 = express();

app1.get("/auth", (req, res) => {
  if (req.headers["x-api-key"] === "12345") return res.json({ message: "Valid API Key" });
  return res.status(401).json({ error: "Invalid API Key" });
});

app1.use((req, res, next) => {
  if (req.headers["x-api-key"] === "12345") return next();
  return res.status(401).json({ error: "Unauthorized" });
});

app1.get("/documents", (req, res) => res.json(documents3001));

app1.get("/documents/:documentId/download", (req, res) => {
  const filePath = path.join(__dirname, "files", "3001.pdf");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${req.params.documentId}.pdf`);
  res.sendFile(filePath);
});

app1.listen(3001, () => console.log("Running 3001"));

//
// =========================
// PROVIDER 4001 (BASIC → TOKEN)
// =========================
//
const app2 = express();
app2.use(express.json());

app2.post("/auth", (req, res) => {
  if (req.headers["authorization"] === "Basic dXNlcjpwYXNz")
    return res.json({ token: "sample_token" });
  return res.status(401).json({ error: "Invalid Basic Auth" });
});

app2.use((req, res, next) => {
  if (req.headers["authorization"] === "Bearer sample_token") return next();
  return res.status(401).json({ error: "Unauthorized" });
});

app2.get("/documents", (req, res) => res.json(documents4001));

app2.get("/documents/:id/download", (req, res) => {
  const filePath = path.join(__dirname, "files", "4001.pdf");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.pdf`);
  res.sendFile(filePath);
});

app2.listen(4001, () => console.log("Running 4001"));

//
// =========================
// PROVIDER 5001 (LOGIN → TOKEN)
// =========================
//
const app3 = express();
app3.use(express.json());

app3.post("/auth", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin")
    return res.json({ access_token: "sample_token" });
  return res.status(401).json({ error: "Invalid credentials" });
});

app3.use((req, res, next) => {
  if (req.headers["authorization"] === "Bearer sample_token") return next();
  return res.status(401).json({ error: "Unauthorized" });
});

app3.get("/documents", (req, res) => res.json(documents5001));

app3.get("/documents/:id/download", (req, res) => {
  const filePath = path.join(__dirname, "files", "5001.pdf");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.pdf`);
  res.sendFile(filePath);
});

app3.listen(5001, () => console.log("Running 5001"));

//
// =========================
// PROVIDER 6001 (TREE SHAPE)
// =========================
//
const app4 = express();
app4.use(express.json());

app4.post("/auth", (req, res) => {
  const { username, password } = req.body || {};
  if (username === "treeuser" && password === "treepass")
    return res.json({ access_token: "sample_token" });
  return res.status(401).json({ error: "Invalid credentials" });
});

app4.use((req, res, next) => {
  if (req.headers["authorization"] === "Bearer sample_token") return next();
  return res.status(401).json({ error: "Unauthorized" });
});

app4.get("/documents", (req, res) => res.json(documents6001));

app4.get("/documents/:id/download", (req, res) => {
  const { id } = req.params;
  const doc = findDocumentInTree(documents6001, id);
  if (!doc) return res.status(404).json({ error: "Document not found" });
  const filePath = path.join(__dirname, "files", "6001.pdf");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${id}.pdf`);
  res.sendFile(filePath);
});

app4.listen(6001, () => console.log("Running 6001"));

//
// =========================
// PROVIDER 7001 (ARIBA-LIKE: APIKey auth + PATH params + shared header param)
// =========================
//
// Mimics Ariba pattern:
//   GET /api/retrieve-contract-workspaces/v1/prod/projectDocuments/${contractId}?realm=${realm}&user=${user}&passwordAdapter=${passwordAdapter}
//   Headers: APIKey, realm
// Auth: APIKey header (headerName = "APIKey", value = "mock-ariba-key-7001")
//
const app5 = express();
app5.use(express.json());

const ARIBA_API_KEY = "mock-ariba-key-7001";

// Auth check middleware — validates APIKey header
app5.use((req, res, next) => {
  const key = req.headers["apikey"];
  console.log(`[7001] ${req.method} ${req.url} | APIKey=${key} | realm=${req.headers["realm"]}`);
  if (key !== ARIBA_API_KEY) {
    console.warn(`[7001] Unauthorized — bad APIKey: ${key}`);
    return res.status(401).json({ error: "Unauthorized — invalid APIKey" });
  }
  next();
});

// GET /api/retrieve-contract-workspaces/v1/prod/projectDocuments/:contractId
// Query params: realm, user, passwordAdapter
// Headers: realm, APIKey (realm appears in both — intentional, mirrors real Ariba)
app5.get(
  "/api/retrieve-contract-workspaces/v1/prod/projectDocuments/:contractId",
  (req, res) => {
    const { contractId } = req.params;
    const { realm, user, passwordAdapter } = req.query;
    const realmHeader = req.headers["realm"];

    console.log(`[7001] LIST_DOCUMENTS contractId=${contractId} realm=${realm} user=${user} passwordAdapter=${passwordAdapter} realm-header=${realmHeader}`);

    if (!realm || !user || !passwordAdapter) {
      console.warn(`[7001] Missing query params`);
      return res.status(400).json({ error: "Missing required query params: realm, user, passwordAdapter" });
    }
    if (!realmHeader) {
      console.warn(`[7001] Missing realm header`);
      return res.status(400).json({ error: "Missing required header: realm" });
    }

    // Return same shape as 6001 (childrenDocument tree) but for this contract
    return res.json(documents7001);
  }
);

// GET /api/retrieve-contract-workspaces/v1/prod/projectDocuments/:contractId/documents/:documentId/download
app5.get(
  "/api/retrieve-contract-workspaces/v1/prod/projectDocuments/:contractId/documents/:documentId/download",
  (req, res) => {
    const { contractId, documentId } = req.params;
    console.log(`[7001] DOWNLOAD contractId=${contractId} documentId=${documentId}`);

    const doc = findDocumentInTree(documents7001, documentId);
    if (!doc) {
      console.warn(`[7001] Document not found: ${documentId}`);
      return res.status(404).json({ error: "Document not found" });
    }

    const filePath = path.join(__dirname, "files", "7001.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${documentId}.pdf`);
    res.sendFile(filePath);
  }
);

app5.listen(7001, () => console.log("Running 7001 (Ariba-like mock)"));