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
<html>
<head>
    <title>Valentine's Email</title>
</head>
<body style="margin: 0; padding: 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="background: url('cid:valentine-bg') no-repeat center center; background-size: cover; padding: 50px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td align="center" style="padding: 30px;">
                            <h1 style="color: #ffffff; font-size: 36px; font-family: Arial, sans-serif; margin: 0;">
                                Happy Valentine's Day! ❤️
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <p style="color: #ffffff; font-size: 18px; font-family: Arial, sans-serif; margin: 0;">
                                Sending you love and happiness today and always. 💖
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
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
