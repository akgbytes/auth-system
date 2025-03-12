import nodemailer from "nodemailer";

const sendMail = async (token, email) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  try {
    const verificationLink = `http://localhost:${process.env.PORT}/api/v1/user/verify/${token}`;

    const emailOptions = {
      from: process.env.MAILTRAP_SENDERMAIL,
      to: email,
      subject: "Verify Your Email",
      text: `Click the following link to verify your email: ${verificationLink}`,
      html: generateHTML(verificationLink),
    };
    const info = await transporter.sendMail(emailOptions);
    console.log("Email sent: ", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email.");
  }
};

export default sendMail;

const generateHTML = (verificationLink) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #333;">Verify Your Email Address</h2>
    <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
    <a href="${verificationLink}" 
       style="display: inline-block; padding: 12px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
       Verify Email
    </a>
    <p>If the button above doesn’t work, you can also copy and paste the following link into your browser:</p>
    <p><a href="${verificationLink}" style="word-break: break-all;">${verificationLink}</a></p>
    <p>If you didn’t sign up for an account, please ignore this email.</p>
    <p>Best regards,</p>
    <p>Your Company Name</p>
  </div>
`;
};
