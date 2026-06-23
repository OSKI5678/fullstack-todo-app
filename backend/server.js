const express = require('express');
const cors = require('cors');
const fs = require('fs');       // NOWOŚĆ: Moduł do obsługi plików na dysku
const path = require('path');   // NOWOŚĆ: Pomaga tworzyć bezpieczne ścieżki do plików
const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// Ścieżka do naszego pliku z danymi (stworzy się w tym samym folderze)
const FILE_PATH = path.join(__dirname, 'tasks.json');

// 🛠️ Funkcja pomocnicza: Czytanie zadań z pliku
const readTasksFromFile = () => {
    try {
        // Jeśli plik jeszcze nie istnieje, stwórz go z początkowymi zadaniami
        if (!fs.existsSync(FILE_PATH)) {
            const defaultTasks = [
                { id: 1, title: "Kupić mleko" },
                { id: 2, title: "Nauczyć się Node.js" }
            ];
            fs.writeFileSync(FILE_PATH, JSON.stringify(defaultTasks, null, 2));
            return defaultTasks;
        }
        // Jeśli istnieje, przeczytaj go i zamień tekst na obiekt JavaScript
        const fileData = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(fileData);
    } catch (err) {
        console.error("Błąd odczytu pliku:", err);
        return [];
    }
};

// 🛠️ Funkcja pomocnicza: Zapisywanie zadań do pliku
const writeTasksToFile = (tasks) => {
    try {
        // Zamienia obiekt/tablicę na ładnie sformatowany tekst JSON i zapisuje na dysku
        fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2));
    } catch (err) {
        console.error("Błąd zapisu do pliku:", err);
    }
};

// 1. Pobieranie (GET)
app.get('/api/tasks', (req, res) => {
    const tasks = readTasksFromFile(); // Czytamy prosto z pliku!
    res.json(tasks); 
});

// 2. Dodawanie (POST)
app.post('/api/tasks', (req, res) => {
    const tasks = readTasksFromFile();
    
    // Ulepszone generowanie ID (szukamy najwyższego ID i dodajemy 1)
    const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

    const newTask = {
        id: nextId,
        title: req.body.title
    };
    
    tasks.push(newTask);
    writeTasksToFile(tasks); // Zapisujemy zaktualizowaną listę do pliku!
    
    res.status(201).json(newTask);
});

// 3. Usuwanie (DELETE)
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    let tasks = readTasksFromFile();
    
    tasks = tasks.filter(task => task.id !== taskId);
    writeTasksToFile(tasks); // Zapisujemy listę po usunięciu zadania!
    
    res.status(204).send();
});

// 4. Start serwera
app.listen(PORT, () => {
    console.log(`Serwer działa jak złoto na http://localhost:${PORT}`);
});