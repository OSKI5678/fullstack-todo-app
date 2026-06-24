const express = require('express');
const router = express.Router();
const { readData, saveData, getNextId } = require('../dbUtils');

// Pobieranie zadań zalogowanego użytkownika
router.get('/', (req, res) => {
  const userId = parseInt(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ message: 'Brak autoryzacji!' });

  const data = readData();
  const userTasks = data.tasks.filter((t) => t.userId === userId);
  res.json(userTasks);
});

// Dodawanie nowego zadania
router.post('/', (req, res) => {
  const userId = parseInt(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ message: 'Brak autoryzacji!' });

  const data = readData();
  const newTask = {
    id: getNextId(data.tasks),
    userId,
    title: req.body.title,
    completed: false,
    dueDate: req.body.dueDate || null,
  };

  data.tasks.push(newTask);
  saveData(data);
  res.status(201).json(newTask);
});

// Przełączanie statusu zadania (wykonane/niewykonane)
router.put('/:id', (req, res) => {
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

// Usuwanie zadania
router.delete('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const userId = parseInt(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ message: 'Brak autoryzacji!' });

  const data = readData();
  data.tasks = data.tasks.filter((t) => !(t.id === taskId && t.userId === userId));
  saveData(data);
  res.status(204).send();
});

module.exports = router;