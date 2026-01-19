import { useState, useEffect } from "react";
import './App.css';
import api from './api';

interface Task {
  id: number;
  text: string;
  status: "INCOMPLETA" | "EN_PROCESO" | "COMPLETADA";
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
            style={{ textDecoration: task.status === 'COMPLETADA' ? "line-through" : "none", textDecorationColor: task.status === 'COMPLETADA' ? "red" : "none", color: task.status === "EN_PROCESO" ? "orange" : "white" }}
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
                <select
                  value={task.status}
                  style={{
                    backgroundColor: task.status === "EN_PROCESO" ? "orange" : task.status === 'COMPLETADA' ? "green" : "white"}}

                  onChange={async (e) => {
                 const newStatus = e.target.value;
                const res = await api.patch<Task>(`/tasks/${task.id}/status`, {
                  status: newStatus
                });
                setTasks(prev => prev.map(t => t.id === task.id ? res.data : t));
  }}
>
                <option value="INCOMPLETA">Incompleta</option>
                <option value="EN_PROCESO">En proceso</option>
              <option value="COMPLETADA">Completada</option>
</select>

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
