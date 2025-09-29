const nodemailer = require("nodemailer");
const ApiError = require("./ApiError");

const sendEmail = async (options) => {
  if(process.env.NODE_ENV === "development") {
    console.log("📧 Mock email sent (test mode)");
    return true; 
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    secure: true, // true for 465, false for other ports
    tls: {
      rejectUnauthorized: false, // ✅ تجاوز مشكلة الشهادة
    },
  });
  const mailOptions = {
    from: `API <${process.env.EMAIL_USER}>`,
    to: options?.to || "abdoabdoyytt5678@gmail.com",
    subject: options?.subject,
    html: options?.html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully");
  } catch (err) {
    return next(new ApiError("Failed to send email", 502));
  }
};

module.exports = sendEmail;
