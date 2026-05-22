export const onRequestPost = async (context) => {
  try {
    const form = await context.request.formData();

    const mission = {
      id: crypto.randomUUID(),
      clientId: String(form.get("clientId") || "").trim(),
      pack: String(form.get("pack") || "").trim(),
      objet: String(form.get("objet") || "").trim(),
      duree: String(form.get("duree") || "").trim(),
      honoraires: String(form.get("honoraires") || "").trim(),
      conditions: String(form.get("conditions") || "").trim(),
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    if (!mission.clientId) {
      return new Response("Référence client manquante", { status: 400 });
    }

    await context.env.MISSIONS.put(
      mission.id,
      JSON.stringify(mission)
    );

    const redirectUrl = new URL(`/mission/view?id=${mission.id}`, context.request.url);

    return Response.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Erreur création mission",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};