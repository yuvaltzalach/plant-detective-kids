# 🌱🔎 בלש הצמחים (Plant Detective Kids)

אפליקציית ווב (PWA) פשוטה וכיפית לילדים בגילאי 6–12, שמזהה **צמחים ועצים לפי תמונה**
ומחזירה **שם ותיאור ידידותי בעברית** — עם המון אלמנטים של הצלחה: אלבום מדבקות, נקודות
ורמות, תגי הישג, אתגר יומי, אנימציות קונפטי, צלילי ניצחון והקראה קולית.

## 🚀 פריסה ל-Cloudflare Pages (חיבור ל-Git)
> שימו לב: אל תשתמשו בכפתור "Deploy to Cloudflare" / `deploy.workers.cloudflare.com` —
> זה מסלול של **Worker** בודד (מבקש API token ו-wrangler.toml) ולא מתאים לאתר Vite + פונקציה.
> משתמשים במסלול **Pages** הבא:

1. נכנסים ל-https://dash.cloudflare.com → בתפריט הצד: **Workers & Pages** (או **Compute**).
2. לוחצים **Create** → עוברים ללשונית **Pages** → **Connect to Git** / **Import a repository**.
   (אם צריך — מאשרים ל-Cloudflare גישה ל-GitHub ובוחרים את `plant-detective-kids`.)
3. בהגדרות הבנייה:
   - **Framework preset:** None (או Vite)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy**. הפונקציה שב-`functions/` מזוהה אוטומטית.
5. אחרי הפריסה: הפרויקט → **Settings → Variables and Secrets** → מוסיפים משתנה
   `PLANTNET_API_KEY` עם המפתח מ-https://my.plantnet.org/ → שומרים ומריצים **Retry deployment**.

תוך דקה יש כתובת חיה שאפשר "להתקין" בטלפון.

