import {
    AuthProvider,
    GithubAuthProvider,
    GoogleAuthProvider,
    signInWithCustomToken,
    signInWithPopup,
} from "firebase/auth";
import { Match, Show, Switch, createSignal } from "solid-js";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import ModalContainer from "../../components/ModalContainer";
import { auth, db } from "../../firebase";

// @ts-expect-error This syntax is unsupported by tsc
import GithubLogo from "../../assets/github.svg?component-solid";
// @ts-expect-error This syntax is unsupported by tsc
import GoogleLogo from "../../assets/google.svg?component-solid";
// @ts-expect-error This syntax is unsupported by tsc
import ModrinthLogo from "../../assets/modrinth.svg?component-solid";

import { addDoc, collection } from "firebase/firestore";
import Spinner from "../../components/Spinner/Spinner";
import { Options } from "../options";

interface Props {
    identifier: string;
    options: Options;
}

enum PostState {
    Inactive,
    Setup,
    Authentication,
    Disclaimer,
    Success,
}

export default function PostCustomProfile(props: Props) {
    const googleProvider = new GoogleAuthProvider();
    const githubProvider = new GithubAuthProvider();

    const [state, setState] = createSignal(PostState.Inactive);
    const [nickname, setNickname] = createSignal("");
    const [title, setTitle] = createSignal("");
    const [description, setDescription] = createSignal("");
    const [uid, setUID] = createSignal("");
    const [authenticating, setAuthenticating] = createSignal(false);

    const authenticate = (provider: AuthProvider) => {
        setAuthenticating(true);
        signInWithPopup(auth, provider)
            .then((result) => {
                setUID(result.user.uid);
                setState(PostState.Disclaimer);
            })
            .catch(() => setAuthenticating(false));
    };

    const authenticateModrinth = () => {
        setAuthenticating(true);
        const clientID = import.meta.env.VITE_MODRINTH_CLIENT_ID as string;
        const redirectURI = import.meta.env.VITE_AUTH_REDIRECT_URI;
        const modrinthAuthURL = `https://modrinth.com/auth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&scope=USER_READ`;
        const popup = window.open(
            modrinthAuthURL,
            "_blank",
            "popup=yes,width=600,height=600",
        );

        const handler = (e: MessageEvent) => {
            if (!e.data.token) {
                return;
            }
            popup?.close();
            window.removeEventListener("message", handler);
            signInWithCustomToken(auth, e.data.token).then((result) => {
                setUID(result.user.uid);
                setState(PostState.Disclaimer);
                setAuthenticating(false);
            });
        };

        window.addEventListener("message", handler);
    };

    return (
        <>
            <Button
                class="flex grow basis-1 flex-col items-center md:grow-0 md:flex-row"
                onClick={() => setState(PostState.Setup)}
            >
                <Icon icon="upload" class="text-6xl sm:text-3xl md:mr-2" />
                <span class="whitespace-normal sm:inline md:whitespace-nowrap">
                    Upload profile
                </span>
            </Button>
            <Show when={state() !== PostState.Inactive}>
                <ModalContainer onClose={() => setState(PostState.Inactive)}>
                    <button
                        class="absolute right-2 top-2 text-primary-400"
                        onClick={() => setState(PostState.Inactive)}
                    >
                        <Icon icon="close" class="text-4xl" />
                    </button>
                    <span class="mb-4 block w-full text-center text-2xl text-primary-400">
                        Post custom profile
                    </span>
                    <Switch>
                        <Match when={state() === PostState.Setup}>
                            <div class="flex flex-col items-center gap-2">
                                <input
                                    class="w-full border-2 border-primary-600 bg-primary-950 p-1 text-white"
                                    type="text"
                                    value={nickname()}
                                    maxLength={20}
                                    onInput={(e) =>
                                        setNickname(e.currentTarget.value)
                                    }
                                    placeholder="Your nickname (max 20 chars)"
                                />
                                <input
                                    class="w-full border-2 border-primary-600 bg-primary-950 p-1 text-white"
                                    type="text"
                                    value={title()}
                                    maxLength={40}
                                    onInput={(e) =>
                                        setTitle(e.currentTarget.value)
                                    }
                                    placeholder="Title (max 40 chars)"
                                />
                                <textarea
                                    rows={3}
                                    class="w-full resize-none border-2 border-primary-600 bg-primary-950 p-1 text-white"
                                    value={description()}
                                    maxLength={150}
                                    onInput={(e) =>
                                        setDescription(e.currentTarget.value)
                                    }
                                    placeholder="A short description of your profile (max 150 chars)"
                                />
                                <span class="text-center text-sm text-primary-400">
                                    If you edited the profile of someone else,
                                    it's a good idea to credit them here.
                                </span>
                                <Button
                                    onClick={() => {
                                        if (
                                            nickname().length === 0 ||
                                            title().length === 0 ||
                                            description().length === 0
                                        )
                                            return;
                                        setState(PostState.Authentication);
                                    }}
                                >
                                    Next
                                </Button>
                            </div>
                        </Match>
                        <Match when={state() === PostState.Authentication}>
                            <Show
                                when={!authenticating()}
                                fallback={
                                    <div class="flex h-full w-full items-center justify-center">
                                        <Spinner />
                                    </div>
                                }
                            >
                                <p class="text-lg text-primary-400">
                                    To post a custom profile, you'll have to
                                    authenticate first. This is handled by the
                                    respective providers, we do not ever receive
                                    your password and only store a unique user
                                    ID for spam regulation. If you want to
                                    delete this information, contact us.
                                </p>
                                <div class="mt-4 flex flex-row justify-center">
                                    <button
                                        onClick={() =>
                                            authenticate(googleProvider)
                                        }
                                        class="m-2 transition-all hover:scale-125"
                                    >
                                        <GoogleLogo class="h-12 w-12 fill-primary-400" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            authenticate(githubProvider)
                                        }
                                        class="m-2 transition-all hover:scale-125"
                                    >
                                        <GithubLogo class="h-12 w-12 fill-primary-400" />
                                    </button>
                                    <button
                                        onClick={() => authenticateModrinth()}
                                        class="m-2 transition-all hover:scale-125"
                                    >
                                        <ModrinthLogo class="h-12 w-12 fill-primary-400" />
                                    </button>
                                </div>
                            </Show>
                        </Match>
                        <Match when={state() === PostState.Disclaimer}>
                            <p class="mb-4 text-lg text-primary-400">
                                By using this service you agree to the following
                                rules:
                            </p>
                            <ul class="list-dashed">
                                <li class="text-lg text-primary-400">
                                    Neither the content nor your nickname, the
                                    title and description of your custom profile
                                    contains any profanity, hate speech or
                                    discrimination toward any group or
                                    expression of controversial opinions.
                                </li>
                                <li class="text-lg text-primary-400">
                                    Your submission doesn't circumvent any of
                                    the in-place safety measures against spam.
                                </li>
                            </ul>
                            <p class="my-4 text-lg text-primary-400">
                                If you break these rules, your submissions will
                                be removed and you will be permanently banned
                                from the service. We keep the right to the final
                                say on what counts as rule-breaking.
                            </p>
                            <p class="my-4 text-lg text-primary-400">
                                By posting a custom profile you agree releasing
                                it in the public domain. Anybody will be able to
                                use, modify and share it for free.
                            </p>
                            <div class="flex flex-col items-center">
                                <Button
                                    onClick={() => {
                                        const profileColl = collection(
                                            db,
                                            props.identifier,
                                        );
                                        const uidCollection = collection(
                                            db,
                                            "userids",
                                        );

                                        const profile: {
                                            [key: string]: string;
                                        } = {};
                                        Object.entries(props.options).forEach(
                                            ([name, option]) => {
                                                switch (option.type) {
                                                    case "boolean": {
                                                        profile[name] =
                                                            option.value
                                                                ? "true"
                                                                : "false";
                                                        break;
                                                    }
                                                    case "text": {
                                                        profile[name] =
                                                            option.value;
                                                        break;
                                                    }
                                                }
                                            },
                                        );

                                        (async () => {
                                            const data = await addDoc(
                                                profileColl,
                                                {
                                                    title: title(),
                                                    description: description(),
                                                    nickname: nickname(),
                                                    ...profile,
                                                },
                                            );
                                            await addDoc(uidCollection, {
                                                uid: uid(),
                                                path: data.path,
                                            });
                                            setState(PostState.Success);
                                        })();
                                    }}
                                >
                                    Accept and post
                                </Button>
                            </div>
                        </Match>
                        <Match when={state() === PostState.Success}>
                            <p class="mb-4 text-lg text-primary-400">
                                Successfully uploaded the custom profile
                            </p>
                            <div class="flex flex-col items-center">
                                <Button
                                    onClick={() => setState(PostState.Inactive)}
                                >
                                    Close
                                </Button>
                            </div>
                        </Match>
                    </Switch>
                </ModalContainer>
            </Show>
        </>
    );
}
