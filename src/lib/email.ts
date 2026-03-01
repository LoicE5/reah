import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   ?? 'localhost',
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
  });
}

const FROM = process.env.SMTP_FROM ?? '"REAH" <noreply@reah.fr>';

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const transport = createTransporter();
  await transport.sendMail({
    from:    FROM,
    to,
    subject: 'Confirmation de ton adresse e-mail – REAH',
    text:    `Voici le code pour confirmer ton adresse e-mail : ${code}`,
    html: `
      <div style="font-family: Montserrat, sans-serif; background:#0d0d0d; color:#fff; padding:40px; border-radius:12px; max-width:500px; margin:auto;">
        <h2 style="color:#d60036;">REAH</h2>
        <p>Voici le code pour confirmer ton adresse e-mail :</p>
        <div style="font-size:32px; font-weight:700; letter-spacing:8px; color:#d60036; margin:24px 0;">${code}</div>
        <p style="color:#888; font-size:14px;">Ce code expire après 24h.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const transport = createTransporter();
  await transport.sendMail({
    from:    FROM,
    to,
    subject: 'Réinitialisation de ton mot de passe – REAH',
    text:    `Voici le lien de réinitialisation de ton mot de passe :\n\n${resetLink}`,
    html: `
      <div style="font-family: Montserrat, sans-serif; background:#0d0d0d; color:#fff; padding:40px; border-radius:12px; max-width:500px; margin:auto;">
        <h2 style="color:#d60036;">REAH</h2>
        <p>Tu as demandé à réinitialiser ton mot de passe.</p>
        <a href="${resetLink}" style="display:inline-block; margin:24px 0; padding:12px 24px; background:#d60036; color:#fff; border-radius:8px; text-decoration:none; font-weight:600;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color:#888; font-size:14px;">Si tu n'as pas fait cette demande, ignore cet e-mail.</p>
      </div>
    `,
  });
}
