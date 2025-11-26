// backend/sendOtp.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (to, otp) => {
  try {
    await resend.emails.send({
      from: 'Seguridad <noreply@tudominio.com>',
      to,
      subject: 'Tu código de seguridad (MFA)',
      text: `Tu código MFA es: ${otp}`
    });
    return true;
  } catch (error) {
    console.error("❌ Error enviando OTP:", error);
    return false;
  }
};
