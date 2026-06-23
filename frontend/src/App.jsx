import { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  // 1. Pobieranie z portu 3005
  const fetchTasks = () => {
    fetch('http://localhost:3005/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error("Błąd pobierania:", err));
  };

  // 2. Dodawanie na port 3005
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    fetch('http://localhost:3005/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    })
      .then(res => res.json())
      .then(newTask => {
        setTasks([...tasks, newTask]);
        setNewTitle('');
      })
      .catch(err => console.error("Błąd dodawania:", err));
  };

  // 3. Usuwanie z portu 3005 (Nowość!)
  const handleDeleteTask = (id) => {
    fetch(`http://localhost:3005/api/tasks/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        // Filtrujemy i usuwamy zadanie z widoku ekranu
        const updatedTasks = tasks.filter(task => task.id !== id);
        setTasks(updatedTasks);
      })
      .catch(err => console.error("Błąd usuwania:", err));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '450px', margin: '0 auto' }}>
      <h1>Lista Zadań (Fullstack)</h1>
      
      <form onSubmit={handleAddTask} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Co masz do zrobienia?" 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <button type="submit" style={{ padding: '8px 15px', cursor: 'pointer' }}>Dodaj</button>
      </form>

      {/* Lista zadań z nowymi przyciskami */}
      <ul style={{ paddingLeft: '0' }}>
        {tasks.map(task => (
          <li key={task.id} style={{ 
            listStyle: 'none',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px',
            borderBottom: '1px solid #555'
          }}>
            <span><strong>{task.id}.</strong> {task.title}</span>
            
            {/* Przycisk Usuń */}
            <button 
              onClick={() => handleDeleteTask(task.id)}
              style={{ 
                padding: '5px 10px', 
                backgroundColor: '#ff4d4d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Usuń
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;