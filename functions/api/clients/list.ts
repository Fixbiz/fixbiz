export const onRequestGet = async (context) => {
  try {
    const list = await context.env.CLIENTS.list();

    const clients = [];

    for (const key of list.keys) {
      const value = await context.env.CLIENTS.get(key.name, "json");

      if (value) {
        clients.push({
          id: key.name,
          societe: value.societe || "",
          representant: value.representant || "",
          email: value.email || "",
        });
      }
    }

    return new Response(JSON.stringify({ clients }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Erreur chargement clients",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};