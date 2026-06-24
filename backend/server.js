const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

const FILE_PATH = path.join(__dirname, 'db.json');

// Pomocnicze czytanie z bazy JSON
const readData = () => {
    if (!fs.existsSync(FILE_PATH)) {
        const initialData = { users: [], tasks: [] };
        fs.writeFileSync(FILE_PATH, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
};

// Pomocniczy zapis do bazy JSON
const saveData = (data) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
};

// --- AUTH: Rejestracja ---
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    const data = readData();

    if (data.users.find(u => u.username === username)) {
        return res.status(400).json({ message: "Użytkownik o takiej nazwie już istnieje!" });
    }

    const nextId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
    const newUser = { id: nextId, username, password };
    
    data.users.push(newUser);
    saveData(data);

    res.status(201).json({ id: newUser.id, username: newUser.username });
});

// --- AUTH: Logowanie ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const data = readData();

    const user = data.users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: "Błędny login lub hasło!" });
    }

    // Zwracamy podstawowe dane użytkownika (sukces logowania)
    res.json({ id: user.id, username: user.username });
});

// --- TASKS: Pobieranie zadań zalogowanego użytkownika ---
app.get('/api/tasks', (req, res) => {
    const userId = parseInt(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ message: "Brak autoryzacji!" });

    const data = readData();
    // userID = zadanie
    const userTasks = data.tasks.filter(t => t.userId === userId);
    res.json(userTasks);
});

// --- TASKS: Dodawanie zadania dla konkretnego użytkownika ---
app.post('/api/tasks', (req, res) => {
    const userId = parseInt(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ message: "Brak autoryzacji!" });

    const data = readData();
    const nextId = data.tasks.length > 0 ? Math.max(...data.tasks.map(t => t.id)) + 1 : 1;

    const newTask = {
        id: nextId,
        userId: userId,
        title: req.body.title
    };

    data.tasks.push(newTask);
    saveData(data);
    res.status(201).json(newTask);
});

// --- TASKS: Usuwanie zadania ---
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const userId = parseInt(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ message: "Brak autoryzacji!" });

    const data = readData();
    // Usuwanie zadania tylko jeśli ID się zgadza
    data.tasks = data.tasks.filter(t => !(t.id === taskId && t.userId === userId));
    saveData(data);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Serwer bazy danych v2 działa na http://localhost:${PORT}`);
});