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
    const startedAt = Number(body.startedAt || 0);

    // ------------------------
    // Honeypot anti-bot
    // ------------------------

    if (website) {
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200 }
      );
    }

    // ------------------------
    // Temps minimum remplissage
    // Bot = trop rapide
    // ------------------------

    const now = Date.now();

    if (startedAt && now - startedAt < 3000) {
      return new Response(
        JSON.stringify({ error: "Spam détecté" }),
        { status: 400 }
      );
    }

    // ------------------------
    // Champs obligatoires
    // ------------------------

    if (!nom || !email || !situation) {
      return new Response(
        JSON.stringify({ error: "Champs manquants" }),
        { status: 400 }
      );
    }

    // ------------------------
    // Longueur max message
    // ------------------------

    if (situation.length > 3000) {
      return new Response(
        JSON.stringify({ error: "Message trop long" }),
        { status: 400 }
      );
    }

    // ------------------------
    // Validation email
    // ------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Email invalide" }),
        { status: 400 }
      );
    }

    // ------------------------
    // Emails jetables connus
    // ------------------------

    const disposableDomains = [
      "mailinator.com",
      "10minutemail.com",
      "guerrillamail.com",
      "tempmail.com"
    ];

    const domain =
      email.split("@")[1]?.toLowerCase();

    if (
      domain &&
      disposableDomains.includes(domain)
    ) {
      return new Response(
        JSON.stringify({
          error: "Adresse refusée"
        }),
        { status: 400 }
      );
    }

    // ------------------------
    // Email envoyé à FixBiz
    // ------------------------

    const htmlContent = `
      <h2>Nouvelle demande FixBiz</h2>

      <p>
      <strong>Nom :</strong>
      ${nom}
      </p>

      <p>
      <strong>Email :</strong>
      ${email}
      </p>

      <p>
      <strong>Téléphone :</strong>
      ${telephone || "Non renseigné"}
      </p>

      <p>
      <strong>Situation :</strong>
      </p>

      <p>
      ${situation.replace(/\n/g,"<br>")}
      </p>
    `;

    const brevoResponse =
      await fetch(
        "https://api.brevo.com/v3/smtp/email",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "api-key":
              env.BREVO_API_KEY,
          },

          body: JSON.stringify({

            sender: {
              name: "FixBiz",
              email:
                env.CONTACT_FROM,
            },

            to: [
              {
                email:
                  env.CONTACT_TO,

                name:
                  "FixBiz",
              },
            ],

            replyTo: {
              email,
              name: nom,
            },

            subject:
              `Nouvelle demande FixBiz - ${nom}`,

            htmlContent,
          }),
        }
      );

    if (!brevoResponse.ok) {

      return new Response(
        JSON.stringify({
          error: "Erreur Brevo"
        }),
        { status: 500 }
      );

    }

    return new Response(
      JSON.stringify({
        ok: true
      }),
      { status: 200 }
    );

  } catch {

    return new Response(
      JSON.stringify({
        error:
          "Erreur serveur"
      }),
      { status: 500 }
    );

  }
};