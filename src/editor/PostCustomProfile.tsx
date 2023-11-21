import { AuthProvider, FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Match, Show, Switch, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import Button from "../Button";
import Icon from "../Icon/Icon";
import ModalContainer from "../components/ModalContainer";
import { auth, db } from "../firestore";

import FacebookLogo from "../assets/facebook.svg";
import GithubLogo from "../assets/github.svg";
import GoogleLogo from "../assets/google.svg";

import { addDoc, collection } from "firebase/firestore";
import { Options } from "./options";

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
    const facebookProvider = new FacebookAuthProvider();
    const githubProvider = new GithubAuthProvider();

    const [state, setState] = createSignal(PostState.Inactive);
    const [nickname, setNickname] = createSignal("");
    const [title, setTitle] = createSignal("");
    const [description, setDescription] = createSignal("");
    const [uid, setUID] = createSignal("");

    const authenticate = (provider: AuthProvider) => {
        signInWithPopup(auth, provider).then(result => {
            setUID(result.user.uid);
            setState(PostState.Disclaimer);
        });
    };

    return (
        <>
            <Button onClick={() => setState(PostState.Setup)}>
                <Icon icon="upload" class="mr-2" />
                <span>Upload custom profile</span>
            </Button>
            <Show when={state() !== PostState.Inactive}>
                <Portal>
                    <ModalContainer>
                        <button class="absolute right-2 top-2 text-primary-400" onClick={() => setState(PostState.Inactive)}>
                            <Icon icon="close" class="text-4xl" />
                        </button>
                        <span class="mb-4 block w-full text-center text-2xl text-primary-400">Post custom profile</span>
                        <Switch>
                            <Match when={state() === PostState.Setup}>
                                <div class="flex flex-col items-center gap-2">
                                    <input
                                        class="w-full bg-primary-950 p-1 text-white"
                                        type="text"
                                        value={nickname()}
                                        maxLength={20}
                                        onInput={e => setNickname(e.currentTarget.value)}
                                        placeholder="Your nickname (max 20 chars)"
                                    />
                                    <input
                                        class="w-full bg-primary-950 p-1 text-white"
                                        type="text"
                                        value={title()}
                                        maxLength={40}
                                        onInput={e => setTitle(e.currentTarget.value)}
                                        placeholder="Title (max 40 chars)"
                                    />
                                    <textarea
                                        rows={3}
                                        class="w-full resize-none bg-primary-950 p-1 text-white"
                                        value={description()}
                                        maxLength={150}
                                        onInput={e => setDescription(e.currentTarget.value)}
                                        placeholder="A short description of your profile (max 150 chars)"
                                    />
                                    <span class="text-center text-sm text-primary-400">
                                        If you edited the profile of someone else, it's a good idea to credit them here.
                                    </span>
                                    <Button
                                        onClick={() => {
                                            if (nickname().length === 0 || title().length === 0 || description().length === 0) return;
                                            setState(PostState.Authentication);
                                        }}>
                                        Next
                                    </Button>
                                </div>
                            </Match>
                            <Match when={state() === PostState.Authentication}>
                                <p class="text-lg text-primary-400">
                                    To post a custom profile, you'll have to authenticate first. This is handled by Firebase, we do not ever receive your
                                    password and only store a unique user ID for spam regulation.
                                </p>
                                <div class="mt-4 flex flex-row justify-center">
                                    <button onClick={() => authenticate(googleProvider)} class="m-2">
                                        <img alt="Google login" class="h-12 w-12" src={GoogleLogo} />
                                    </button>
                                    <button onClick={() => authenticate(facebookProvider)} class="m-2">
                                        <img alt="Facebook login" class="h-12 w-12" src={FacebookLogo} />
                                    </button>
                                    <button onClick={() => authenticate(githubProvider)} class="m-2">
                                        <img alt="Github login" class="h-12 w-12" src={GithubLogo} />
                                    </button>
                                </div>
                            </Match>
                            <Match when={state() === PostState.Disclaimer}>
                                <p class="mb-4 text-lg text-primary-400">by using this service you agree to the following rules:</p>
                                <ul class="list-dashed">
                                    <li class="text-lg text-primary-400">
                                        Neither the content nor your nickname and the title and description of your custom profile contains any profanity, hate
                                        speech toward any group or expression of controversial opinions.
                                    </li>
                                    <li class="text-lg text-primary-400">
                                        Your submission doesn't circumvent any of the in-place safety measures against spam.
                                    </li>
                                </ul>
                                <p class="my-4 text-lg text-primary-400">
                                    If you break these rules, your submissions will be removed and you will be permanently banned from the service. We keep the
                                    right to the final say on what counts as rule-breaking.
                                </p>
                                <div class="flex flex-col items-center">
                                    <Button
                                        onClick={() => {
                                            const profileColl = collection(db, props.identifier);
                                            const uidCollection = collection(db, "userids");

                                            const profile: { [key: string]: string } = {};
                                            Object.entries(props.options).forEach(([name, option]) => {
                                                switch (option.type) {
                                                    case "boolean": {
                                                        profile[name] = option.value ? "true" : "false";
                                                        break;
                                                    }
                                                    case "text": {
                                                        profile[name] = option.value;
                                                        break;
                                                    }
                                                }
                                            });

                                            (async () => {
                                                const data = await addDoc(profileColl, {
                                                    title: title(),
                                                    description: description(),
                                                    nickname: nickname(),
                                                    ...profile,
                                                });
                                                await addDoc(uidCollection, {
                                                    uid: uid(),
                                                    path: data.path,
                                                });
                                                setState(PostState.Success);
                                            })();
                                        }}>
                                        Accept and post
                                    </Button>
                                </div>
                            </Match>
                            <Match when={state() === PostState.Success}>
                                <p class="mb-4 text-lg text-primary-400">Successfully uploaded the custom profile</p>
                                <div class="flex flex-col items-center">
                                    <Button onClick={() => setState(PostState.Inactive)}>Close</Button>
                                </div>
                            </Match>
                        </Switch>
                    </ModalContainer>
                </Portal>
            </Show>
        </>
    );
}
