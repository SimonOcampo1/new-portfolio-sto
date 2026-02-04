import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const contactRecipient = process.env.CONTACT_EMAIL;
const contactFrom = process.env.CONTACT_FROM || "Portfolio Contact <onboarding@resend.dev>";
const contactHoneypotMessage = process.env.CONTACT_HONEYPOT_MESSAGE || "";

export async function POST(request: Request) {
  if (!resendApiKey || !contactRecipient) {
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 }
    );
  }

  const { name, email, message, company } = await request.json().catch(() => ({}));

  if (company) {
    if (contactHoneypotMessage) {
      return NextResponse.json({ ok: true, message: contactHoneypotMessage }, { status: 200 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const resend = new Resend(resendApiKey);

  try {
    await resend.emails.send({
      from: contactFrom,
      to: contactRecipient,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || "-"}\n\n${message}`,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
