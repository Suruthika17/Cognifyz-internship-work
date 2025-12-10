const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/submit', (req, res) => {
    const { name, email } = req.body;
    res.render('success', { name, email });
});

app.listen(3000, () => {
    console.log('🚀 Server running: http://localhost:3000');
});
