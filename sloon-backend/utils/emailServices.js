require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendConfirmationEmail = async (userEmail, name, date, time, services, totalPrice, tokenNumber) => {
    try {
        // 🛠 Flexible service list handling
        const serviceList = services.map(service => {
          const serviceText = typeof service === 'string' 
            ? service 
            : `${service.name} (₹${service.price})`;
          return `<li>${serviceText}</li>`;
        }).join("");

        // 📅 Basic date formatting (optional)
        const formattedDate = new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        await transporter.sendMail({
            from: `"Salon Name" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Appointment Confirmation #${tokenNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2 style="color: #4a4a4a;">Hello ${name},</h2>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><b>📅 Date:</b> ${formattedDate}</p>
                        <p><b>⏰ Time:</b> ${time}</p>
                        <p><b>🆔 Token:</b> ${tokenNumber}</p>
                        
                        <h4>Services Booked:</h4>
                        <ul>${serviceList}</ul>
                        
                        <p><b>Total Amount:</b> ₹${totalPrice}</p>
                    </div>
                    
                    <p>Thank you for choosing us!</p>
                </div>
            `,
            text: `Hello ${name},\n\nYour appointment is confirmed for ${formattedDate} at ${time}.\n\nServices:\n${services.map(s => typeof s === 'string' ? `- ${s}` : `- ${s.name} (₹${s.price})`).join("\n")}\n\nTotal: ₹${totalPrice}\nToken: ${tokenNumber}\n\nThank you!`
        });

        console.log("📩 Email Sent Successfully!");
    } catch (error) {
        console.error("❌ Error Sending Email:", error);
        throw error; // Re-throw so controller can handle it
    }
};

// Send invoice email - YEH NAYA FUNCTION ADD KARNA HAI
const sendInvoiceEmail = async (invoice, pdfPath) => {
  try {
    const mailOptions = {
      from: `"${process.env.SALON_NAME || 'Salon Luxe'}" <${process.env.EMAIL_USER}>`,
      to: invoice.clientDetails.email,
      subject: `Your Invoice from ${process.env.SALON_NAME || 'Beauty Salon'} - ${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d29b9b; text-align: center;">Thank you for your visit!</h2>
          <p>Dear ${invoice.clientDetails.name},</p>
          <p>Please find your invoice attached for your recent appointment.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${invoice.issueDate.toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${invoice.totalAmount.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${invoice.paymentMethod}</p>
          </div>
          
          <p>We hope to see you again soon!</p>
          <br>
          <p>Best regards,<br>${process.env.SALON_NAME || 'Beauty Salon'} Team</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 12px;">
              ${process.env.SALON_ADDRESS || ''}<br>
              Phone: ${process.env.SALON_PHONE || ''}<br>
              Email: ${process.env.EMAIL_USER || ''}
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          path: pdfPath
        }
      ]
    };
    
    await transporter.sendMail(mailOptions);
    console.log("📩 Invoice Email Sent Successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error Sending Invoice Email:", error);
    throw error;
  }
};

// Dono functions ko export karna
module.exports = {
  sendConfirmationEmail,
  sendInvoiceEmail
};