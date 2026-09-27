import type { Config, Context } from "@netlify/functions";


export default async (req: Request, context: Context) => {

    const myEnvVar = process.env.MY_ENV_VAR;

    if (!myEnvVar) {
        throw "MY_ENV_VAR is not defined";
    }

    return new Response(JSON.stringify({ message: myEnvVar }), {
        headers: {
            "content-type": "application/json"
        },
        status: 200
    });
};

export const config: Config = {
    path: "/variables",
};