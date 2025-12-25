require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// routes
const webRoutes = require('./routes/web');
const apiRoutes = require('./routes/api');

app.use('/', webRoutes);
app.use('/api', apiRoutes);

// 404
app.use((req, res) => {
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
