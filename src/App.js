import React, { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";
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
      <div className="min-h-screen flex items-center justify-center bg-blue-100">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
            {isLoginForm ? "Login" : "Sign Up"}
          </h2>
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 mb-4 rounded-xl"
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 mb-4 rounded-xl"
          />
          <button
            onClick={handleAuth}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            {isLoginForm ? "Login" : "Sign Up"}
          </button>
          <p className="text-center mt-4">
            {isLoginForm ? "New user?" : "Already registered?"}{" "}
            <button
              className="text-blue-600 underline"
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
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-200">
        <div className="flex justify-between mb-6 items-center">
          <h2 className="text-4xl font-bold text-blue-800">My To-Do List</h2>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 underline"
          >
            Logout
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter task"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="datetime-local"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className={`${
              !text.trim()
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } px-6 py-2 rounded-xl font-semibold transition`}
          >
            {editId ? "Update" : "Add"}
          </button>
        </div>

        <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {tasks.map((task) => {
            const isExpired = task.reminder && new Date(task.reminder) < new Date();
            return (
              <li
                key={task.id}
                className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-xl shadow-sm border border-gray-300 transition"
              >
                <span
                  className={`${
                    deletedIds.includes(task.id)
                      ? "line-through text-gray-400"
                      : isExpired
                      ? "text-red-600 font-medium"
                      : "text-gray-800"
                  }`}
                >
                  {task.text}
                  {task.reminder && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({new Date(task.reminder).toLocaleString()})
                      {isExpired && <span className="ml-1">⏰</span>}
                    </span>
                  )}
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {tasks.length === 0 && (
          <p className="text-center text-gray-400 mt-6">No tasks found. Add some!</p>
        )}
      </div>
    </div>
  );
};

export default App;
