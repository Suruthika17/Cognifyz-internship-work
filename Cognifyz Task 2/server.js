const express = require('express');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './views');

// Temporary in-memory storage
const users = [];

// GET: show form
app.get('/', (req, res) => {
  res.render('index', { errors: [], old: {} });
});

// POST: handle form with server-side validation
app.post('/submit', (req, res) => {
  const { name, email, age, password, confirmPassword } = req.body;
  const errors = [];

  // Validation rules
  if (!name || name.trim().length < 3) {
    errors.push('Name must be at least 3 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please enter a valid email address.');
  }

  const ageNum = Number(age);
  if (!age || Number.isNaN(ageNum) || ageNum < 18) {
    errors.push('Age must be a number and at least 18.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (password !== confirmPassword) {
    errors.push('Password and Confirm Password must match.');
  }

  if (errors.length > 0) {
    return res.status(400).render('index', {
      errors,
      old: { name, email, age }
    });
  }

  const user = { name, email, age: ageNum };
  users.push(user);

  res.render('success', { user, users });
});

const PORT = 3001; // different from Task 1
app.listen(PORT, () => {
  console.log(`🚀 Task 2 server running at http://localhost:${PORT}`);
});
