const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// Rejestrujemy moduły tras pod odpowiednimi prefiksami URL
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`Zmodularyzowany serwer NextTask działa na http://localhost:${PORT}`);
});