const { sendMail } = require("../utils/mailer");

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: "Name, email, and message are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Use configured email address
    const adminEmail = process.env.USE_GMAIL === 'true' 
      ? process.env.EMAIL_USER || "ganapathyadappt@gmail.com"
      : process.env.SMTP_USER || "bbs@balabharath.com";

    // Email content for admin
    const adminHtml = `
      <h2>New Contact Message from BBSCART</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p><em>This message was sent from the BBSCART Contact Us page</em></p>
    `;

    const adminText = `
New Contact Message from BBSCART

Name: ${name}
Email: ${email}
Message:
${message}

---
This message was sent from the BBSCART Contact Us page
    `;

    // Email content for customer (confirmation)
    const customerHtml = `
      <h2>Thank you for contacting BBSCART</h2>
      <p>Hi ${name},</p>
      <p>We have received your message and will get back to you soon.</p>
      <p><strong>Your Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p>Best regards,<br/>BBSCART Team</p>
    `;

    const customerText = `
Thank you for contacting BBSCART

Hi ${name},

We have received your message and will get back to you soon.

Your Message:
${message}

Best regards,
BBSCART Team
    `;

    // Send email to admin
    await sendMail({
      to: adminEmail,
      subject: `New Contact Message from ${name}`,
      html: adminHtml,
      text: adminText,
    });

    // Send confirmation email to customer
    await sendMail({
      to: email,
      subject: "We received your message - BBSCART",
      html: customerHtml,
      text: customerText,
    });

    console.log(`✅ Contact message sent successfully from ${email}`);

    return res.status(200).json({
      message: "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      success: true,
    });

  } catch (error) {
    console.error("❌ Error sending contact message:", error);
    return res.status(500).json({
      message: "Failed to send message. Please try again later.",
      error: error.message,
    });
  }
};
