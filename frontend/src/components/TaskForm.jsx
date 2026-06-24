import { useState } from 'react';

export default function TaskForm({ onAddTask }) {
  const [input, setInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onAddTask(input, dueDateInput);
    setInput('');
    setDueDateInput('');
  };

  return (
    <form className="add-form" onSubmit={onSubmit}>
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
  );
}