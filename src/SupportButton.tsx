import { createSignal, Show } from "solid-js";
import Button from "./components/Button";
import Icon from "./Icon/Icon";
import ModalContainer from "./components/ModalContainer";

import PatreonLogo from "./assets/patreon.svg";
import KofiLogo from "./assets/kofi.png";
import PaypalLogo from "./assets/paypal.png";

export default function SupportButton() {
    const [active, setActive] = createSignal(false);
    return (
        <>
            <Button onClick={() => setActive(true)}>
                <Icon icon="support" class="mr-2" />
                Support the editor
            </Button>
            <Show when={active()}>
                <ModalContainer onClose={() => setActive(false)}>
                    <span class="mb-2 block w-full text-center text-3xl text-primary-400">Support options</span>
                    <p class="mb-6 w-full text-center text-xl text-primary-400">We accept donations through the following services:</p>
                    <div class="flex w-full justify-around">
                        <a
                            href="https://patreon.com/balintshaders"
                            target="_blank"
                            class="w-1/4 border-2 border-primary-600 bg-primary-950 p-2 transition-colors duration-75 hover:bg-primary-900">
                            <div class="flex flex-col items-center">
                                <img class="h-12" src={PatreonLogo} alt="Patreon logo" />
                                <span class="text-2xl text-primary-400">Patreon</span>
                            </div>
                        </a>
                        <a
                            class="w-1/4 border-2 border-primary-600 bg-primary-950 p-2 transition-colors duration-75 hover:bg-primary-900"
                            href="https://ko-fi.com/balintcsala"
                            target="_blank">
                            <div class="flex flex-col items-center">
                                <img class="h-12" src={KofiLogo} alt="Ko-fi logo" />
                                <span class="text-2xl text-primary-400">Ko-fi</span>
                            </div>
                        </a>
                        <a
                            class="w-1/4 border-2 border-primary-600 bg-primary-950 p-2 transition-colors duration-75 hover:bg-primary-900"
                            href="https://www.paypal.com/donate/?hosted_button_id=9CJYN7ETGZJPS"
                            target="_blank">
                            <div class="flex flex-col items-center">
                                <img class="h-12" src={PaypalLogo} alt="PayPal logo" />
                                <span class="text-2xl text-primary-400">PayPal</span>
                            </div>
                        </a>
                    </div>
                    <p class="mt-6 w-full text-center text-primary-400">All donations go towards development and upkeep costs.</p>
                </ModalContainer>
            </Show>
        </>
    );
}
