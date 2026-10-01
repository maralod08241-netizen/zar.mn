require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const path = require('path');

const app = express();
let connectionPromise;

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  connectToDatabase().then(() => next()).catch(next);
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

app.use('/', require('./models/routes/auth'));
app.use('/', require('./models/routes/info'));
app.use('/', require('./models/routes/ads'));
app.use((req, res) => res.status(404).send('Хуудас олдсонгүй'));

function connectToDatabase() {
  if (!process.env.MONGO_URI) {
    return Promise.reject(new Error('MONGO_URI тохиргоо шаардлагатай'));
  }
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI)
      .catch(error => {
        connectionPromise = null;
        throw error;
      });
  }
  return connectionPromise;
}

module.exports = app;
module.exports.connectToDatabase = connectToDatabase;