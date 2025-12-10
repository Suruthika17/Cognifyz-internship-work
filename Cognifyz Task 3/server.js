const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

// GET: Dashboard with advanced CSS
app.get('/', (req, res) => {
  res.render('index');
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🚀 Task 3 Dashboard: http://localhost:${PORT}`);
});
