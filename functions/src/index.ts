// eslint-disable-next-line import/no-unresolved
import { defineString } from "firebase-functions/params";
// eslint-disable-next-line import/no-unresolved
import { onRequest } from "firebase-functions/v2/https";

const tokenRequestURL = defineString("TOKEN_REQUEST_URL");
const clientSecret = defineString("CLIENT_SECRET");
const clientID = defineString("CLIENT_ID");
const redirectURI = defineString("REDIRECT_URI");
const appURI = defineString("APP_URI");

export const authorize = onRequest(async (request, response) => {
    const code = request.query.code as string;
    if (!code) {
        response.redirect(
            appURI.value() + "?error=missing_code&description=Missing code",
        );
        return;
    }

    const res = await fetch(tokenRequestURL.value(), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: clientSecret.value(),
        },
        body: new URLSearchParams({
            code,
            client_id: clientID.value(),
            redirect_uri: redirectURI.value(),
            grant_type: "authorization_code",
        }),
    }).then((res) => res.json());

    if (res.error) {
        response.redirect(
            appURI.value() +
                `?error=${res.error}&description=${res.description}`,
        );
        return;
    }

    const token = res.access_token;
    const user = await fetch("https://api.modrinth.com/v2/user", {
        method: "GET",
        headers: {
            Authorization: token,
        },
    }).then((res) => res.json());

    if (user.error) {
        response.redirect(
            appURI.value() +
                `?error=${user.error}&description=${user.description}`,
        );
        return;
    }

    response.redirect(appURI.value() + "?uid=" + user.id);
});
