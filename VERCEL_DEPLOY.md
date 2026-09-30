# Vercel-д байршуулж, domain холбох

## Бэлтгэх

1. Төслөө өөрийн GitHub repository-д push хийнэ. `.env` болон `node_modules` нь `.gitignore`-т орсон; `.env`-ээ хэзээ ч repository-д бүү оруул.
2. MongoDB Atlas дээр cluster болон database user үүсгэнэ. Network Access-ийг Vercel-ээс холбогдохоор тохируул; shared egress-тай туршилтын үед `0.0.0.0/0` шаардлагатай байж болох тул database user-д зөвхөн шаардлагатай эрх, хүчтэй нууц үг ашигла.
3. Vercel дээр **Add New → Project** гэж GitHub repository-гоо импортло. `zar-node` өөрөө repository root бол нэмэлт Root Directory хэрэггүй.
4. Vercel Project → **Settings → Environment Variables** хэсэгт дараах утгуудыг Preview болон Production-д нэм:
   - `MONGO_URI`: Atlas-ийн `mongodb+srv://...` connection string. `<password>` хэсгийг өөрийн database user-ийн нууц үгээр соль; тусгай тэмдэгт байвал URL-encode хий.
   - `SESSION_SECRET`: дор хаяж 32 random byte. Local terminal дээр `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` ажиллуулж өөрөө гаргаж ав.
   - `BLOB_READ_WRITE_TOKEN`: Vercel Project → **Storage → Create Database → Blob** үүсгээд холбосны дараах token. Зураг upload болон устгалд шаардлагатай.
5. Vercel build-ийг `npm run build:ui`-гаар ажиллуулна (`vercel.json` тохируулсан). Deploy хийсний дараа URL дээр бүртгэл, зар нэмэх, зураг upload, session болон утсаар холбогдох үйлдлийг шалга.

## Domain холбох

1. Domain нэрээ бүртгэгчээс худалдан авч, Vercel Project → **Settings → Domains → Add** дээр нэм.
2. Vercel-ийн үзүүлсэн DNS record-уудыг domain бүртгэгчийн DNS тохиргоонд яг хэвээр оруул. Nameserver ашиглавал Vercel-ийн өгсөн nameserver-ийг бүртгэгч дээр тохируул.
3. DNS бүрэн тархаж, Vercel SSL certificate олгосны дараа custom domain-оо үндсэн domain болго.

## Анхаарах зүйл

- Одоогийн `127.0.0.1/zar_db` зөвхөн таны компьютер дээр ажиллана. Atlas URI тохируулахгүй бол deployed сайт database-д холбогдохгүй.
- Local database болон `public/uploads` зурагнууд Vercel-д автоматаар хуулбарлагдахгүй. Хуучин зар хэрэгтэй бол MongoDB Atlas руу backup/restore, зурагнуудыг Blob руу шилжүүлж `ads.image` талбарыг шинэ URL-аар шинэчлэх шаардлагатай. Дээрх алхмаар шинэ deployment хоосон Atlas database ашиглаж эхэлнэ.
- VIP үнэ одоогоор тооцогддог боловч бодит payment provider холбогдоогүй.
- Domain худалдаж авах болон Vercel/Atlas account-д нэвтрэх үйлдэл эзэмшигч өөрөө хийх шаардлагатай.