require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de débogage pour afficher les requêtes entrantes
app.use((req, res, next) => {
  console.log(`🔍 API Gateway reçoit : ${req.method} ${req.url}`);
  console.log("🛠️ Headers reçus :", req.headers);
  next();
});

// Proxy vers Auth-Service
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://127.0.0.1:3001",
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.write(bodyData);
      }
    },
  })
);

// Proxy vers Chat-Service
app.use(
  "/api/chat",
  createProxyMiddleware({
    target: "http://127.0.0.1:3002",
    changeOrigin: true,
    pathRewrite: { "^/api/chat": "/chat" },
    onProxyReq: (proxyReq, req, res) => {
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.write(bodyData);
      }
    },
  })
);

// Proxy vers Admin-Service
app.use(
  "/api/admin",
  createProxyMiddleware({
    target: "http://127.0.0.1:3003",
    changeOrigin: true,
  })
);

// Proxy vers Channel-Service
app.use(
  "/api/channels",
  createProxyMiddleware({
    target: "http://127.0.0.1:3004",
    changeOrigin: true,
    pathRewrite: { "^/api/channels": "" },
    onProxyReq: (proxyReq, req, res) => {
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.write(bodyData);
      }
    },
  })
);

// Proxy vers Private-Message-Service
app.use(
  "/api/private-messages",
  createProxyMiddleware({
    target: "http://127.0.0.1:5002",
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.write(bodyData);
      }
    },
  })
);

// Ajout du proxy pour les fichiers statiques
app.use(
  "/upload",
  createProxyMiddleware({
    target: "http://127.0.0.1:5002",
    changeOrigin: true,
  })
);

app.use((req, res, next) => {
  console.log(`🔍 API Gateway transmet la requête : ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ API Gateway en écoute sur le port ${PORT}`)
);
