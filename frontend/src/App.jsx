import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  
  // Dane do formularza logowania/rejestracji
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [message, setMessage] = useState('');

  // Pobieraj zadania tylko wtedy, gdy użytkownik jest zalogowany
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:3005/api/tasks', {
      headers: { 'X-User-Id': user.id } // Wysyłamy ID użytkownika w nagłówku
    });
    const data = await res.json();
    setTasks(data);
  };

  const handleRegister = async () => {
    if (!usernameInput || !passwordInput) return setMessage('Wpisz login i hasło!');
    const res = await fetch('http://localhost:3005/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Zarejestrowano pomyślnie! Teraz możesz się zalogować.');
    } else {
      setMessage(data.message);
    }
  };

  const handleLogin = async () => {
    if (!usernameInput || !passwordInput) return setMessage('Wpisz login i hasło!');
    const res = await fetch('http://localhost:3005/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data); // Zapisujemy użytkownika w stanie aplikacji
      setMessage('');
    } else {
      setMessage(data.message);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const res = await fetch('http://localhost:3005/api/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-User-Id': user.id
      },
      body: JSON.stringify({ title: input })
    });
    const newTask = await res.json();
    setTasks([...tasks, newTask]);
    setInput('');
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:3005/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'X-User-Id': user.id }
    });
    setTasks(tasks.filter(task => task.id !== id));
  };

  // 1. WIDOK DLA NIEZALOGOWANEGO UŻYTKOWNIKA
  if (!user) {
    return (
      <div className="App">
        <h1>System Logowania</h1>
        <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: 'auto' }}>
          <input 
            type="text" 
            placeholder="Login" 
            value={usernameInput} 
            onChange={(e) => setUsernameInput(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Hasło" 
            value={passwordInput} 
            onChange={(e) => setPasswordInput(e.target.value)} 
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleLogin}>Zaloguj się</button>
            <button onClick={handleRegister} style={{ backgroundColor: '#555' }}>Zarejestruj</button>
          </div>
          {message && <p style={{ color: 'orange', fontSize: '0.9em' }}>{message}</p>}
        </div>
      </div>
    );
  }

  // 2. WIDOK DLA ZALOGOWANEGO UŻYTKOWNIKA
  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span>Zalogowany jako: <b>{user.username}</b></span>
        <button onClick={() => setUser(null)} style={{ backgroundColor: '#d9534f', padding: '5px 10px' }}>Wyloguj</button>
      </div>

      <h1>Moja Lista Zadań</h1>
      
      <form onSubmit={addTask}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Co masz do zrobienia?"
        />
        <button type="submit">Dodaj</button>
      </form>

      <ul>
        {tasks.map((task, index) => (
          <li key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' }}>
            <span>{index + 1}. {task.title}</span>
            <button onClick={() => deleteTask(task.id)} style={{ backgroundColor: '#999', marginLeft: '20px', padding: '2px 8px' }}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;