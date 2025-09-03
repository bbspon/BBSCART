const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, html, text }) {
  const from = process.env.MAIL_FROM || "BBSCART <no-reply@bbscart.com>";
  return transporter.sendMail({ from, to, subject, html, text });
}

// Existing temp-password template (kept)
function vendorWelcomeEmail({ name, email, tempPassword }) {
  const subject = "Your BBSCART Vendor Login Credentials";
  const text = `Hello ${name || "Vendor"},

Your vendor account is ready.

Login email: ${email}
Temporary password: ${tempPassword}

For security, please sign in and change your password immediately.

Thanks,
BBSCART Team`;

  const html = `<p>Hello <b>${name || "Vendor"}</b>,</p>
<p>Your vendor account is ready.</p>
<p><b>Login email:</b> ${email}<br/>
<b>Temporary password:</b> ${tempPassword}</p>
<p>For security, please sign in and change your password immediately.</p>
<p>Thanks,<br/>BBSCART Team</p>`;

  return { subject, text, html };
}

// New set-password-link template
function vendorSetPasswordEmail({ name, email, link }) {
  const subject = "Set your BBSCART vendor password";
  const text = `Hello ${name || "Vendor"},

We created your vendor account for ${email}.
Set your password within 48 hours using this link:

${link}

If you didn’t request this, ignore this email.`;

  const html = `<p>Hello <b>${name || "Vendor"}</b>,</p>
<p>We created your vendor account for <b>${email}</b>.</p>
<p>Please set your password within <b>48 hours</b> using this link:</p>
<p><a href="${link}">${link}</a></p>
<p>If you didn’t request this, you can ignore this email.</p>`;

  return { subject, text, html };
}

transporter
  .verify()
  .then(() => console.log("SMTP ready"))
  .catch((err) => console.error("SMTP verify failed:", err));

module.exports = { sendMail, vendorWelcomeEmail, vendorSetPasswordEmail };
