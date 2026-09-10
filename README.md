# 🌱🔎 בלש הצמחים (Plant Detective Kids)

אפליקציית ווב (PWA) פשוטה וכיפית לילדים בגילאי 6–12, שמזהה **צמחים ועצים לפי תמונה**
ומחזירה **שם ותיאור ידידותי בעברית** — עם המון אלמנטים של הצלחה: אלבום מדבקות, נקודות
ורמות, תגי הישג, אתגר יומי, אנימציות קונפטי, צלילי ניצחון והקראה קולית.

## ✨ מה יש באפליקציה
- 📷 **צילום/העלאה** של צמח מהמצלמה או מהגלריה.
- 🧠 **זיהוי חינמי** דרך [Pl@ntNet](https://my.plantnet.org/) + שכבת תוכן עברית ידידותית
  (מסד תוכן מקומי של עשרות צמחים נפוצים בישראל, עם גיבוי לוויקיפדיה העברית).
- 🔊 **הקראה בעברית** (Web Speech) לתמיכה בקוראים מתחילים.
- 📔 **אלבום מדבקות** — כל צמח שמזוהה נאסף.
- ⭐ **נקודות, רמות, תגים** ו-🎯 **אתגר יומי** עם רצף (streak).
- 🎉 קונפטי וצלילי הצלחה בכל זיהוי.
- 📱 מותקן כאפליקציה למסך הבית (PWA), כיוון RTL, כפתורים גדולים.

## 🚀 הרצה מקומית
דרושים Node 18+ ו-npm.

```bash
npm install

# מצב הדגמה מהיר — בלי מפתח ובלי שרת (מחזיר צמח לדוגמה):
VITE_MOCK_IDENTIFY=true npm run dev
```

לזרימה המלאה עם זיהוי אמיתי צריך את פונקציית ה-`/api` (ראו "פריסה"). מקומית מריצים אותה עם
Vercel CLI:

```bash
npm i -g vercel
vercel dev            # מגיש גם את ה-frontend וגם את /api/identify
```

## 🔑 מפתח Pl@ntNet (חינמי)
1. נרשמים ב-https://my.plantnet.org/ ומקבלים API key (חינם, לשימוש לא-מסחרי, ~500 זיהויים ביום).
2. מעתיקים את `.env.example` ל-`.env` וממלאים:
   ```
   PLANTNET_API_KEY=xxxxxxxx
   ```
   בפריסה על Vercel מגדירים את המשתנה ב-Project Settings → Environment Variables.
   המפתח נשאר **רק בצד השרת** (פונקציית `/api/identify`) ולא נחשף בדפדפן.

## ☁️ פריסה (Vercel — מומלץ)
1. מחברים את הריפו ל-Vercel (Import Project). Vercel מזהה אוטומטית פרויקט Vite ופונקציות `api/`.
2. מגדירים את משתנה הסביבה `PLANTNET_API_KEY`.
3. Deploy. זהו — יש כתובת ציבורית שאפשר "להתקין" בטלפון.

חלופה: **Cloudflare Pages** (Build command: `npm run build`, Output: `dist`) + Pages Function
מקבילה ל-`/api/identify`.

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
api/identify.ts          פונקציית proxy: תמונה → Pl@ntNet (או Claude) → מועמדים
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
