import { createSignal, Show } from "solid-js";
import Button from "./components/Button";
import Link from "./components/Link";
import ModalContainer from "./components/ModalContainer";
import Icon from "./components/Icon";

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
                        ones) without any legal issues.
                    </p>
                    <p class="my-4 text-primary-400">
                        If you don't know where to start with a given shader and
                        the profile browser is enabled (if you see a button
                        titled "Browse profiles" it is), you can check out the
                        profiles other people made. You can even edit them and
                        post the result online as well.
                    </p>
                    <p class="my-4 text-primary-400">
                        If you find a bug in the website, report it on my{" "}
                        <Link url="https://github.com/BalintCsala/ShaderSettingEditor/issues">
                            github page
                        </Link>
                        .
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
