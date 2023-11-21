import { For, Show, createEffect, createResource, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import Button from "../Button";
import Icon from "../Icon/Icon";
import ModalContainer from "../components/ModalContainer";
import { db } from "../firestore";

import { collection, getDocs } from "firebase/firestore";
import Spinner from "../components/Spinner/Spinner";

type CustomProfile = {
    title: string;
    description: string;
    nickname: string;
    [key: string]: string;
};

interface Props {
    identifier: string;
    selectProfile: (profile: CustomProfile) => void;
}

function ProfileList(props: Props) {
    const [profiles] = createResource(async () => {
        const snapshot = await getDocs(collection(db, props.identifier));
        return snapshot.docs.map(profile => profile.data() as CustomProfile);
    });
    return (
        <div class="h-full w-full">
            <Show
                when={!profiles.loading}
                fallback={
                    <div class="flex h-full w-full items-center justify-center">
                        <Spinner class="text-3xl" />
                    </div>
                }>
                <For each={profiles()}>
                    {profile => (
                        <div class="mb-2 flex border-2 border-primary-400 p-2">
                            <div class="grow">
                                <p class="text-xl text-primary-400">{profile.title}</p>
                                <p class="text-sm text-primary-400">by {profile.nickname}</p>
                                <p class="text-lg text-primary-400">{profile.description}</p>
                            </div>
                            <Button onClick={() => props.selectProfile(profile)}>
                                <Icon class="text-4xl" icon="download" />
                            </Button>
                        </div>
                    )}
                </For>
            </Show>
        </div>
    );
}

export default function CustomProfiles(props: Props) {
    const [active, setActive] = createSignal(false);

    createEffect(() => {});

    return (
        <>
            <Button onClick={() => setActive(true)}>
                <Icon class="mr-2" icon="public" />
                <span class="text-primary-400">Custom profiles</span>
            </Button>
            <Show when={active()}>
                <Portal>
                    <ModalContainer>
                        <button class="absolute right-2 top-2 text-primary-400" onClick={() => setActive(false)}>
                            <Icon icon="close" class="text-4xl" />
                        </button>
                        <span class="mb-2 block w-full text-center text-2xl text-primary-400">Custom Profiles</span>
                        <div class="h-96 overflow-y-auto border-2 border-primary-600 p-2">
                            <ProfileList
                                identifier={props.identifier}
                                selectProfile={profile => {
                                    setActive(false);
                                    props.selectProfile(profile);
                                }}
                            />
                        </div>
                    </ModalContainer>
                </Portal>
            </Show>
        </>
    );
}
