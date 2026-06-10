import nodemailer from "nodemailer";
import { getMailConfig } from "@/lib/env";

export async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
}) {
  const config = getMailConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
}
