import { useState, useEffect } from "react";
import './App.css';
import api from './api';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

function App() {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await api.get<Task[]>("/tasks");
      setTasks(res.data);
    };
    fetchTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const res = await api.post<Task>("/tasks", { text: newTask });
    setTasks(prev => [...prev, res.data]);
    setNewTask("");
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdate = async (id: number) => {
    const res = await api.put<Task>(`/tasks/${id}`, { text: editingText });
    setTasks(prev => prev.map(t => t.id === id ? res.data : t));
    setEditingId(null);
    setEditingText("");
  };

  const handleToggle = async (id: number) => {
    const res = await api.put<Task>(`/tasks/${id}/toggle`);
    setTasks(prev => prev.map(t => t.id === id ? res.data : t));
  };

  return (
    <div className="todopro">
      <h1>To-do Pro</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
        />
        <button type="submit">Añadir tarea</button>
      </form>

      <ul>
        {tasks.map(task => (
          <li
            className="tasks"
            key={task.id}
            style={{ textDecoration: task.completed ? "line-through" : "none" }}
          >
            {editingId === task.id ? (
              <>
                <input
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                />
                <button onClick={() => handleUpdate(task.id)}>Guardar</button>
                <button onClick={() => setEditingId(null)}>Cancelar</button>
              </>
            ) : (
              <>
                {task.text}
                <button onClick={() => handleToggle(task.id)}>
                  {task.completed ? "¡Completada!" : "Completar"}
                </button>
                <button
                  onClick={() => {
                    setEditingId(task.id);
                    setEditingText(task.text);
                  }}
                >
                  Editar
                </button>
                <button id="deleteButton" onClick={() => handleDelete(task.id)}> X </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
