const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'db.json');

// Pobieranie danych z pliku JSON
const readData = () => {
  if (!fs.existsSync(FILE_PATH)) {
    const initialData = { users: [], tasks: [] };
    fs.writeFileSync(FILE_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
};

// Zapisywanie danych do pliku JSON
const saveData = (data) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
};

// Generowanie kolejnego unikalnego ID
const getNextId = (items) =>
  items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

module.exports = { readData, saveData, getNextId };