## ✨ מה יש באפליקציה
- 📷 **צילום/העלאה** של צמח מהמצלמה או מהגלריה.
- 🧠 **זיהוי חינמי** דרך [Pl@ntNet](https://my.plantnet.org/) + שכבת תוכן עברית ידידותית
  (מסד תוכן מקומי של עשרות צמחים נפוצים בישראל, עם גיבוי לוויקיפדיה העברית).
- 🔊 **הקראה בעברית** (Web Speech) לתמיכה בקוראים מתחילים.
- 📔 **אלבום מדבקות** — כל צמח שמזוהה נאסף.
- ⭐ **נקודות, רמות, תגים** ו-🎯 **אתגר יומי** עם רצף (streak).
- 🏆 **ריבוי משתתפים וטבלת ניצחונות** — כמה ילדים על אותו טלפון, כל אחד עם אלבום ונקודות משלו, ותחרות ביניהם.
- 👪 **אזור הורים** (מוגן בתרגיל חשבון): איפוס התקדמות, ניהול שחקנים, ואתגר אישי שההורה כותב (למשל "מצאו פרח עם עלים צהובים").
- 🎉 קונפטי וצלילי הצלחה בכל זיהוי.
- 📱 מותקן כאפליקציה למסך הבית (PWA), כיוון RTL, כפתורים גדולים.
- 🌿 מסד תוכן עברי של ~100 צמחים, כולל צמחיית בר ארץ-ישראלית (חצב, כלנית, לוטם, סירה קוצנית, אלון התבור ועוד).
- 🌍 **תחרות אונליין בין מכשירים** — קבוצה עם קוד הצטרפות וטבלת ניצחונות משותפת (דורש Cloudflare KV; ראו למטה).
- 🎯 **אתגר קבוצתי** — כל אחד בקבוצה יכול לקבוע אתגר משותף (למשל "מצאו פרח סגול"), והטבלה מסמנת מי השלים.
- 📤 **שיתוף האלבום כתמונה** — יוצר תמונה יפה של האוסף ומשתף לוואטסאפ (Web Share) או מוריד.
- 📖 **אנציקלופדיית צמחים** לגלישה, חיפוש והקראה — ללמוד על כל צמח גם לפני שמצאו אותו.
- 🌟 **צמח היום** ו-🎖️ **דרגות עם תארים** (נבט, שתיל, בלש צמחים... עד פרופסור הטבע).

## 🚀 הרצה מקומית
דרושים Node 18+ ו-npm.

```bash
npm install

# מצב הדגמה מהיר — בלי מפתח ובלי שרת (מחזיר צמח לדוגמה):
VITE_MOCK_IDENTIFY=true npm run dev
```

לזרימה המלאה עם זיהוי אמיתי צריך גם את פונקציית ה-`/api`. מריצים אותה מקומית עם
Cloudflare Wrangler (הפונקציה נמצאת ב-`functions/api/identify.ts`):

```bash
# יוצרים קובץ .dev.vars עם המפתח (ראו .dev.vars.example)
npm run build
npx wrangler pages dev dist      # מגיש את ה-frontend וגם את /api/identify
```

## 🔑 מפתח Pl@ntNet (חינמי)
1. נרשמים ב-https://my.plantnet.org/ ומקבלים API key (חינם, לשימוש לא-מסחרי, ~500 זיהויים ביום).
2. **בפיתוח מקומי:** מעתיקים את `.dev.vars.example` ל-`.dev.vars` וממלאים `PLANTNET_API_KEY=...`.
3. **בפרודקשן:** מגדירים את `PLANTNET_API_KEY` ב-Cloudflare Pages → Settings → Environment variables.

המפתח נשאר **רק בצד השרת** (פונקציית `/api/identify`) ולא נחשף בדפדפן.

## ☁️ פריסה (Cloudflare Pages)
1. Cloudflare Dashboard → **Workers & Pages** → Create → Pages → Connect to Git → בוחרים את הריפו.
2. הגדרות בנייה: **Build command** = `npm run build`, **Output directory** = `dist`
   (הפונקציות שב-`functions/` מזוהות אוטומטית).
3. מוסיפים משתנה סביבה `PLANTNET_API_KEY`.
4. Deploy. זהו — יש כתובת ציבורית שאפשר "להתקין" בטלפון.

> אפשר גם לפרוס בכל פלטפורמה אחרת שתומכת ב-Vite + serverless (למשל Vercel), אבל
> פונקציית השרת כאן כתובה בפורמט Cloudflare Pages Functions.

## 🌍 תחרות אונליין בין מכשירים (Cloudflare KV)
כל ילד/ה בטלפון משלו/ה יכולים להצטרף לאותה **קבוצה** עם קוד, ולראות טבלת ניצחונות
משותפת שמתעדכנת בזמן אמת. זה דורש אחסון קטן בצד השרת — **Cloudflare KV**:

1. ב-Cloudflare Dashboard → **Storage & Databases → KV** → **Create namespace** (למשל בשם `plant-detective`).
2. בפרויקט ה-Pages → **Settings → Bindings → Add → KV namespace**:
   - **Variable name:** `PDK_KV`
   - **KV namespace:** בוחרים את זה שיצרתם.
3. שומרים ומריצים דיפלוי מחדש.

זהו — כפתור **"🌍 תחרות אונליין"** באפליקציה יעבוד: פותחים קבוצה (מקבלים קוד) או מצטרפים
לקוד קיים, וכל זיהוי מסתנכרן לטבלה המשותפת.

> אם לא מגדירים KV — האפליקציה עובדת רגיל, והמסך פשוט יראה שהאונליין לא זמין.
> (לפיתוח מקומי: `npx wrangler pages dev dist --kv PDK_KV`.)

## 🤖 שדרוג אופציונלי: Claude Vision (בתשלום)
ברירת המחדל חינמית (Pl@ntNet). מי שרוצה תיאורי זיהוי עשירים במיוחד בעברית יכול להדליק
מסלול Claude Vision:
```
ANTHROPIC_API_KEY=sk-ant-...
USE_CLAUDE_VISION=true
```
> שימו לב: Claude Vision API כרוך בתשלום לפי שימוש, ולכן הוא כבוי כברירת מחדל.

## 🧪 בדיקות
```bash
npm run test      # לוגיקת נקודות/תגים/אתגרים + מיפוי התוכן העברי
```

## 🗂️ מבנה הפרויקט
```
functions/api/identify.ts  פונקציית Cloudflare: תמונה → Pl@ntNet (או Claude) → מועמדים
src/
  data/plants.he.json    מסד התוכן העברי הידידותי לילדים
  data/badges.ts          הגדרות תגי ההישג
  data/challenges.ts      אתגרים יומיים
  lib/identify.ts         קריאה ל-proxy (+ מצב MOCK)
  lib/content.ts          מיפוי מועמד → תוכן עברי (מקומי / ויקיפדיה / כללי)
  lib/progress.ts         לוגיקת נקודות/מדבקות/תגים/רצף (טהורה, נבדקת)
  lib/sound.ts            צלילים (Web Audio) והקראה (Web Speech)
  hooks/useProgress.ts    עטיפת React + שמירה ל-localStorage
  components/             TopBar, SpeakButton, BadgeToast
  screens/                Home, Capture, Identifying, Result, Album, Challenges
```

## 🔒 פרטיות
כל ההתקדמות (אוסף, נקודות, תגים) נשמרת מקומית בדפדפן (`localStorage`) — בלי חשבונות
משתמש ובלי שרת מסד נתונים. התמונה נשלחת רק לשירות הזיהוי לצורך הזיהוי עצמו.

---
נבנה בעזרת [Claude Code](https://claude.com/claude-code) 🤖
