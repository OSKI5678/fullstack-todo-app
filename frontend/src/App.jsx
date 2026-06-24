import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import './App.css';

const API_URL = 'http://localhost:3005/api';

const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  DONE: 'done',
};

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState(FILTERS.ALL);

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

  const handleRegister = async (username, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return res.ok ? 'Zarejestrowano pomyślnie! Teraz możesz się zalogować.' : data.message;
  };

  const handleLogin = async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (res.ok) {
      setUser(data);
      return null;
    } else {
      return data.message;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTasks([]);
  };

  const addTask = async (title, dueDate) => {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.id,
      },
      body: JSON.stringify({ title, dueDate: dueDate || null }),
    });
    const newTask = await res.json();
    setTasks([...tasks, newTask]);
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

  const doneCount = tasks.filter((t) => t.completed).length;

  const visibleTasks = tasks.filter((task) => {
    if (filter === FILTERS.ACTIVE) return !task.completed;
    if (filter === FILTERS.DONE) return task.completed;
    return true;
  });

  return (
    <div className="login-screen">
      {!user ? (
        <LoginForm onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
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

            <TaskForm onAddTask={addTask} />

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
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;