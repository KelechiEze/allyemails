import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

// Define __dirname for ES6 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000; // Use dynamic PORT for hosting platforms

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Allow requests from the React app or production client
  methods: ['GET', 'POST'],
}));
app.use(express.json()); // Middleware for parsing JSON

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to read CSV data
async function getCsvData() {
  const filePath = path.join(__dirname, 'data', 'SAMPLE-EMAILS - Sheet1.csv');
  const emails = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.email) emails.push(row.email);
      })
      .on('end', () => {
        resolve(emails);
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
}

// Function to send emails
async function sendEmails() {
  try {
    const emails = await getCsvData();

    // Email template
    const emailTemplate = `
                 <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Takeover at the Summit 2025 Invitation</title>
</head>

<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd;">
        <div style="background-color: #002f6c; color: #ffffff; text-align: center; padding: 20px; position: relative; min-height: 200px;">
            <img src="https://kelechieze.wordpress.com/wp-content/uploads/2025/01/thesummit-2023-1-e1712249826695-1.png" alt="Takeover at the Summit" style="position: absolute; top: 10px; left: 10px; width: 150px;">
            <img src="https://kelechieze.wordpress.com/wp-content/uploads/2025/01/globedesign.png" alt="Globe Design" style="position: absolute; bottom: 0; right: 0; width: 200px; z-index: 1;">
            <h1 style="margin: 45px; font-size: 28px; font-weight: bold;">Welcome to Takeover at the Summit 2025</h1>
            <p style="font-size: 25px; margin-top: 5px; position: absolute; bottom: 55px; left: 50%; right: -45%; transform: translateX(-50%); text-align: center; z-index: 3;">You’re Invited To Takeover At The Summit 2025!</p>
            <div style="margin-top: 15px;">
                <a href="#" style="display: inline-block; background-color: #ff6600; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Register Now</a>
            </div>
        </div>

        <div style="padding: 20px; position: relative; text-align: center; background-color: #f9f9f9;">
            <img src="https://kelechieze.wordpress.com/wp-content/uploads/2025/01/chess-design.png" alt="Chess Design" style="width: 100px; position: absolute; top: 10; left: 30px;">
            <img src="https://kelechieze.wordpress.com/wp-content/uploads/2025/01/chess-design.png" alt="Chess Design" style="width: 100px; position: absolute; bottom: 10px; right: 30px;">
            <p style="font-size: 18px; color: #555; line-height: 1.6;">Dear [Recipient's Name],</p>
            <p style="font-size: 18px; color: #555; line-height: 1.6;">
                We are thrilled to invite you to Takeover 2025, an extraordinary event where innovation, creativity, and collaboration come together to shape the future.
            </p>
        </div>

        <div style="position: relative; text-align: center; padding: 20px;">
            <img src="https://kelechieze.wordpress.com/wp-content/uploads/2025/01/image-one.jpeg" alt="Event Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0px;">
            <img src="https://kelechieze.wordpress.com/wp-content/uploads/2025/01/shadow-frame.png" alt="Shadow Frame" style="width: 93%; height: 93%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(-1); border-radius: 5%; z-index: 1;">
            <img src="https://kelechieze.wordpress.com/wp-content/uploads/2025/01/3rd-section.png" alt="Overlay Image" style="position: absolute; top: 50%; left: 50%; width: 30%; height: 30%; object-fit: fill; z-index: 2; transform: translate(-50%, -50%);">
            <p style="position: relative; z-index: 3; margin-top: 20px; font-size: 16px; color: #333;">
                For more information, visit: <a href="http://www.gharvestisland.org" style="color: #002f6c;">www.gharvestisland.org</a>
            </p>
        </div>

        <div style="background-color: #002f6c; color: #ffffff; text-align: center; padding: 15px; font-size: 20px;">
            <p>Follow us:</p>
            <div>
                <a href="#"><img src="https://img.icons8.com/material-rounded/24/000000/facebook-new.png" alt="Facebook" style="width: 30px; margin: 0 5px;"></a>
                <a href="#"><img src="https://img.icons8.com/material-rounded/24/000000/twitter.png" alt="Twitter" style="width: 30px; margin: 0 5px;"></a>
                <a href="#"><img src="https://img.icons8.com/material-rounded/24/000000/instagram-new.png" alt="Instagram" style="width: 30px; margin: 0 5px;"></a>
                <a href="#"><img src="https://img.icons8.com/material-rounded/24/000000/linkedin.png" alt="LinkedIn" style="width: 30px; margin: 0 5px;"></a>
            </div>
        </div>
    </div>
</body>

</html>

    `;

    for (const email of emails) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Takeover at The Summit',
        html: emailTemplate, // Use the HTML template
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${email}`);
    }

    return { success: true, message: 'Emails sent successfully.' };
  } catch (error) {
    console.error('Error sending emails:', error);
    return { success: false, message: 'Error sending emails.' };
  }
}

// API endpoint to fetch emails
app.get('/api/emails', async (req, res) => {
  try {
    const emails = await getCsvData();
    res.json(emails);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// API endpoint to send emails manually
app.post('/api/send-emails', async (req, res) => {
  const result = await sendEmails();
  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(500).json({ message: result.message });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => { // Bind to 0.0.0.0
  console.log(`Server is running on port ${PORT}`);
});
