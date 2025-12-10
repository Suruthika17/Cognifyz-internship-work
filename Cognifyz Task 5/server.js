const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory todo data
let todos = [
  { id: 1, title: "Learn API basics", completed: false },
  { id: 2, title: "Build Cognifyz Task 5", completed: false },
  { id: 3, title: "Post project on GitHub", completed: true }
];

// GET /api/todos?status=all|pending|completed&search=text
app.get("/api/todos", (req, res) => {
  const { status = "all", search = "" } = req.query;

  let result = [...todos];

  if (status === "pending") {
    result = result.filter((t) => !t.completed);
  } else if (status === "completed") {
    result = result.filter((t) => t.completed);
  }

  if (search.trim()) {
    const term = search.trim().toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(term));
  }

  res.json(result);
});

// POST /api/todos  { title }
app.post("/api/todos", (req, res) => {
  const { title } = req.body;
  if (!title || title.trim().length < 3) {
    return res
      .status(400)
      .json({ message: "Title must be at least 3 characters." });
  }

  const newTodo = {
    id: Date.now(),
    title: title.trim(),
    completed: false
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT /api/todos/:id  { title?, completed? }
app.put("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, completed } = req.body;

  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Todo not found." });
  }

  if (typeof title === "string") {
    if (!title.trim() || title.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Title must be at least 3 characters." });
    }
    todos[index].title = title.trim();
  }

  if (typeof completed === "boolean") {
    todos[index].completed = completed;
  }

  res.json(todos[index]);
});

// DELETE /api/todos/:id
app.delete("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = todos.find((t) => t.id === id);
  if (!existing) {
    return res.status(404).json({ message: "Todo not found." });
  }
  todos = todos.filter((t) => t.id !== id);
  res.json({ message: "Todo deleted." });
});

// Optional: delete all completed
app.delete("/api/todos", (req, res) => {
  const before = todos.length;
  todos = todos.filter((t) => !t.completed);
  const removed = before - todos.length;
  res.json({ message: `Removed ${removed} completed tasks.` });
});

app.listen(PORT, () => {
  console.log(`Task 5 API server running at http://localhost:${PORT}`);
});
