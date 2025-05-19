import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css"; // Use your own CSS

const App = () => {
  const [text, setText] = useState("");
  const [reminder, setReminder] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("user") ? true : false
  );
  const [isLoginForm, setIsLoginForm] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchTasks();
  }, [isLoggedIn]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/edit/${editId}`, { text, reminder });
        setEditId(null);
      } else {
        await axios.post("http://localhost:5000/add", { text, reminder });
      }
      setText("");
      setReminder("");
      await fetchTasks();
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  const handleDelete = async (id) => {
    setDeletedIds((prev) => [...prev, id]);
    setTimeout(async () => {
      try {
        await axios.delete(`http://localhost:5000/delete/${id}`);
        await fetchTasks();
        setDeletedIds((prev) => prev.filter((delId) => delId !== id));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }, 700);
  };

  const handleEdit = (task) => {
    setText(task.text);
    setReminder(task.reminder ? task.reminder.slice(0, 16) : "");
    setEditId(task.id);
  };

  const handleAuth = () => {
    if (!email || !password) {
      alert("Email and Password required");
      return;
    }
    localStorage.setItem("user", email);
    setIsLoggedIn(true);
    setEmail("");
    setPassword("");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-bg">
        <div className="login-container">
          <h2 className="login-title">
            {isLoginForm ? "Login" : "Sign Up"}
          </h2>
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <button
            onClick={handleAuth}
            className="btn"
          >
            {isLoginForm ? "Login" : "Sign Up"}
          </button>
          <p className="switch-form">
            {isLoginForm ? "New user?" : "Already registered?"}{" "}
            <button
              className="switch-btn"
              onClick={() => setIsLoginForm(!isLoginForm)}
            >
              {isLoginForm ? "Sign up here" : "Login here"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-bg">
      <div className="main-container">
        <div className="header">
          <h2 className="title">My To-Do List</h2>
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>

        <div className="form-row">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter task"
            className="input"
          />
          <input
            type="datetime-local"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            className="input"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className={`btn ${!text.trim() ? "btn-disabled" : ""}`}
          >
            {editId ? "Update" : "Add"}
          </button>
        </div>

        <ul className="task-list">
          {tasks.map((task) => {
            const isExpired = task.reminder && new Date(task.reminder) < new Date();
            return (
              <li
                key={task.id}
                className="task-item"
              >
                <span
                  className={
                    deletedIds.includes(task.id)
                      ? "task-text deleted"
                      : isExpired
                      ? "task-text expired"
                      : "task-text"
                  }
                >
                  {task.text}
                  {task.reminder && (
                    <span className="reminder">
                      ({new Date(task.reminder).toLocaleString()})
                      {isExpired && <span className="expired-icon">⏰</span>}
                    </span>
                  )}
                </span>
                <div className="task-actions">
                  <button
                    onClick={() => handleEdit(task)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {tasks.length === 0 && (
          <p className="no-tasks">No tasks found. Add some!</p>
        )}
      </div>
    </div>
  );
};

export default App;
// ...existing code...