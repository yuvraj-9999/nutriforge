import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email, name, resetLink) => {
    try {
       const response = await resend.emails.send({
            from: "Nutriforge <noreply@mail.goslings.online>",
            to: email,
            subject: "Reset your Nutriforge password",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2>Reset your password</h2>
    
                    <p>Hi ${name},</p>
    
                    <p>
                        We received a request to reset your NutriForge password.
                        Click the button below to create a new password.
                    </p>
    
                    <p style="margin:30px 0;">
                        <a
                            href="${resetLink}"
                            style="
                                background:#111827;
                                color:#fff;
                                padding:12px 24px;
                                text-decoration:none;
                                border-radius:8px;
                                display:inline-block;
                            "
                        >
                            Reset Password
                        </a>
                    </p>
    
                    <p>This link will expire in 15 minutes.</p>
    
                    <p>
                        If you didn't request this password reset, you can safely
                        ignore this email.
                    </p>
    
                    <hr>
    
                    <p>— Team NutriForge</p>
                </div>
            `,
            
        });
        return response;
        
    } catch (error) {
        console.error("RESEND ERROR");
        console.error(error);
    }
};