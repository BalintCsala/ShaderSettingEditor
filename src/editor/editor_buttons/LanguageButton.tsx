import { For, Show, createSignal } from "solid-js";
import Icon from "../../components/Icon";
import Button from "../../components/Button";
import { Langs } from "../languages";
import ModalContainer from "../../components/ModalContainer";
import { Setter } from "solid-js";

interface Props {
    langs: Langs;
    currentLangName: string;
    setCurrentLangName: Setter<string>;
}

export default function LanguageButton(props: Props) {
    const [active, setActive] = createSignal(false);
    return (
        <>
            <Button
                class="flex grow basis-1 flex-col items-center md:grow-0 md:flex-row"
                onClick={() => setActive(true)}
            >
                <Icon class="text-6xl sm:text-3xl md:mr-2" icon="language" />
                <span class="hidden whitespace-nowrap sm:inline">
                    {props.currentLangName.toUpperCase()}
                </span>
            </Button>
            <Show when={active()}>
                <ModalContainer
                    class="flex h-1/2 flex-col"
                    onClose={() => setActive(false)}
                >
                    <span class="mb-2 block w-full text-center text-2xl text-primary-400">
                        Languages
                    </span>
                    <span class="mb-2 text-primary-400">
                        These only apply to the shader settings, the website is
                        currently only available in english.
                    </span>
                    <div class="flex grow flex-col gap-2 overflow-y-auto border-2 border-primary-600 p-2">
                        <For each={Object.keys(props.langs)}>
                            {(lang) => (
                                <Button
                                    onClick={() => {
                                        setActive(false);
                                        return props.setCurrentLangName(lang);
                                    }}
                                >
                                    {lang.toUpperCase()}
                                </Button>
                            )}
                        </For>
                    </div>
                </ModalContainer>
            </Show>
        </>
    );
}
