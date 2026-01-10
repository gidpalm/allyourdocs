import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const feedback = await request.json()
    
    // Validate required fields
    if (!feedback.message || !feedback.message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      )
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // For other email providers, use:
      // host: 'smtp.your-email-provider.com',
      // port: 587,
      // secure: false, // true for 465, false for other ports
    })

    // Email subject based on feedback type
    const feedbackTypeLabels: Record<string, string> = {
      suggestion: 'Suggestion',
      bug: 'Bug Report',
      compliment: 'Compliment',
      feature: 'Feature Request',
      question: 'Question',
      other: 'Feedback'
    }
    
    const feedbackType = feedbackTypeLabels[feedback.feedbackType] || 'Feedback'

    // Create email content for you (admin)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Your email
      subject: `[AllYourDocs] New ${feedbackType}: ${feedback.name || 'Anonymous'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #ddd; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .message { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
            .rating { color: #f59e0b; font-size: 18px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 New Feedback Received</h1>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Type:</span>
                <span style="background: #e0e7ff; color: #4f46e5; padding: 4px 8px; border-radius: 4px; margin-left: 10px;">
                  ${feedbackType}
                </span>
              </div>
              
              <div class="field">
                <span class="label">From:</span>
                ${feedback.name || 'Anonymous'} ${feedback.email ? `(${feedback.email})` : ''}
              </div>
              
              <div class="field">
                <span class="label">Rating:</span>
                <span class="rating">${'⭐'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</span>
                <span> (${feedback.rating}/5)</span>
              </div>
              
              <div class="field">
                <span class="label">Message:</span>
                <div class="message">${feedback.message.replace(/\n/g, '<br>')}</div>
              </div>
              
              <div class="field">
                <span class="label">Submitted:</span>
                ${new Date(feedback.timestamp).toLocaleString()}
              </div>
              
              <div class="field">
                <span class="label">Page URL:</span>
                <a href="${feedback.pageUrl}" style="color: #3b82f6;">${feedback.pageUrl}</a>
              </div>
              
              <div class="footer">
                <p>This feedback was submitted via AllYourDocs.com Feedback Form</p>
                <p>Timestamp: ${new Date().toISOString()}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    // Send email to admin (you)
    await transporter.sendMail(adminMailOptions)

    // Optional: Send confirmation email to user if they provided email
    if (feedback.email) {
      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: feedback.email,
        subject: 'Thank you for your feedback!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #ddd; }
              .thank-you { text-align: center; font-size: 18px; margin: 20px 0; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Thank You! 🙏</h1>
              </div>
              <div class="content">
                <div class="thank-you">
                  <p>Hello ${feedback.name || 'there'},</p>
                  <p>We've received your feedback and appreciate you taking the time to share it with us.</p>
                  <p>Our team will review your ${feedbackType.toLowerCase()} and get back to you if needed.</p>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Your feedback type:</strong> ${feedbackType}</p>
                  <p><strong>Your rating:</strong> ${feedback.rating}/5</p>
                  <p><strong>Submitted:</strong> ${new Date(feedback.timestamp).toLocaleDateString()}</p>
                </div>
                
                <p>If you have any additional questions or concerns, feel free to reply to this email.</p>
                
                <div class="footer">
                  <p>Best regards,</p>
                  <p><strong>The AllYourDocs.com Team</strong></p>
                  <p>This is an automated message. Please do not reply directly to this email.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      }

      await transporter.sendMail(userMailOptions)
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback sent successfully',
        sentConfirmation: !!feedback.email
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error sending feedback email:', error)
    
    // More specific error messages
    let errorMessage = 'Failed to send feedback'
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check email credentials.'
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server.'
    } else if (error.message.includes('Invalid login')) {
      errorMessage = 'Invalid email credentials.'
    }

    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: error.message 
      },
      { status: 500 }
    )
  }
}