import { For, Show, createResource } from "solid-js";
import { db } from "../firestore";
import { collection, getDocs } from "firebase/firestore";
import Spinner from "../components/Spinner/Spinner";
import { Props, CustomProfile } from "./CustomProfiles";

export function ProfileList(props: Props) {
    const [profiles] = createResource(async () => {
        const snapshot = await getDocs(collection(db, props.identifier));
        return snapshot.docs.map(profile => profile.data() as CustomProfile);
    });
    return (
        <div class="h-full w-full">
            <Show
                when={!profiles.loading || false}
                fallback={
                    <div class="flex h-full w-full items-center justify-center">
                        <Spinner />
                    </div>
                }>
                <For each={profiles()}>
                    {profile => (
                        <div class="border-2 border-primary-400">
                            <p class="text-xl text-primary-400">{profile.title}</p>
                            <p class="text-sm text-primary-400">{profile.description}</p>
                        </div>
                    )}
                </For>
            </Show>
        </div>
    );
}
