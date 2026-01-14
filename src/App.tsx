import { useState, useEffect } from "react";
import './App.css';
import api from './api';


interface Task {
  id: number;
  text: string;
  completed?: boolean; 
}

function App() {
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

 
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get<Task[]>("/tasks");
        setTasks(res.data);
      } catch (error) {
        console.error("Error cargando tareas", error);
      }
    };

    fetchTasks();
  }, []);

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTask.trim() === "") return;

    try {
      const res = await api.post<Task>('/tasks', { text: newTask });
      setTasks(prev => [...prev, res.data]);
      setNewTask('');
    } catch (error) {
      console.error("Error creando tarea", error);
    }
  };

 
  const handleDelete = async (idToDelete: number) => {
    try {
      await api.delete(`/tasks/${idToDelete}`);
      setTasks(prev => prev.filter(task => task.id !== idToDelete));
    } catch (error) {
      console.error("Error eliminando tarea", error);
    }
  };

  
  const handleUpdate = async (id: number) => {
    try {
      const res = await api.put<Task>(`/tasks/${id}`, { text: editingText });
      setTasks(prev =>
        prev.map(task => (task.id === id ? res.data : task))
      );
      setEditingId(null);
      setEditingText("");
    } catch (error) {
      console.error("Error actualizando tarea", error);
    }
  };

  return (
    <div className="todopro">
      <h1>To-do Pro</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={(e) => setNewTask(e.target.value)}
          value={newTask}
        />
        <button type="submit">Añadir tarea</button>
      </form>

      <ul>
        {tasks.map(task => (
          <li className="tasks" key={task.id}>
            {editingId === task.id ? (
              <>
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <button onClick={() => handleUpdate(task.id)}>Guardar</button>
                <button onClick={() => setEditingId(null)}>Cancelar</button>
              </>
            ) : (
              <>
                {task.text}
                <button
                  onClick={() => {
                    setEditingId(task.id);
                    setEditingText(task.text);
                  }}
                >
                  Editar
                </button>
                <span onClick={() => handleDelete(task.id)}> X </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
