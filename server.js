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
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
        }

        .header {
            background-color: #002f6c;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            position: relative;
            min-height: 200px;
        }

        .header img {
            max-width: 150px;
        }

        .header h1 {
            margin: 45px;
            font-size: 28px;
            font-weight: bold;
        }

        .header p {
            font-size: 25px;
            margin-top: 5px;
            position: absolute;
            bottom: 55px;
            left: 50%;
            right: -45%;
            transform: translateX(-50%);
            text-align: center;
            z-index: 3;
        }

        .register-button-container {
            margin-top: 15px;
        }

        .register-button {
            display: inline-block;
            background-color: #ff6600;
            color: #fff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
        }

        .main-content {
            padding: 20px;
            position: relative;
            text-align: center;
            background-color: #f9f9f9;
        }

        .main-content p {
            font-size: 18px;
            color: #555;
            line-height: 1.6;
        }

        .main-content .chess-image {
            width: 100px;
            position: absolute;
        }

        .main-content .chess-image.top-left {
            top: 10;
            left: 30px;
        }

        .main-content .chess-image.bottom-right {
            bottom: 10px;
            right: 30px;
        }

        .details {
            position: relative;
            text-align: center;
            padding: 20px;
        }

        .details .event-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 0px;
        }

        .details .shadow-frame {
            width: 93%;
            height: 93%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(-1);
            border-radius: 5%;
            z-index: 1;
        }

        .details .overlay-image {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 30%;
            height: 30%;
            object-fit: fill;
            z-index: 2;
            transform: translate(-50%, -50%);
        }

        .details p {
            position: relative;
            z-index: 3;
            margin-top: 20px;
            font-size: 16px;
            color: #333;
        }

        .footer {
            background-color: #002f6c;
            color: #ffffff;
            text-align: center;
            padding: 15px;
            font-size: 20px;
        }

        .footer a {
            color: #ff6600;
            text-decoration: none;
            margin: 0 5px;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        .social-icons img {
            width: 30px;
            margin: 0 5px;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <img src="images/TheSummit-2023-1-e1712249826695 1.png" alt="Takeover at the Summit" style="position: absolute; top: 10px; left: 10px; width: 150px;">
            <img src="images/Globedesign.png" alt="Globe Design" style="position: absolute; bottom: 0; right: 0; width: 200px; z-index: 1;">
            <h1>Welcome to Takeover at the Summit 2025 </h1>
            <p>You’re Invited To Takeover At The Summit 2025!</p>
            <div class="register-button-container">
                <a href="#" class="register-button">Register Now</a>
            </div>
        </div>

        <div class="main-content">
            <img src="images/Chess design.png" alt="Chess Design" class="chess-image top-left">
            <img src="images/Chess design.png" alt="Chess Design" class="chess-image bottom-right">
            <p>Dear [Recipient's Name],</p>
            <p>
                We are thrilled to invite you to Takeover 2025,
                an extraordinary event where innovation,
                creativity, and collaboration come together to shape the future.
            </p>
        </div>

        <div class="details">
            <img src="images/image one.jpeg" alt="Event Image" class="event-image">
            <img src="images/shadow frame.png" alt="Shadow Frame" class="shadow-frame">
            <img src="images/3rd section.png" alt="Overlay Image" class="overlay-image">
            <p>
                For more information, visit: <a href="http://www.gharvestisland.org" style="color: #002f6c;">www.gharvestisland.org</a>
            </p>
        </div>

        <div class="footer">
            <p>Follow us:</p>
            <div class="social-icons">
                <a href="#"><img src="https://img.icons8.com/material-rounded/24/000000/facebook-new.png" alt="Facebook"></a>
                <a href="#"><img src="https://img.icons8.com/material-rounded/24/000000/twitter.png" alt="Twitter"></a>
                <a href="#"><img src="https://img.icons8.com/material-rounded/24/000000/instagram-new.png" alt="Instagram"></a>
                <a href="#"><img src="https://img.icons8.com/material-rounded/24/000000/linkedin.png" alt="LinkedIn"></a>
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
        subject: 'Merry Christmas from Ally-Hub!',
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
