import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ContactMessage from "@/lib/models/ContactMessage"
import nodemailer from "nodemailer"

export async function POST(request) {
  try {
    await connectDB()
    const { name, email, subject, message } = await request.json()

    // Save to database
    const saved = await ContactMessage.create({ name, email, subject, message })

    // Try to send email notification (only if SMTP is configured)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.CONTACT_NOTIFY_EMAIL || process.env.SMTP_USER,
          subject: `New Contact Form Submission: ${subject}`,
          text: `You have received a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
          html: `<h2>New Contact Form Submission</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Subject:</b> ${subject}</p><p><b>Message:</b><br/>${message.replace(/\n/g, '<br/>')}</p>`
        })
      } catch (emailError) {
        console.error("Email sending failed:", emailError)
        // Continue anyway - the message is saved to database
      }
    } else {
      console.log("Email configuration not set up - message saved to database only")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ success: false, message: "Failed to submit contact form." }, { status: 500 })
  }
}