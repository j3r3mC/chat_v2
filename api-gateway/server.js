// api-gateway/server.js
require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use((req, res, next) => {
  console.log(`🔍 API Gateway reçoit : ${req.method} ${req.url}`);
  next();
});


app.use('/api/auth', createProxyMiddleware({ target: 'http://127.0.0.1:3001', changeOrigin: true }));
app.use('/api/chat', createProxyMiddleware({
  target: 'http://127.0.0.1:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/chat': '/chat' } // Convertit "/api/chat/message" en "/chat/message"
}));


app.use('/api/admin', createProxyMiddleware({
  target: 'http://127.0.0.1:3003',
  changeOrigin: true,
  pathRewrite: { '^/api/admin': '/' }
}));




const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`API Gateway running on port ${PORT}`));
