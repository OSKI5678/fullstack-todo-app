const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { readData, saveData, getNextId } = require('../dbUtils');

const SALT_ROUNDS = 10;

// Rejestracja użytkownika
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Wpisz login i hasło!' });
  }

  const data = readData();

  if (data.users.find((u) => u.username === username)) {
    return res.status(400).json({ message: 'Użytkownik o takiej nazwie już istnieje!' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = { id: getNextId(data.users), username, passwordHash };
  data.users.push(newUser);
  saveData(data);

  res.status(201).json({ id: newUser.id, username: newUser.username });
});

// Logowanie użytkownika
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Wpisz login i hasło!' });
  }

  const data = readData();
  const user = data.users.find((u) => u.username === username);

  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !passwordMatches) {
    return res.status(401).json({ message: 'Błędny login lub hasło!' });
  }

  res.json({ id: user.id, username: user.username });
});

module.exports = router;