import { Resend } from 'resend';

// Initialize Resend with your API key
// In production, use environment variables for API keys
const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY || 'your_resend_api_key');

/**
 * Sends a welcome email to new users who sign up
 * @param email The recipient email address
 * @returns Promise with email send result
 */
export const sendWelcomeEmail = async (email: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [email],
            subject: 'Welcome to KarmicDD - Your Journey to Value-Aligned Partnerships',
            html: welcomeEmailTemplate(email),
        });

        if (error) {
            throw new Error(`Failed to send welcome email: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw error;
    }
};

/**
 * Sends a newsletter signup confirmation email
 * @param email The recipient email address
 * @returns Promise with email send result
 */
export const sendNewsletterSignup = async (email: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'KarmicDD <newsletter@karmicdd.com>',
            to: [email],
            subject: 'Welcome to the KarmicDD Newsletter',
            html: newsletterSignupTemplate(email),
        });

        if (error) {
            throw new Error(`Failed to send newsletter signup email: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error("Error sending newsletter signup email:", error);
        throw error;
    }
};

/**
 * Template for welcome emails
 */
const welcomeEmailTemplate = (email: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to KarmicDD</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }
    .header {
      background: linear-gradient(135deg, #3e60e9, #5A42E3);
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .logo {
      margin-bottom: 15px;
      font-size: 28px;
      font-weight: bold;
      color: white;
    }
    .content {
      padding: 30px;
      background: white;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #3e60e9, #5A42E3);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(62, 96, 233, 0.25);
    }
    .steps {
      margin: 30px 0;
    }
    .step {
      margin-bottom: 15px;
      padding-left: 25px;
      position: relative;
    }
    .step-number {
      position: absolute;
      left: 0;
      width: 18px;
      height: 18px;
      background: #3e60e9;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-link {
      display: inline-block;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">KarmicDD</div>
      <h1 style="color: white; margin: 0;">Welcome to the Future of Startup Partnerships</h1>
    </div>
    
    <div class="content">
      <p>Hello there,</p>
      <p>Welcome to KarmicDD! We're thrilled to have you join our community dedicated to creating value-aligned partnerships between startups and investors.</p>
      
      <p>Here's how to get started:</p>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <strong>Complete your profile</strong> - The more details you provide, the better matches we can find for you.
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <strong>Review your matches</strong> - Our AI-powered algorithm will find partners aligned with your values and business goals.
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <strong>Connect and collaborate</strong> - Start meaningful conversations with confidence in your aligned vision.
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <strong>Validate alignment</strong> - Use our due diligence tools to ensure compatibility before finalizing partnerships.
        </div>
      </div>
      
      <p>If you have any questions or need assistance, our support team is always here to help.</p>
      
      <center>
        <a href="https://karmicdd.com/dashboard" class="button">Go to My Dashboard</a>
      </center>
      
      <p>Thank you for joining us on this journey to transform the startup ecosystem through value-aligned partnerships.</p>
      
      <p>Best regards,<br>The KarmicDD Team</p>
      
      <div class="social-links">
        <a href="https://twitter.com/karmicdd" class="social-link">Twitter</a>
        <a href="https://linkedin.com/company/karmicdd" class="social-link">LinkedIn</a>
        <a href="https://instagram.com/karmicdd" class="social-link">Instagram</a>
      </div>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} KarmicDD. All rights reserved.</p>
      <p>This email was sent to ${email}. If you didn't sign up for KarmicDD, please disregard this email.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Template for newsletter signup emails
 */
const newsletterSignupTemplate = (email: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the KarmicDD Newsletter</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }
    .header {
      background: linear-gradient(135deg, #3e60e9, #5A42E3);
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .logo {
      margin-bottom: 15px;
      font-size: 28px;
      font-weight: bold;
      color: white;
    }
    .content {
      padding: 30px;
      background: white;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #3e60e9, #5A42E3);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(62, 96, 233, 0.25);
    }
    .insight-box {
      background: #f5f7ff;
      border-left: 4px solid #3e60e9;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .highlight {
      color: #3e60e9;
      font-weight: 600;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-link {
      display: inline-block;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">KarmicDD</div>
      <h1 style="color: white; margin: 0;">Welcome to Our Newsletter!</h1>
    </div>
    
    <div class="content">
      <p>Hello there,</p>
      <p>Thank you for subscribing to the KarmicDD newsletter! You're now part of a community passionate about creating meaningful partnerships in the startup ecosystem.</p>
      
      <div class="insight-box">
        <p><span class="highlight">Did you know?</span> Startups that align with their investors' values are 3.2x more likely to achieve sustainable growth and maintain long-term relationships.</p>
      </div>
      
      <p>Here's what you can expect from our newsletter:</p>
      <ul>
        <li>Monthly insights on value-aligned partnerships</li>
        <li>Success stories from our community</li>
        <li>Expert advice on navigating the startup ecosystem</li>
        <li>Exclusive resources and event invitations</li>
        <li>Updates on new features and improvements to our platform</li>
      </ul>
      
      <p>Our next newsletter will be arriving in your inbox soon. In the meantime, explore our platform to discover how we're revolutionizing startup-investor partnerships.</p>
      
      <center>
        <a href="https://karmicdd.com/insights" class="button">Explore Our Latest Insights</a>
      </center>
      
      <p>If you have any questions or would like to contribute to our knowledge base, please feel free to reach out to our team.</p>
      
      <p>Best regards,<br>The KarmicDD Team</p>
      
      <div class="social-links">
        <a href="https://twitter.com/karmicdd" class="social-link">Twitter</a>
        <a href="https://linkedin.com/company/karmicdd" class="social-link">LinkedIn</a>
        <a href="https://instagram.com/karmicdd" class="social-link">Instagram</a>
      </div>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} KarmicDD. All rights reserved.</p>
      <p>This email was sent to ${email}.</p>
      <p>To unsubscribe, <a href="https://karmicdd.com/unsubscribe?email=${encodeURIComponent(email)}">click here</a>.</p>
    </div>
  </div>
</body>
</html>
`;

export default {
    sendWelcomeEmail,
    sendNewsletterSignup
};