// // controllers/Upload_Drive.js
// const fs = require("fs");
// const { google } = require("googleapis");
// const multer = require("multer");
// const path = require("path");
// const ApiError = require("../utils/ApiError");
// const apiKeys = require("../../apiKey.json");

// // Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) =>
//     cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

// // Google Drive Auth
// const SCOPES = ["https://www.googleapis.com/auth/drive"];
// async function authorize() {
//   const jwtClient = new google.auth.JWT(
//     apiKeys.client_email,
//     null,
//     apiKeys.private_key,
//     SCOPES
//   );
//   await jwtClient.authorize();
//   return jwtClient;
// }

// // رفع ملفات على Google Drive
// async function uploadFilesToDrive(files, folderId) {
//   const auth = await authorize();
//   const drive = google.drive({ version: "v3", auth });

//   const uploadedFiles = [];

//   for (const file of files) {
//     const fileMetadata = {
//       name: file.filename,
//       parents: [folderId],
//     };
//     const media = {
//       mimeType: file.mimetype,
//       body: fs.createReadStream(file.path),
//     };

//     const response = await drive.files.create({
//       resource: fileMetadata,
//       media,
//       fields: "id, webViewLink",
//       supportsAllDrives: true,
//     });

//     // حذف النسخة المحلية بعد الرفع
//     fs.unlinkSync(file.path);

//     uploadedFiles.push(response.data);
//   }

//   return uploadedFiles;
// }

// // Middleware للرفع
// const uploadImages = upload.array("images", 4);

// const aaaa = async (req, res, next) => {
//   try {
//     if (!req.files || req.files.length === 0)
//       return next(new ApiError("لم يتم تحميل أي الصور", 400));

//     const FOLDER_ID = "1HZhIBsneHmbGHrk06tAoBYubP2KLa1og";
//     const uploaded = await uploadFilesToDrive(req.files, FOLDER_ID);

//     res.status(200).json({ success: true, files: uploaded });
//   } catch (err) {
//     next(new ApiError(err.message, 500));
//   }
// };

// module.exports = { uploadImages, aaaa };
