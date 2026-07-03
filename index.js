require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/db');
const authRoutes = require('./src/routes/auth');
const notesRoutes = require('./src/routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ exposedHeaders: ['x-auth-token'] }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
