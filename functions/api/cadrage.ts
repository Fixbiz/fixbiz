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
      !signatureImage
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

    const lettreHtml = `
      <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.55;max-width:760px;margin:auto;">
        <h1 style="text-align:center;margin-bottom:4px;">LETTRE DE CADRAGE INITIAL</h1>
        <p style="text-align:center;color:#6b7280;margin-top:0;">
          Phase préliminaire de compréhension, d’analyse et de cadrage
        </p>

        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <tr>
            <td style="width:50%;vertical-align:top;border:1px solid #dbe4ee;padding:14px;">
              <strong>FIXBIZ</strong><br>
              32 rue Laurent<br>
              68100 Mulhouse<br>
              SIREN : XXX XXX XXX<br>
              Représentée par : Jean-Philippe Schneider<br>
              Fonction : Fondateur FixBiz<br>
              Email : contact@fixbiz.fr<br><br>
              <em>Ci-après : FixBiz</em>
            </td>

            <td style="width:50%;vertical-align:top;border:1px solid #dbe4ee;padding:14px;">
              <strong>${escapeHtml(societe)}</strong><br>
              ${escapeHtml(adresse).replace(/\n/g, "<br>")}<br>
              SIREN : ${escapeHtml(siren)}<br>
              Représentée par : ${escapeHtml(representant)}<br>
              Fonction : ${escapeHtml(fonction)}<br>
              Email : ${escapeHtml(email)}<br><br>
              <em>Ci-après : le Client</em>
            </td>
          </tr>
        </table>

        <h2>1. Objet</h2>
        <p>
          La présente lettre a pour objet de définir les conditions dans lesquelles FixBiz intervient dans une phase préliminaire de compréhension, d’analyse et de cadrage de la situation du Client avant toute éventuelle mission d’accompagnement.
        </p>

        <h2>2. Contexte communiqué par le Client</h2>
        <p>
          Dans le cadre de la présente phase de cadrage, le Client expose les éléments, enjeux ou objectifs pour lesquels il sollicite l’avis ou l’accompagnement éventuel de FixBiz.
        </p>

        <p><strong>Niveau d’urgence déclaré :</strong><br>${escapeHtml(urgence)}</p>

        <p><strong>Description communiquée par le Client :</strong><br>
          ${escapeHtml(situation).replace(/\n/g, "<br>")}
        </p>

        <h2>3. Périmètre de la phase de cadrage</h2>
        <p>
          La phase de cadrage a pour objet de permettre à FixBiz de mieux comprendre la situation du Client, d’identifier les principaux enjeux communiqués et d’apprécier la pertinence d’un éventuel accompagnement.
        </p>
        <p>
          À cette fin, FixBiz pourra examiner les éléments transmis par le Client, solliciter des précisions complémentaires et évaluer les besoins susceptibles de nécessiter une intervention ultérieure.
        </p>
        <p>
          Cette phase pourra également conduire, si cela apparaît pertinent, à la définition des contours d’un accompagnement ou à la préparation d’une proposition ou d’une lettre de mission spécifique.
        </p>

        <h2>4. Informations nécessaires à la phase de cadrage</h2>
        <p>
          Afin de permettre une compréhension suffisante de la situation du Client et, le cas échéant, l’évaluation d’un accompagnement adapté, FixBiz pourra solliciter toute information, précision ou document jugé utile à l’analyse.
        </p>
        <p>
          Le Client s’engage à communiquer des éléments sincères, exacts et suffisamment complets pour permettre cette phase d’étude.
        </p>

        <h2>5. Issue de la phase de cadrage</h2>
        <p>
          À l’issue de la phase de cadrage, FixBiz pourra, selon les éléments communiqués et l’analyse réalisée, proposer un accompagnement, solliciter des informations complémentaires ou recommander l’intervention d’un professionnel tiers lorsque cela apparaît plus adapté à la situation du Client.
        </p>
        <p>
          Cette phase peut également conduire à l’absence de proposition d’intervention complémentaire lorsque la situation ne nécessite pas ou ne permet pas un accompagnement adapté.
        </p>
        <p>
          La présente lettre n’emporte aucun engagement réciproque quant à la conclusion d’une mission ultérieure. Toute intervention complémentaire fera, le cas échéant, l’objet d’un accord distinct entre les parties.
        </p>

        <h2>6. Limites de la phase de cadrage</h2>
        <p>
          La présente phase constitue une étape préliminaire d’analyse et de compréhension de la situation du Client.
        </p>
        <p>
          Elle ne constitue ni une mission complète d’accompagnement, ni un mandat de représentation, ni une prestation réglementée de nature juridique, fiscale ou comptable, et n’emporte aucune garantie de résultat.
        </p>
        <p>
          FixBiz intervient exclusivement dans le cadre d’une obligation de moyens.
        </p>

        <h2>7. Confidentialité</h2>
        <p>
          Les informations transmises par le Client sont strictement confidentielles. FixBiz s’engage à ne pas les communiquer à des tiers, sauf accord du Client ou nécessité liée à l’étude du dossier.
        </p>
        <p>
          Cette obligation de confidentialité survivra à la fin des échanges entre les parties.
        </p>

        <h2>8. Conditions financières</h2>
        <p>
          La signature de la présente lettre de cadrage n’entraîne, à elle seule, aucune facturation ni engagement financier pour le Client.
        </p>
        <p>
          La phase de cadrage a pour objet de permettre une première compréhension de la situation exposée et l’évaluation d’un éventuel accompagnement.
        </p>
        <p>
          Si une analyse approfondie ou une intervention complémentaire apparaît pertinente, les modalités applicables feront, le cas échéant, l’objet d’une proposition distincte préalablement présentée au Client.
        </p>
        <p>
          Aucune prestation complémentaire payante ne sera engagée sans accord exprès du Client.
        </p>

        <h2>9. Validation</h2>
        <p>Avant validation de la présente lettre, le Client confirme expressément :</p>

        <ul>
          <li>Être habilité à engager la structure concernée ;</li>
          <li>Souhaiter ouvrir une phase de cadrage initial avec FixBiz ;</li>
          <li>Comprendre que cette phase constitue une étape préliminaire d’analyse et ne correspond pas à une mission complète d’accompagnement ;</li>
          <li>Accepter de transmettre les informations ou documents nécessaires à la compréhension de sa situation ;</li>
          <li>Reconnaître que les informations communiquées sont exactes à sa connaissance ;</li>
          <li>Comprendre qu’aucune intervention complémentaire ne sera engagée sans accord distinct entre les parties ;</li>
          <li>Avoir pris connaissance des conditions prévues par la présente lettre de cadrage.</li>
        </ul>

        <p><strong>Date de validation :</strong><br>${dateSignature}</p>
        <p><strong>Adresse IP :</strong><br>${escapeHtml(ip)}</p>
        <p><strong>Navigateur :</strong><br>${escapeHtml(userAgent)}</p>

        <table style="width:100%;border-collapse:collapse;margin-top:24px;">
          <tr>
            <td style="width:50%;vertical-align:top;border:1px solid #dbe4ee;padding:14px;">
              <strong>Pour FixBiz</strong><br>
              Jean-Philippe Schneider<br>
              Fondateur FixBiz<br><br>

              Signature :<br><br>
              <img
                src="https://fixbiz.fr/signature-fixbiz.png"
                style="max-width:220px;"
              />
            </td>

            <td style="width:50%;vertical-align:top;border:1px solid #dbe4ee;padding:14px;">
              <strong>Pour ${escapeHtml(signataire)}</strong><br>
              ${escapeHtml(fonction)}<br>
              Agissant pour :<br>
              ${escapeHtml(societe)}<br><br>

              Nom du signataire :<br>
              <strong>${escapeHtml(signataire)}</strong><br><br>

              Signature manuscrite du client :<br>
              Voir pièce jointe <strong>signature-client.png</strong>.
            </td>
          </tr>
        </table>

        <p style="font-size:12px;color:#6b7280;margin-top:24px;">
          La présente lettre est validée électroniquement par le Client à la date indiquée ci-dessus.
        </p>
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
          htmlContent: lettreHtml,
          attachment: [
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