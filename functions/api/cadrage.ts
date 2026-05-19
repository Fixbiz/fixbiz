export const onRequest: PagesFunction<{
  BREVO_API_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
}> = async ({ request, env }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Méthode non autorisée" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();

    const clean = (value: unknown) => String(value || "").trim();

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const societe = clean(body.societe);
    const adresse = clean(body.adresse);
    const siren = clean(body.siren);
    const representant = clean(body.representant);
    const fonction = clean(body.fonction);
    const email = clean(body.email);
    const urgence = clean(body.urgence);
    const situation = clean(body.situation);
    const signataire = clean(body.signataire);
    const signatureImage = clean(body.signatureImage);
    const pdfBase64 = clean(body.pdfBase64);
    const website = clean(body.website);
    const startedAt = Number(body.startedAt || 0);

    if (website) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (startedAt && Date.now() - startedAt < 3000) {
      return new Response(JSON.stringify({ error: "Spam détecté" }), {
        status: 400,
      });
    }

    if (
      !societe ||
      !adresse ||
      !siren ||
      !representant ||
      !fonction ||
      !email ||
      !urgence ||
      !situation ||
      !signataire ||
      !signatureImage ||
      !pdfBase64
    ) {
      return new Response(JSON.stringify({ error: "Champs manquants" }), {
        status: 400,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
      });
    }

    const signatureBase64 = signatureImage.replace(/^data:image\/png;base64,/, "");

    const ip =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      "Non disponible";

    const userAgent =
      request.headers.get("User-Agent") || "Non disponible";

    const dateSignature = new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      dateStyle: "long",
      timeStyle: "short",
    });

    const htmlContent = `
      <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
        <p>Bonjour,</p>

        <p>
          Veuillez trouver ci-joint la lettre de cadrage initial FixBiz validée électroniquement.
        </p>

        <p>
          <strong>Société :</strong> ${escapeHtml(societe)}<br>
          <strong>Représentant :</strong> ${escapeHtml(representant)}<br>
          <strong>Signataire :</strong> ${escapeHtml(signataire)}<br>
          <strong>Fonction :</strong> ${escapeHtml(fonction)}<br>
          <strong>Email :</strong> ${escapeHtml(email)}<br>
          <strong>Date de validation :</strong> ${dateSignature}<br>
          <strong>Adresse IP :</strong> ${escapeHtml(ip)}<br>
          <strong>Navigateur :</strong> ${escapeHtml(userAgent)}
        </p>

        <p>
          Le PDF signé est joint au présent email. La signature manuscrite du client est également jointe séparément.
        </p>

        <p>Bien cordialement,<br>FixBiz</p>
      </div>
    `;

    const sendEmail = async (toEmail: string, toName: string, subject: string) => {
      return fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: "FixBiz",
            email: env.CONTACT_FROM,
          },
          to: [
            {
              email: toEmail,
              name: toName,
            },
          ],
          replyTo: {
            email: env.CONTACT_TO,
            name: "FixBiz",
          },
          subject,
          htmlContent,
          attachment: [
            {
              content: pdfBase64,
              name: "lettre-cadrage-fixbiz.pdf",
            },
            {
              content: signatureBase64,
              name: "signature-client.png",
            },
          ],
        }),
      });
    };

    const fixbizResponse = await sendEmail(
      env.CONTACT_TO,
      "FixBiz",
      `Lettre de cadrage validée - ${signataire} (${societe})`
    );

    if (!fixbizResponse.ok) {
      return new Response(JSON.stringify({ error: "Erreur Brevo FixBiz" }), {
        status: 500,
      });
    }

    const clientResponse = await sendEmail(
      email,
      representant,
      `Votre lettre de cadrage validée — ${signataire}`
    );

    if (!clientResponse.ok) {
      return new Response(JSON.stringify({ error: "Erreur Brevo Client" }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
    });
  }
};