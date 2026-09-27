import type { Config, Context } from "@netlify/functions";


const notify = async (message: string) => {
    
    const body ={
        content: message,
        embeds: [{
            image: {
                url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDlvM29xc2Z3ZHQ4NXpucXJqdm45bWRmbzByYWR4dHFwc2hka2g3YyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/du3J3cXyzhj75IOgvA/giphy.gif"
            }
        }]
    }

    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL ?? "";

    const response = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        console.log(`Failed to send message to Discord webhook: ${response.statusText}`);
        return false;
    }

    return true;
}

const onStart = (payload: any):string => {
        const {action, sender, repository, starred_at } = payload;
        return `User ${sender.login} ${action} starred the repository ${repository.full_name}`;
        
    }

const onIssues = (payload: any):string => {
    const {action, sender, repository, issue} = payload;
    return `User ${sender.login} ${action} issue #${issue.number} in repository ${repository.full_name}`;
}

const hexToBytes = (hex: string): Uint8Array<ArrayBuffer> => {
        let len = hex.length / 2;
        let bytes = new Uint8Array(new ArrayBuffer(len));

        let index = 0;
        for (let i = 0; i < hex.length; i += 2) {
            let c = hex.slice(i, i + 2);
            let b = parseInt(c, 16);
            bytes[index] = b;
            index += 1;
        }

        return bytes;
    }

const verifySignature = async (header: string, payload: string) => {
    const encoder = new TextEncoder();
    const secret = process.env.SECRET_TOKEN_WEBHOOK ?? "";

    try{

        let parts = header.split("=");
        let sigHex = parts[1] ?? "";

        let algorithm = { name: "HMAC", hash: { name: "SHA-256" } };

        let keyBytes = encoder.encode(secret);
        let extractable = false;
        let key = await crypto.subtle.importKey(
            "raw",
            keyBytes,
            algorithm,
            extractable,
            ["sign", "verify"],
        );

        let sigBytes = hexToBytes(sigHex);
        let dataBytes = encoder.encode(payload);
        let equal = await crypto.subtle.verify(
            algorithm.name,
            key,
            sigBytes,
            dataBytes,
        );

        return equal;
    }catch(err){
        console.error(err);
        return false;
    }
}

const response = (message: string,status: number) => {
    return new Response(JSON.stringify({message}), {
        headers: {
            "content-type": "application/json"
        },
        status: status
    });
} 

export default async (req: Request, context: Context) => {

    const gitHubEvent = req.headers.get('x-github-event') ?? 'unknown';
    const xHubSignature= `${req.headers.get('x-hub-signature-256')}`;
    const payload = await req.json();

    const isValid = await verifySignature(xHubSignature, JSON.stringify(payload) );

    let message: string;    

    if (!isValid) {
        message = "Invalid signature"
        console.log(message);
        return response(message, 401);
    }


    switch (gitHubEvent) {
        case 'star':
            message = onStart(payload);
            break;
        case 'issues':
            message = onIssues(payload);
            break;
        default:
            message = `Unhandled GitHub event: ${gitHubEvent}`;
            break;
    }


    const notifyResult = await notify(message);

    let messageResult = "Notification sent successfully!";
    if (!notifyResult) {
        messageResult = "Failed to send notification.";
    }
    console.log(messageResult);
    return response(messageResult, 200);
};

export const config: Config = {
    path: "/github-discord",
};
