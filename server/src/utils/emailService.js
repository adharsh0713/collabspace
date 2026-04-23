const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

// Using Ethereal Email for testing purposes. In production, use SendGrid/AWS SES/etc.
// You can override these with environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER || 'leola.jacobi33@ethereal.email',
        pass: process.env.SMTP_PASS || 'GZtD51JtU43C3Z2Z31'
    }
});

/**
 * Sends a booking confirmation email with a generated QR code
 * @param {Object} bookingDetails - Details of the booking
 * @param {String} userEmail - Recipient email
 */
const sendBookingConfirmation = async (bookingDetails, userEmail) => {
    try {
        // Generate QR Code containing booking ID
        const qrCodeDataUrl = await QRCode.toDataURL(bookingDetails._id.toString());
        const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

        const startTime = new Date(bookingDetails.startTime).toLocaleString();
        const endTime = new Date(bookingDetails.endTime).toLocaleString();

        const mailOptions = {
            from: '"CollabSpace Booking" <no-reply@collabspace.app>',
            to: userEmail,
            subject: `Room Booking Confirmed: ${bookingDetails.room.name || 'Your Room'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                    <h2 style="color: #4f46e5; margin-top: 0;">Booking Confirmed!</h2>
                    <p>Your room booking has been successfully created.</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p><strong>Room:</strong> ${bookingDetails.room.name || 'N/A'}</p>
                        <p><strong>Start:</strong> ${startTime}</p>
                        <p><strong>End:</strong> ${endTime}</p>
                    </div>
                    <p>Please present the QR code below at the room tablet to check-in:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <img src="cid:qrcode" alt="Check-in QR Code" style="width: 200px; height: 200px;" />
                    </div>
                    <p style="color: #64748b; font-size: 12px; text-align: center;">
                        Note: If you do not check-in within 15 minutes of the start time, your booking will be marked as NO-SHOW.
                    </p>
                </div>
            `,
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: qrCodeBuffer,
                    cid: 'qrcode'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        throw error;
    }
};

module.exports = {
    sendBookingConfirmation
};
