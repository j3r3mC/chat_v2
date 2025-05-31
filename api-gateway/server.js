require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
app.use(cors()); // Autorise les requêtes inter-origines
app.use(express.json());

// Middleware de débogage pour afficher les requêtes entrantes
app.use((req, res, next) => {
  console.log(`🔍 API Gateway reçoit : ${req.method} ${req.url}`);
  next();
});

// Proxy vers auth-service (avec gestion du body)
app.use("/api/auth", createProxyMiddleware({
  target: "http://127.0.0.1:3001",
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.write(bodyData);
    }
  }
}));

// Proxy vers chat-service
// Proxy vers chat-service
app.use("/api/chat", createProxyMiddleware({
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
  }
}));


// Proxy vers admin-service
app.use("/api/admin", createProxyMiddleware({
  target: "http://127.0.0.1:3003",
  changeOrigin: true,
  pathRewrite: { "^/api/admin": "/" }
}));

// Proxy vers channel-service (ajout du onProxyReq pour transmettre le body)
app.use("/api/channels", createProxyMiddleware({
  target: "http://127.0.0.1:3004",
  changeOrigin: true,
  pathRewrite: { "^/api/channels": "" },
  onProxyReq: (proxyReq, req, res) => {
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      // Met à jour Content-Length et Content-Type
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.setHeader("Content-Type", "application/json");
      // Écrit le body dans la requête proxifiée
      proxyReq.write(bodyData);
    }
  }
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ API Gateway en écoute sur le port ${PORT}`));
