export default function TaskItem({ task, onToggle, onDelete }) {
  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date().toISOString().slice(0, 10);
    return task.dueDate < today;
  };

  const formatDate = (isoDate) => {
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  const overdue = isOverdue(task);

  return (
    <li className={overdue ? 'task-item overdue' : 'task-item'}>
      <button
        className={task.completed ? 'task-check done' : 'task-check'}
        onClick={() => onToggle(task.id)}
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
          <span className={overdue ? 'task-due overdue-text' : 'task-due'}>
            Termin: {formatDate(task.dueDate)}
            {overdue ? ' (po terminie)' : ''}
          </span>
        )}
      </div>

      <button
        className="task-delete"
        onClick={() => onDelete(task.id)}
        aria-label="Usuń zadanie"
      >
        <svg viewBox="0 0 24 24">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0l-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
        </svg>
      </button>
    </li>
  );
}