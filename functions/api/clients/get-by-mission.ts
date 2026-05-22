export const onRequestGet =
async(context)=>{

const url =
new URL(
context.request.url
);

const missionId =
url.searchParams.get("id");

const mission =
await context.env.MISSIONS.get(
missionId,
"json"
);

if(!mission){

return Response.json(
{error:"mission absente"},
{status:404}
);

}

const client =
await context.env.CLIENTS.get(
mission.clientId,
"json"
);

return Response.json(
client
);

};