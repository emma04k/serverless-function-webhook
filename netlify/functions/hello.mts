import type { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
    return new Response(JSON.stringify({ message: "Hello, world!" }), {
        headers: {
            "content-type": "application/json"
        },
        status: 200
    });
};

export const config: Config = {
    path: "/hello",
};
