import { useState, useEffect } from 'react';
import './App.css';
import TodoList from './components/TodoList';
import UpdateList from './components/UpdateList';
import * as api from './api';

function App() {
  const [tasks, updateTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toTask = (item) => ({
    id: item._id,
    title: item.title,
    completed: item.completed,
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.getTasks();
        updateTasks(data.map(toTask));
      } catch (err) {
        console.error('Помилка при завантаженні завдань:', err);
        setError('Не вдалося завантажити завдання з сервера');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const addTask = async (title) => {
    try {
      const created = await api.createTask({ title: title, completed: false });
      updateTasks((prev) => [...prev, toTask(created)]);
    } catch (err) {
      console.error('Помилка при додаванні завдання:', err);
      setError('Не вдалося додати завдання');
    }
  };

  const editTask = async (id, newTitle) => {
    updateTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, title: newTitle } : task))
    );

    try {
      await api.updateTask(id, { title: newTitle });
    } catch (err) {
      console.error('Помилка при редагуванні завдання:', err);
      setError('Не вдалося зберегти зміни на сервері');
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    const completed = !task.completed;

    updateTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: completed } : t))
    );

    try {
      await api.updateTask(id, { completed: completed });
    } catch (err) {
      console.error('Помилка при зміні статусу завдання:', err);
      setError('Не вдалося зберегти зміни на сервері');
    }
  };

  const removeTask = async (id) => {
    updateTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      await api.deleteTask(id);
    } catch (err) {
      console.error('Помилка при видаленні завдання:', err);
      setError('Не вдалося видалити завдання на сервері');
    }
  };

  const doneCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="container">
      <h2>Список завдань</h2>

      <UpdateList onAddTask={addTask} />

      {loading && <p>Завантаження...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && (
        <>
          <p className="stats">
            Виконано: {doneCount} з {tasks.length}
          </p>
          <progress value={doneCount} max={tasks.length || 1} />

          <TodoList
            tasks={tasks}
            onToggle={toggleTask}
            onEdit={editTask}
            onDelete={removeTask}
          />
        </>
      )}
    </div>
  );
}

export default App;
