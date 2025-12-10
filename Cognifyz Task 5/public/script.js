const API_BASE = "http://localhost:4000/api/todos";

const todoForm = document.getElementById("todoForm");
const todoTitleInput = document.getElementById("todoTitle");
const formError = document.getElementById("formError");

const reloadBtn = document.getElementById("reloadBtn");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const todoList = document.getElementById("todoList");

const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

let currentStatus = "all"; // all | pending | completed
let currentSearch = "";

function showLoading() {
  loading.classList.remove("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function renderTodos(todos) {
  todoList.innerHTML = "";
  if (!todos.length) {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.textContent = "No todos match the current filter. Add one above!";
    todoList.appendChild(li);
    return;
  }

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    if (todo.completed) li.classList.add("done");

    // Checkbox + title
    const main = document.createElement("div");
    main.className = "todo-main";

    const titleRow = document.createElement("div");
    titleRow.className = "todo-title";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    const textSpan = document.createElement("span");
    textSpan.className = "text";
    textSpan.textContent = todo.title;

    const badge = document.createElement("span");
    badge.className = "badge" + (todo.completed ? " done" : "");
    badge.textContent = todo.completed ? "Done" : "Pending";

    titleRow.appendChild(checkbox);
    titleRow.appendChild(textSpan);
    titleRow.appendChild(badge);

    const meta = document.createElement("div");
    meta.className = "todo-meta";
    meta.textContent = `ID: ${todo.id}`;

    main.appendChild(titleRow);
    main.appendChild(meta);

    // Actions
    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete";

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(main);
    li.appendChild(actions);
    todoList.appendChild(li);

    // Event: toggle completed
    checkbox.addEventListener("change", async () => {
      try {
        await updateTodo(todo.id, { completed: checkbox.checked });
        await loadTodos();
      } catch (err) {
        showError("Failed to update todo status.");
      }
    });

    // Event: delete
    deleteBtn.addEventListener("click", async () => {
      const ok = confirm("Delete this todo?");
      if (!ok) return;
      try {
        await deleteTodo(todo.id);
        await loadTodos();
      } catch (err) {
        showError("Failed to delete todo.");
      }
    });

    // Event: inline edit
    editBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "edit-input";
      input.value = todo.title;

      titleRow.replaceChild(input, textSpan);
      input.focus();

      function finishEdit(save) {
        input.removeEventListener("blur", onBlur);
        input.removeEventListener("keydown", onKey);
        const newSpan = document.createElement("span");
        newSpan.className = "text";
        newSpan.textContent = save ? input.value.trim() || todo.title : todo.title;
        titleRow.replaceChild(newSpan, input);
      }

      async function onBlur() {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== todo.title && newTitle.length >= 3) {
          try {
            await updateTodo(todo.id, { title: newTitle });
            await loadTodos();
          } catch (err) {
            showError("Failed to update todo title.");
          }
        } else {
          finishEdit(false);
        }
      }

      function onKey(e) {
        if (e.key === "Enter") {
          input.blur();
        } else if (e.key === "Escape") {
          finishEdit(false);
        }
      }

      input.addEventListener("blur", onBlur);
      input.addEventListener("keydown", onKey);
    });
  });
}

async function loadTodos() {
  hideError();
  showLoading();
  try {
    const params = new URLSearchParams();
    params.set("status", currentStatus);
    if (currentSearch.trim()) {
      params.set("search", currentSearch.trim());
    }

    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) {
      throw new Error("Failed to load todos from API");
    }
    const data = await res.json();
    renderTodos(data);
  } catch (err) {
    showError(err.message || "Something went wrong");
  } finally {
    hideLoading();
  }
}

async function createTodo(title) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(
      (errData && errData.message) || "Failed to create todo."
    );
  }
  return res.json();
}

async function updateTodo(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(
      (errData && errData.message) || "Failed to update todo."
    );
  }
  return res.json();
}

async function deleteTodo(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(
      (errData && errData.message) || "Failed to delete todo."
    );
  }
  return res.json();
}

async function clearCompleted() {
  const res = await fetch(API_BASE, { method: "DELETE" });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(
      (errData && errData.message) || "Failed to clear completed."
    );
  }
  return res.json();
}

// Form submit
todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";

  const title = todoTitleInput.value.trim();
  if (title.length < 3) {
    formError.textContent = "Title must be at least 3 characters.";
    return;
  }

  try {
    await createTodo(title);
    todoTitleInput.value = "";
    await loadTodos();
  } catch (err) {
    formError.textContent = err.message || "Error adding todo.";
  }
});

// Filters
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentStatus = btn.dataset.status;
    loadTodos();
  });
});

// Search (debounced)
let searchTimeout;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = searchInput.value;
    loadTodos();
  }, 300);
});

// Reload button
reloadBtn.addEventListener("click", () => {
  loadTodos();
});

// Clear completed
clearCompletedBtn.addEventListener("click", async () => {
  const ok = confirm("Clear all completed tasks?");
  if (!ok) return;
  try {
    await clearCompleted();
    await loadTodos();
  } catch (err) {
    showError(err.message || "Failed to clear completed tasks.");
  }
});

// Initial load
loadTodos();
