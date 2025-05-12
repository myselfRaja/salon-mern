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

module.exports = sendConfirmationEmail;