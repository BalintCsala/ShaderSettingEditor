import { createSignal, Show } from "solid-js";
import Button from "./Button";
import Icon from "./Icon/Icon";
import { Portal } from "solid-js/web";
import Link from "./Link";

export default function AboutButton() {
    const [active, setActive] = createSignal(false);

    return (
        <>
            <Button class="absolute right-0" onClick={() => setActive(true)}>
                <Icon icon="info" />
                <span class="ml-2">About</span>
            </Button>
            <Show when={active()}>
                <Portal>
                    <div class="absolute left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
                        <div class="relative h-min w-[30em] border-2 border-emerald-600 bg-gray-950 p-4">
                            <button class="absolute right-2 top-2" onClick={() => setActive(false)}>
                                <Icon icon="close" class="text-3xl text-emerald-600" />
                            </button>
                            <span class="block w-full text-center text-xl text-emerald-600">About</span>
                            <p class="my-4 text-emerald-600">
                                This website is meant to be an addition to the Optifine and Iris shader option system with various extra features, such as
                                actual color selectors.
                            </p>
                            <p class="my-4 text-emerald-600">
                                You can share the generated setting files (the .txt ones), but the edited shaders (when you export custom profiles) are still
                                under copyright.
                            </p>
                            <p class="my-4 text-emerald-600">
                                If you find a bug in the website, report it on my <Link url="#">github page</Link>. If the issue you noticed is related to the
                                generated setting file or shader, make sure it's related to this site. A good (but still imperfect) rule of thumb is if you the
                                unedited shader gets loaded into the game successfully, but the edited one doesn't.
                            </p>
                            <p class="mt-4 text-emerald-600">Contacts:</p>
                            <ul class="list-dashed">
                                <li>
                                    <span class="text-emerald-600">Github: </span>
                                    <Link url="https://github.com/BalintCsala">BalintCsala</Link>
                                </li>
                                <li>
                                    <span class="text-emerald-600">Discord: balintcsala</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Portal>
            </Show>
        </>
    );
}
