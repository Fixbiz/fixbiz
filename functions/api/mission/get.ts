export const onRequestGet =
async (context)=>{

const url =
new URL(
context.request.url
);

const id =
url.searchParams.get(
"id"
);

if(!id){

return new Response(
"mission absente",
{status:400}
);

}

const mission =
await context.env.MISSIONS.get(
id,
"json"
);

return Response.json(
mission
);

};