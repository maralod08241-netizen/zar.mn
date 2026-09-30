const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../user');
const router = express.Router();

router.get('/register', (req, res) => res.render('register', { error: '' }));

router.post('/register', async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password || password.length < 6) {
    return res.render('register', { error: 'Бүх талбарыг бөглөнө үү (нууц үг 6+ тэмдэгт)' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, phone, password: hash });
    res.redirect('/login');
  } catch (err) {
    const msg = err.code === 11000 ? 'Энэ утасны дугаар бүртгэлтэй байна' : 'Алдаа гарлаа';
    res.render('register', { error: msg });
  }
});

router.get('/login', (req, res) => res.render('login', { error: '' }));

router.post('/login', async (req, res) => {
  const user = await User.findOne({ phone: req.body.phone });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    req.session.user = { id: user._id.toString(), name: user.name };
    return res.redirect('/');
  }
  res.render('login', { error: 'Утас эсвэл нууц үг буруу' });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;