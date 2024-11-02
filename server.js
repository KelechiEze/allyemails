import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // Import for defining __dirname
import nodemailer from 'nodemailer';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

// Define __dirname for ES6 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Configure CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
}));

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to fetch emails from CSV file
async function getCsvData() {
  const filePath = path.join(__dirname, 'data', 'SAMPLE-EMAILS - Sheet1.csv'); // Path to your CSV file
  const emails = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.email) emails.push(row.email); // Assuming 'email' is the column name in the CSV
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

    for (const email of emails) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Success! AllyHub’s New Email Feature is Live!',
        text: `Dear [Recipient's Name],

We are thrilled to inform you that the implementation of our new email feature using Google Sheets has been a success! With this update, AllyHub can seamlessly send important updates, announcements, and more to our valued subscribers directly from our Google Sheets data.

This improvement allows us to stay connected with you in a more efficient and timely manner, ensuring that you don’t miss out on essential information. We appreciate your support and trust in AllyHub, and we look forward to serving you better through this new feature.

**Here’s what this means for you:**
- **Timely Updates:** You’ll receive the latest updates from AllyHub directly in your inbox.
- **Enhanced Communication:** With our automated system, communication is streamlined, ensuring you are always in the loop.
- **Reliability:** Our enhanced setup using Google Sheets and secure email channels keeps your data safe while allowing us to communicate effectively.

Thank you for being a part of the AllyHub community. If you have any questions, feedback, or would simply like to connect, please don’t hesitate to reach out.

Warm regards,

AllyHub Team
[Your Position, e.g., Support Team]
AllyHub

Contact Us: [Your Contact Information]
Website: [Your Website URL]`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.error('Error sending email:', error);
        }
        console.log('Email sent:', info.response);
      });
    }
  } catch (error) {
    console.error('Error fetching data or sending emails:', error);
  }
}


// Send emails every 2 minutes
setInterval(sendEmails, 2 * 60 * 1000);

// API endpoint to fetch emails
app.get('/api/emails', async (req, res) => {
  try {
    const emails = await getCsvData();
    res.json(emails);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
