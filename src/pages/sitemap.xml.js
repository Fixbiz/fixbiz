const site = "https://fixbiz.fr";

const pages = [
  "/",
  "/blog/",
  "/contact/",
  "/faq/",
  "/nos-services/",
  "/prendre-rdv/",
  "/mentions-legales/",
  "/conditions-generales-de-service/",
  "/politique-de-confidentialite/",
  "/politique-des-cookies/",
  "/protection-donnees-personnelles/",

  "/blog/aides-entreprises-difficulte/",
  "/blog/ameliorer-performance-vente/",
  "/blog/avant-situation-critique/",
  "/blog/banque-refuse-credit/",
  "/blog/banques-voient-difficultes/",
  "/blog/charge-mentale-dirigeant/",
  "/blog/chiffre-affaires-sans-profit/",
  "/blog/cout-faillites-entreprises-france/",
  "/blog/croissance-non-rentable/",
  "/blog/decouvert-bancaire/",
  "/blog/decouvert-bancaire-permanent/",
  "/blog/demander-aide-entreprise/",
  "/blog/difficultes-invisibles-pme/",
  "/blog/dirigeants-attendent-trop/",
  "/blog/entrepreneurs-travaillent-trop/",
  "/blog/entreprise-depend-dirigeant/",
  "/blog/entreprise-effondrement-progressif/",
  "/blog/entreprise-encore-redressable/",
  "/blog/entreprise-reellement-rentable/",
  "/blog/entreprise-sous-pression/",
  "/blog/erreurs-entreprise-difficulte/",
  "/blog/erreurs-pilotage-pme/",
  "/blog/eviter-depot-bilan/",
  "/blog/eviter-liquidation-judiciaire/",
  "/blog/guide-complet-pme-difficulte/",
  "/blog/liquidation-judiciaire-entreprise/",
  "/blog/perte-controle-entreprise/",
  "/blog/perte-rentabilite-pme/",
  "/blog/pme-devient-ingerable/",
  "/blog/pme-grandir-sereinement/",
  "/blog/pme-pas-rentable/",
  "/blog/pme-se-fragilise-progressivement/",
  "/blog/pme-sous-tension-financiere/",
  "/blog/pme-travaillent-beaucoup/",
  "/blog/premiers-reflexes-pme/",
  "/blog/reprendre-controle-pme/",
  "/blog/retards-paiement-clients/",
  "/blog/signes-entreprise-difficulte/",
  "/blog/travailler-plus-ne-sauve-pas/",
  "/blog/tresorerie-critique/",
  "/blog/urgences-permanentes-pme/"
];

export async function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${site}${page}</loc>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}