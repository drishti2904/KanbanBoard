import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import ActivityLog from '../components/ActivityLog';
import './Board.css';

function Board() {
  const [tasks, setTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Low' });
  const [error, setError] = useState('');
  const [assigningId, setAssigningId] = useState(null);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks', err);
      if (err.response?.status === 401) handleLogout();
    }
  };

  useEffect(() => {
    fetchTasks();
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, { transports: ['websocket'] });
    setSocket(newSocket);

    newSocket.on('taskCreated', task => setTasks(prev => [...prev, task]));
    newSocket.on('taskUpdated', updated => setTasks(prev => prev.map(t => t._id === updated._id ? updated : t)));
    newSocket.on('taskDeleted', id => setTasks(prev => prev.filter(t => t._id !== id)));

    return () => newSocket.disconnect();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  const handleDragStart = (task) => setDraggedTask(task);

  const handleDrop = async (status) => {
    if (!draggedTask || draggedTask.status === status) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/tasks/${draggedTask._id}`,
        { status, lastKnownUpdatedAt: draggedTask.updatedAt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      if (err.response?.status === 409) {
        const serverTask = err.response.data.serverVersion;
        const userChoice = window.confirm('⚠️ Conflict detected! Another user updated this task.\nClick OK to overwrite their changes, or Cancel to use their latest version.');
        if (userChoice) {
          try {
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/tasks/${draggedTask._id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
          } catch (overwriteErr) {
            console.error('Error overwriting task', overwriteErr);
          }
        } else {
          setTasks(prev => prev.map(t => t._id === serverTask._id ? serverTask : t));
        }
      } else {
        console.error('Error updating task status', err);
      }
    } finally {
      setDraggedTask(null);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error deleting task', err);
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleSmartAssign = async (id) => {
    setAssigningId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/tasks/${id}/smart-assign`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error performing Smart Assign', err);
      alert(err.response?.data?.message || 'Smart Assign failed');
    } finally {
      setAssigningId(null);
    }
  };

  const handleNewTaskSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTask({ title: '', description: '', priority: 'Low' });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) handleLogout();
      else setError(err.response?.data?.message || 'Error creating task');
    }
  };

  return (
    <div className="board-page">
      <header className="board-header">
        <h1>My Collaborative Kanban Board</h1>
        <br/>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      <div className="new-task-form">
        <h2>Create New Task</h2>
        <form onSubmit={handleNewTaskSubmit}>
          <input type="text" placeholder="Title" className="board-input" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
          <input type="text" placeholder="Description" className="board-input" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
          <select className="board-input" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
           <button type="submit" style={{ backgroundColor: 'purple', color: 'white' }}>Add Task</button>

        </form>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="board-layout">
        <div className="kanban-container">
          {['Todo', 'In Progress', 'Done'].map((column) => (
            <div key={column} className="kanban-column" onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(column)}>
              <h2>{column}</h2>
              <div className="kanban-tasks">
                {getTasksByStatus(column).map((task) => (
                  <div key={task._id} className="task-card" draggable onDragStart={() => handleDragStart(task)}>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <p className="task-meta">
                      Priority: {task.priority}<br />
                      Assigned to: {task.assignedTo?.username || 'Unassigned'}
                    </p>
                    <button
                      className="smart-assign-button"
                      disabled={assigningId === task._id}
                      onClick={() => handleSmartAssign(task._id)}
                    >
                      {assigningId === task._id ? 'Assigning...' : 'Smart Assign'}
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteTask(task._id)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <ActivityLog />
      </div>
    </div>
  );
}

export default Board;
