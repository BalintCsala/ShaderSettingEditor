// eslint-disable-next-line import/no-unresolved
import * as admin from "firebase-admin";
// eslint-disable-next-line import/no-unresolved
import { getAuth } from "firebase-admin/auth";
// eslint-disable-next-line import/no-unresolved
import { defineSecret, defineString } from "firebase-functions/params";
// eslint-disable-next-line import/no-unresolved
import { onRequest } from "firebase-functions/v2/https";

const tokenRequestURL = defineString("TOKEN_REQUEST_URL");
const clientSecret = defineSecret("CLIENT_SECRET");
const clientID = defineString("CLIENT_ID");
const redirectURI = defineString("REDIRECT_URI");
const appURI = defineString("APP_URI");

admin.initializeApp();

export const authorize = onRequest(
    { secrets: ["CLIENT_SECRET"] },
    async (request, response) => {
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

        const customToken = await getAuth().createCustomToken(user.id);

        response.redirect(appURI.value() + "?token=" + customToken);
    },
);
