import { createSignal, Show } from "solid-js";
import Button from "./components/Button";
import Link from "./components/Link";
import ModalContainer from "./components/ModalContainer";
import Icon from "./Icon/Icon";

export default function AboutButton() {
    const [active, setActive] = createSignal(false);

    return (
        <>
            <Button onClick={() => setActive(true)}>
                <Icon icon="info" />
                <span class="ml-2">About</span>
            </Button>
            <Show when={active()}>
                <ModalContainer onClose={() => setActive(false)}>
                    <span class="block w-full text-center text-xl text-primary-400">
                        About
                    </span>
                    <p class="my-4 text-primary-400">
                        This website is meant to be an addition to the Optifine
                        and Iris shader option system with various extra
                        features, such as actual color selectors.
                    </p>
                    <p class="my-4 text-primary-400">
                        You can share the generated setting files (the .txt
                        ones), but the edited shaders (when you export custom
                        profiles) are still under copyright.
                    </p>
                    <p class="my-4 text-primary-400">
                        If you find a bug in the website, report it on my{" "}
                        <Link url="#">github page</Link>. If the issue you
                        noticed is related to the generated setting file or
                        shader, make sure it's actually coming from this site. A
                        good (but still imperfect) rule of thumb is if the
                        unedited shader gets loaded into the game successfully,
                        but the edited one doesn't.
                    </p>
                    <p class="mt-4 text-primary-400">Contacts:</p>
                    <ul class="list-dashed">
                        <li>
                            <span class="text-primary-400">Github: </span>
                            <Link url="https://github.com/BalintCsala">
                                BalintCsala
                            </Link>
                        </li>
                        <li>
                            <span class="text-primary-400">
                                Discord: balintcsala
                            </span>
                        </li>
                    </ul>
                </ModalContainer>
            </Show>
        </>
    );
}
