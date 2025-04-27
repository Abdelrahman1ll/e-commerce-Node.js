📚 إدارة المحتوى:

إنشاء/تعديل/حذف الكوميكس، الفصول، والفئات.

دعم تعدد الوسائط (رفع الصور، PDF، إلخ) عبر Cloudinary.

💳 نظام مدفوعات آمن:

تكامل مع بوابات دفع مثل Stripe أو PayPal.

تتبع المشتريات والاشتراكات.

🔍 بحث ذكي:

فلترة الكوميكس حسب الفئة، التقييم، التاريخ، وغيرها.

دعم البحث النصي باستخدام Elasticsearch (اختياري).

🤖 توصيات مخصصة:

خوارزميات توصية تعتمد على سلوك المستخدم.

⚡ تحسين الأداء:

التخزين المؤقت (Redis) لتحسين سرعة الاستجابة.

معالجة الأخطاء المركَّزة.

🛠️ التقنيات المستخدمة
الفئة التقنيات
الخادم Node.js, Express.js
قاعدة البيانات MongoDB, Mongoose (ODM)
المصادقة JWT, Bcrypt
التخزين Cloudinary, AWS S3
الدفع Stripe API
الأدوات Docker, Redis, Swagger (للتوثيق)

src/  
├── config/ # إعدادات قاعدة البيانات، البيئة، وغيرها  
├── controllers/ # منطق التعامل مع الطلبات  
├── models/ # نماذج MongoDB  
├── routes/ # تعريفات مسارات API  
├── middleware/ # middleware للمصادقة، التحقق، إلخ  
├── utils/ # أدوات مساعدة (رفع الملفات، إرسال إيميلات)  
├── tests/ # اختبارات الوحدة والتكامل  
└── swagger/ # توثيق API

🚀 كيفية التشغيل
استنساخ المشروع:
https://github.com/Abdelrahman1ll/e-commerce-Node.js.git

npm install

MONGODB_URI=
BASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
EMAIL_USER=
EMAIL_PASS=
KASHIER_API_KEY=
KASHIER_MERCHANT_ID=

npm run dev
