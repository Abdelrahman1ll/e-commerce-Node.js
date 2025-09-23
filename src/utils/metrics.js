// metrics.js

const client = require('prom-client');
const os = require('os');
const nodemailer = require('nodemailer');

// ============================
// Prometheus Metrics
// ============================

// Register
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // CPU, Memory, Event Loop

// Counter لعدد الطلبات
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});
register.registerMetric(httpRequestsTotal);

// Histogram لزمن الاستجابة
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

// Middleware لقياس الطلبات
function metricsMiddleware(req, res, next) {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    httpRequestsTotal.inc({ method: req.method, route: req.originalUrl, status: res.statusCode });
    end({ method: req.method, route: req.originalUrl, status: res.statusCode });
  });
  next();
}

// فحص الذاكرة كل 15 ثانية وإرسال تنبيه
function startMemoryWatcher() {
  setInterval(() => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;

    console.log(`Memory used: ${usedMemPercent.toFixed(2)}%`);

    if (usedMemPercent > 60) {
      sendAlertEmail(usedMemPercent);
    }
  }, 15000);
}

async function sendAlertEmail(usedMemPercent){
  const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

  const mailOptions = {
    from: `"MyApp" <${process.env.EMAIL_USER}>`,
    to: 'abdoabdoyytt5678@gmail.com',
    subject: '⚠ Memory Usage Alert',
    text: `Memory usage is high: ${usedMemPercent.toFixed(2)}%`,
  };

    await transporter.sendMail(mailOptions);

}

// Export كل حاجة عشان نستخدمها في app.js
module.exports = {
  register,
  metricsMiddleware,
  startMemoryWatcher,
};
