const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { Maintenance } = require("../models/Maintenance_Model");
const validateMaintenance = require("../validations/Maintenance.validation");
const nodemailer = require("nodemailer");
const { User } = require("../models/User_Model");

/**
 * @desc   get all maintenances
 * @route   /api/maintenances
 * @method  GET
 * @access  Private
 */
const getAllMaintenances = asyncHandler(async (req, res) => {
  const maintenances = await Maintenance.find({ user: { $ne: null } })
    .populate("user", "-password -addresses")
    .sort({ createdAt: -1 });
  res.status(200).send({
    results: maintenances.length,
    data: maintenances,
    status: "success",
  });
});

/**
 * @desc   get single maintenance
 * @route   /api/maintenances/user
 * @method  GET
 * @access  Private
 */
const getUserMaintenance = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const maintenance = await Maintenance.find({ user: userId }).sort({
    createdAt: -1,
  });

  res.status(200).send({
    results: maintenance.length,
    data: maintenance,
    status: "success",
  });
});

/**
 * @desc   create new maintenance
 * @route   /api/maintenances
 * @method  POST
 * @access  Private
 */
const createMaintenance = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { image, ...Maintenancedata } = req.body;
  const { error } = validateMaintenance(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const lastOrder = await Maintenance.findOne().sort({ orderNumber: -1 });
  const newOrderNumber = lastOrder?.orderNumber
    ? lastOrder.orderNumber + 1
    : 1001;
  const maintenance = await Maintenance.create({
    user: userId,
    orderNumber: newOrderNumber,
    ...Maintenancedata,
    image,
  });
  const user = await User.findById(userId);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    host: "smtp.gmail.com",
    port: 587,
    secure: true, // true for 465, false for other ports

    tls: {
      rejectUnauthorized: false, // ✅ تجاوز مشكلة الشهادة
    },
  });

  const mailOptions = {
    from: `My Company <${process.env.EMAIL_USER}>`,
    to: "abdoabdoyytt5678@gmail.com",
    subject: `🛍️ طلب صيانة جديد من ${user.name}`,
    html: `
      <html dir="rtl">
        <head>
          <meta charset="UTF-8" />
        </head>
        <body style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 5px; padding: 20px; margin: auto; max-width: 600px;">
            
            <!-- رقم الطلب -->
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">رقم الطلب:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${maintenance.orderNumber}</p>
            </div>
            
            <!-- تفاصيل المنتجات -->
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">تفاصيل المنتجات:</h3>
             
                <div style="margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                  <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">اسم الجهاز:</p>
                  <p style="margin: 0; color: #555; display: inline-block;">${maintenance.title}</p>
                  <br />
                  <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">شرح الشكوي:</p>
                  <p style="margin: 0; color: #555; display: inline-block;">${maintenance.description}</p>
                </div>
              
            </div>
            
            <!-- عنوان الشحن -->
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">عنوان الشحن:</h3>
              <div style="background-color: #f9f9f9; border-radius: 5px; padding: 10px; word-wrap: break-word;">
                <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">الاسم المستعار:</p>
                <p style="margin: 0; color: #555; display: inline-block;">${maintenance.alias}</p>
                <br />
                <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">العنوان:</p>
                <p style="margin: 0; color: #555; display: inline-block;">${maintenance.details}</p>
                <br />
                <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">الهاتف:</p>
                <p style="margin: 0; color: #555; display: inline-block;">${maintenance.phone}</p>
                <br />
                <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">المدينة:</p>
                <p style="margin: 0; color: #555; display: inline-block;">${maintenance.city}</p>
                <br />
              </div>
            </div>
            
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully");
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }

  res.status(201).send({
    data: maintenance,
    status: "success",
  });
});

/**
 * @desc   delete single maintenance
 * @route   /api/maintenances/:id
 * @method  DELETE
 * @access  Private
 */
const deleteMaintenance = asyncHandler(async (req, res, next) => {
  const maintenance = await Maintenance.findByIdAndDelete(req.params.id);
  if (!maintenance) {
    return next(new ApiError("Maintenance not found", 404));
  }
  res.status(204).send();
});

module.exports = {
  getAllMaintenances,
  getUserMaintenance,
  createMaintenance,
  deleteMaintenance,
};
