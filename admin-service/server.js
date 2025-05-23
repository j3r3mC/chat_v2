// admin service/server.js

require('dotenv').config();
const express = require('express');
const AdminRoutes = require('./routes/admin');

const app = express();
app.use(express.json());


app.use((req, res, next) => {
  console.log(`🔍 Admin Service reçoit : ${req.method} ${req.url}`);
  next();
});

// Point d'entrée de l'API
app.use('/', AdminRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Admin service running on port ${PORT}`);
});
