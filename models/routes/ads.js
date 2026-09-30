const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { put, del } = require('@vercel/blob');
const Ad = require('../ad');
const router = express.Router();
const uploadDirectory = path.join(__dirname, '../../public/uploads');

if (!process.env.VERCEL) fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) =>
    cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});

async function saveImage(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

  if (process.env.VERCEL) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('Зураг хадгалахын тулд BLOB_READ_WRITE_TOKEN тохируулна уу');
    }
    const blob = await put(`ads/${filename}`, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    return blob.url;
  }

  await fs.promises.mkdir(uploadDirectory, { recursive: true });
  await fs.promises.writeFile(path.join(uploadDirectory, filename), file.buffer);
  return filename;
}

async function deleteImage(image) {
  if (/^https:\/\//i.test(image)) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await del(image, { token: process.env.BLOB_READ_WRITE_TOKEN });
    }
    return;
  }
  await fs.promises.unlink(path.join(uploadDirectory, image)).catch(() => {});
}

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// Нүүр: жагсаалт + хайлт + ангилал
router.get('/', async (req, res) => {
  const { q = '', cat = '' } = req.query;
  const filter = {};
  if (q) filter.title = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (cat) filter.category = cat;

  const now = new Date();
  const regularFilter = {
    ...filter,
    $or: [{ vipUntil: { $exists: false } }, { vipUntil: { $lte: now } }]
  };
  const [vipAds, ads] = await Promise.all([
    Ad.find({ ...filter, vipUntil: { $gt: now } }).sort({ vipUntil: 1 }).limit(6),
    Ad.find(regularFilter).sort({ createdAt: -1 }).limit(30)
  ]);
  res.render('index', { ads, vipAds, q, cat, categories: Ad.CATEGORIES });
});

// Зар нэмэх
router.get('/post', requireLogin, (req, res) =>
  res.render('post', { categories: Ad.CATEGORIES, vipPlans: Ad.VIP_PLANS }));

router.post('/post', requireLogin, upload.single('image'), async (req, res) => {
  const { category, title, description, price, location, vipDays } = req.body;
  const vipPlan = Ad.VIP_PLANS.find(plan => plan.days === Number(vipDays));
  const image = req.file ? await saveImage(req.file) : undefined;
  const adData = {
    user: req.session.user.id,
    category, title, description, location,
    price: Number(price) || 0,
    image
  };

  if (vipPlan) {
    adData.vipUntil = new Date(Date.now() + vipPlan.days * 24 * 60 * 60 * 1000);
    adData.vipPlanDays = vipPlan.days;
    adData.vipPrice = vipPlan.price;
  }

  await Ad.create(adData);
  res.redirect('/my-ads');
});

router.get('/my-ads', requireLogin, async (req, res) => {
  const ads = await Ad.find({ user: req.session.user.id }).sort({ createdAt: -1 });
  res.render('my-ads', { ads });
});

// Зарын дэлгэрэнгүй
router.get('/ad/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id).populate('user', 'name phone');
    if (!ad) return res.status(404).send('Зар олдсонгүй');
    res.render('ad', { ad });
  } catch {
    res.status(404).send('Зар олдсонгүй');
  }
});

// Өөрийн зарыг устгах
router.post('/ad/:id/delete', requireLogin, async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (ad && ad.user.toString() === req.session.user.id) {
    if (ad.image) await deleteImage(ad.image);
    await ad.deleteOne();
  }
  res.redirect('/');
});

module.exports = router;