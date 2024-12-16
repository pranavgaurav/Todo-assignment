import React, { useState, useEffect, useRef } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

const TaskManager = () => {
  const tableRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'To Do',
  });

  // Fetch data from API
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos')
      .then((response) => response.json())
      .then((data) => {
        const initialTasks = data.slice(0, 20).map((task) => ({
          id: task.id,
          title: task.title,
          description: 'No description provided',
          status: task.completed ? 'Done' : 'To Do',
        }));
        setTasks(initialTasks);
      });
  }, []);

  // Initialize Tabulator
  useEffect(() => {
    if (tableRef.current) {
      const table = new Tabulator(tableRef.current, {
        data: tasks,
        layout: 'fitColumns',
        columns: [
          { title: 'Task ID', field: 'id', editor: false },
          { title: 'Title', field: 'title', editor: 'input' },
          { title: 'Description', field: 'description', editor: 'input' },
          {
            title: 'Status',
            field: 'status',
            editor: 'select',
            editorParams: { values: ['To Do', 'In Progress', 'Done'] },
          },
          {
            title: 'Actions',
            formatter: () =>
              "<button class='bg-red-500 text-white px-2 py-1 rounded'>Delete</button>",
            cellClick: (e, cell) => {
              const row = cell.getRow();
              const updatedTasks = tasks.filter((task) => task.id !== row.getData().id);
              setTasks(updatedTasks);
              showToast('Task deleted successfully');
            },
          },
        ],
      });

      return () => {
        table.destroy();
      };
    }
  }, [tasks]);

  // Add New Task
  const handleAddTask = () => {
    if (newTask.title && newTask.description) {
      const task = {
        id: tasks.length + 1,
        ...newTask,
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '', status: 'To Do' });
      showToast('Task added successfully');
    } else {
      alert('Please fill in all fields.');
    }
  };

  // Filter Tasks
  useEffect(() => {
    if (tableRef.current) {
      const table = Tabulator.findTable(tableRef.current)[0];
      if (filterStatus) {
        table.setFilter('status', '=', filterStatus);
      } else {
        table.clearFilter();
      }
    }
  }, [filterStatus]);

  // Toast Notifications
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Task List Manager</h1>

      {/* Add Task Form */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Title"
          className="border rounded p-2 mr-2"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          className="border rounded p-2 mr-2"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <select
          className="border rounded p-2 mr-2"
          value={newTask.status}
          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <button
          className="bg-blue-500 text-white rounded px-4 py-2"
          onClick={handleAddTask}
        >
          Add Task
        </button>
      </div>

      {/* Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="filter-status" className="mr-2">
          Filter by Status:
        </label>
        <select
          id="filter-status"
          className="border rounded p-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Task Table */}
      <div ref={tableRef} id="task-table"></div>
    </div>
  );
};

export default TaskManager;
