const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3005;
const FILE_PATH = path.join(__dirname, 'db.json');
const SALT_ROUNDS = 10;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Prosta "baza danych" oparta na pliku JSON.
// ---------------------------------------------------------------------------

const readData = () => {
  if (!fs.existsSync(FILE_PATH)) {
    const initialData = { users: [], tasks: [] };
    fs.writeFileSync(FILE_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
};

const saveData = (data) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
};

const getNextId = (items) =>
  items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

// ---------------------------------------------------------------------------
// Autoryzacja
// ---------------------------------------------------------------------------

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Wpisz login i hasło!' });
  }

  const data = readData();

  if (data.users.find((u) => u.username === username)) {
    return res.status(400).json({ message: 'Użytkownik o takiej nazwie już istnieje!' });
  }

  // Hasło nigdy nie jest zapisywane w czystym tekście - zamieniamy je na hash.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = { id: getNextId(data.users), username, passwordHash };
  data.users.push(newUser);
  saveData(data);

  res.status(201).json({ id: newUser.id, username: newUser.username });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Wpisz login i hasło!' });
  }

  const data = readData();
  const user = data.users.find((u) => u.username === username);

  // To samo zaokrąglenie komunikatu błędu dla "brak użytkownika" i "błędne hasło" -
  // dzięki temu osoba próbująca odgadnąć konta nie wie, czy login istnieje.
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !passwordMatches) {
    return res.status(401).json({ message: 'Błędny login lub hasło!' });
  }

  res.json({ id: user.id, username: user.username });
});

// ---------------------------------------------------------------------------
// Zadania
// ---------------------------------------------------------------------------

app.get('/api/tasks', (req, res) => {
  const userId = parseInt(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ message: 'Brak autoryzacji!' });

  const data = readData();
  const userTasks = data.tasks.filter((t) => t.userId === userId);
  res.json(userTasks);
});

app.post('/api/tasks', (req, res) => {
  const userId = parseInt(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ message: 'Brak autoryzacji!' });

  const data = readData();
  const newTask = {
    id: getNextId(data.tasks),
    userId,
    title: req.body.title,
    completed: false,
    // dueDate jest opcjonalne - null oznacza "bez terminu"
    dueDate: req.body.dueDate || null,
  };

  data.tasks.push(newTask);
  saveData(data);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const userId = parseInt(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ message: 'Brak autoryzacji!' });

  const data = readData();
  const task = data.tasks.find((t) => t.id === taskId && t.userId === userId);
  if (!task) return res.status(404).json({ message: 'Nie znaleziono zadania' });

  task.completed = !task.completed;
  saveData(data);
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const userId = parseInt(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ message: 'Brak autoryzacji!' });

  const data = readData();
  data.tasks = data.tasks.filter((t) => !(t.id === taskId && t.userId === userId));
  saveData(data);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Serwer bazy danych v3 działa na http://localhost:${PORT}`);
});