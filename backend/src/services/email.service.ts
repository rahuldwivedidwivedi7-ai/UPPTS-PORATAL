import nodemailer from 'nodemailer';

// Initialize the transporter using Ethereal (or you can substitute real SMTP credentials)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'test@ethereal.email',
    pass: process.env.SMTP_PASS || 'password',
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendWelcomeEmail = async (
  email: string, 
  designation: string, 
  username: string, 
  plainPassword: string
): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"UP Police Transfer System" <no-reply@uppolice.gov.in>',
      to: email,
      subject: 'Welcome to UPPTS - Your Authority Account Credentials',
      text: `Dear ${designation},

Your account has been created on the UP Police Personnel Transfer & Posting Management System.

Here are your login credentials:
Username: ${username}
Password: ${plainPassword}

For security reasons, you will be required to change your password upon your first login.

Regards,
Technical Services HQ`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Welcome to UPPTS</h2>
          <p>Dear <strong>${designation}</strong>,</p>
          <p>Your account has been successfully created on the UP Police Personnel Transfer & Posting Management System.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${plainPassword}</p>
          </div>
          
          <p style="color: #d32f2f; font-weight: bold;">
            Important: For security reasons, you will be required to change your password immediately upon your first login.
          </p>
          
          <br/>
          <p>Regards,<br/><strong>Technical Services HQ</strong></p>
        </div>
      `,
    });

    console.log(`Welcome email sent to ${email}. Message ID: ${info.messageId}`);
    // If using Ethereal, you can log the preview URL:
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}: ${error}`);
    throw new Error('Failed to send email notification');
  }
};

export default {
  sendWelcomeEmail
};
