import "server-only";

export async function sendPasswordChangeCode(email: string, code: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[voltbean] Password change confirmation for ${email}: ${code}`);
    return { delivered: false, devCode: code };
  }

  // Wire a transactional email provider here before enabling password changes in production.
  console.warn(`Password change confirmation email was not sent to ${email}; no mail provider is configured.`);
  return { delivered: false };
}
