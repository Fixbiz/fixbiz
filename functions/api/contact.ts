export const onRequestPost: PagesFunction<{
  BREVO_API_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
}> = async ({ request, env }) => {
  try {
    const body = await request.json();

    const nom = String(body.nom || "").trim();
    const email = String(body.email || "").trim();
    const telephone = String(body.telephone || "").trim();
    const situation = String(body.situation || "").trim();
    const website = String(body.website || "").trim();

    if (website) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (!nom || !email || !situation) {
      return new Response(JSON.stringify({ error: "Champs manquants" }), { status: 400 });
    }

    const htmlContent = `
      <h2>Nouvelle demande FixBiz</h2>
      <p><strong>Nom :</strong> ${nom}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Téléphone :</strong> ${telephone || "Non renseigné"}</p>
      <p><strong>Situation :</strong></p>
      <p>${situation.replace(/\n/g, "<br>")}</p>
    `;

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
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
            email: env.CONTACT_TO,
            name: "FixBiz",
          },
        ],
        replyTo: {
          email,
          name: nom,
        },
        subject: `Nouvelle demande FixBiz - ${nom}`,
        htmlContent,
      }),
    });

    if (!brevoResponse.ok) {
      return new Response(JSON.stringify({ error: "Erreur Brevo" }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500 });
  }
};