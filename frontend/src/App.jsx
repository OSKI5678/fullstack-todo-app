import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3005/api';

// Filtry dostępne na liście zadań.
const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  DONE: 'done',
};

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    const res = await fetch(`${API_URL}/tasks`, {
      headers: { 'X-User-Id': user.id },
    });
    const data = await res.json();
    setTasks(data);
  };

  const handleRegister = async () => {
    if (!usernameInput || !passwordInput) return setMessage('Wpisz login i hasło!');

    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput }),
    });
    const data = await res.json();

    setMessage(res.ok ? 'Zarejestrowano pomyślnie! Teraz możesz się zalogować.' : data.message);
  };

  const handleLogin = async () => {
    if (!usernameInput || !passwordInput) return setMessage('Wpisz login i hasło!');

    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput }),
    });
    const data = await res.json();

    if (res.ok) {
      setUser(data);
      setMessage('');
    } else {
      setMessage(data.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTasks([]);
    setUsernameInput('');
    setPasswordInput('');
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.id,
      },
      body: JSON.stringify({ title: input, dueDate: dueDateInput || null }),
    });
    const newTask = await res.json();
    setTasks([...tasks, newTask]);
    setInput('');
    setDueDateInput('');
  };

  const toggleTask = async (id) => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'X-User-Id': user.id },
    });
    const updatedTask = await res.json();
    setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
  };

  const deleteTask = async (id) => {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'X-User-Id': user.id },
    });
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // -----------------------------------------------------------------------
  // Pochodne dane: licznik i lista po zastosowaniu filtra
  // -----------------------------------------------------------------------
  const doneCount = tasks.filter((t) => t.completed).length;

  const visibleTasks = tasks.filter((task) => {
    if (filter === FILTERS.ACTIVE) return !task.completed;
    if (filter === FILTERS.DONE) return task.completed;
    return true;
  });

  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date().toISOString().slice(0, 10);
    return task.dueDate < today;
  };

  const formatDate = (isoDate) => {
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  // -----------------------------------------------------------------------
  // Ekran logowania / rejestracji
  // -----------------------------------------------------------------------
  if (!user) {
    return (
      <div className="login-screen">
        <div className="scene">
          <div className="brand">
            Next<span>Task</span>
          </div>

          <div className="glass-card">
            <div className="avatar">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            </div>

            <div className="field">
              <svg viewBox="0 0 24 24">
                <path d="M3 6h18v12H3z" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              <input
                type="text"
                placeholder="Login"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
            </div>

            <div className="field">
              <svg viewBox="0 0 24 24">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                type="password"
                placeholder="Hasło"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>

            <div className="row">
              <span className="hint">Nie masz konta?</span>
              <button className="link-btn" onClick={handleRegister}>
                Zarejestruj się
              </button>
            </div>

            {message && <p className="message">{message}</p>}
          </div>

          <button className="login-btn" onClick={handleLogin}>
            ZALOGUJ SIĘ
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Widok listy zadań (po zalogowaniu)
  // -----------------------------------------------------------------------
  return (
    <div className="login-screen">
      <div className="scene scene--tasks">
        <div className="brand">
          Next<span>Task</span>
        </div>

        <div className="topbar">
          <span className="user">
            Zalogowany jako: <b>{user.username}</b>
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Wyloguj
          </button>
        </div>

        <div className="glass-card glass-card--tasks">
          <div className="counter">
            Zrobione: {doneCount} z {tasks.length} {tasks.length === 1 ? 'zadania' : 'zadań'}
          </div>

          <form className="add-form" onSubmit={addTask}>
            <div className="add-field">
              <svg viewBox="0 0 24 24">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Co masz do zrobienia?"
              />
            </div>
            <input
              type="date"
              className="date-field"
              value={dueDateInput}
              onChange={(e) => setDueDateInput(e.target.value)}
              aria-label="Termin wykonania"
            />
            <button type="submit" className="add-btn" aria-label="Dodaj zadanie">
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </form>

          <div className="filters">
            <button
              className={filter === FILTERS.ALL ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter(FILTERS.ALL)}
            >
              Wszystkie
            </button>
            <button
              className={filter === FILTERS.ACTIVE ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter(FILTERS.ACTIVE)}
            >
              Do zrobienia
            </button>
            <button
              className={filter === FILTERS.DONE ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter(FILTERS.DONE)}
            >
              Zakończone
            </button>
          </div>

          {visibleTasks.length === 0 ? (
            <p className="empty">
              {tasks.length === 0
                ? 'Brak zadań — dodaj pierwsze powyżej.'
                : 'Brak zadań w tym filtrze.'}
            </p>
          ) : (
            <ul className="task-list">
              {visibleTasks.map((task) => (
                <li key={task.id} className={isOverdue(task) ? 'task-item overdue' : 'task-item'}>
                  <button
                    className={task.completed ? 'task-check done' : 'task-check'}
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.completed ? 'Oznacz jako niewykonane' : 'Oznacz jako wykonane'}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </button>

                  <div className="task-body">
                    <span className={task.completed ? 'task-text done' : 'task-text'}>
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span className={isOverdue(task) ? 'task-due overdue-text' : 'task-due'}>
                        Termin: {formatDate(task.dueDate)}
                        {isOverdue(task) ? ' (po terminie)' : ''}
                      </span>
                    )}
                  </div>

                  <button
                    className="task-delete"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Usuń zadanie"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0l-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;