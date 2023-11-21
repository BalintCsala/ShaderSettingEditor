import { For, Show } from "solid-js";
import { Lang } from "./languages";

interface Props {
    screenStack: string[];
    setScreenStack: (stack: string[]) => void;
    lang: Lang;
}

export default function ScreenStack(props: Props) {
    return (
        <div class="flex grow">
            <For each={props.screenStack}>
                {(screenName, index) => (
                    <button
                        class={`relative flex justify-center border-2 border-r-0 border-primary-600 p-2 ${
                            index() !== 0 ? "ml-2 border-l-transparent pl-8" : ""
                        }`}
                        onClick={() => props.setScreenStack(props.screenStack.slice(0, index() + 1))}>
                        <Show when={index() != 0}>
                            <svg viewBox="0 0 55 100" class="absolute -top-0.5 left-0 h-[calc(100%+0.25rem)]">
                                <polyline class="stroke-primary-600" points="0,0 50,50 0,100" stroke-width="0.25rem" stroke-linecap="round" fill="none" />
                            </svg>
                        </Show>
                        <span class="text-lg text-primary-400">
                            {index() < props.screenStack.length - 3 ? "..." : props.lang.screen[screenName]?.text || screenName}
                        </span>
                        <svg viewBox="0 0 55 100" class="absolute -top-0.5 left-full h-[calc(100%+0.25rem)]">
                            <polyline class="stroke-primary-600" points="0,0 50,50 0,100" stroke-width="0.25rem" stroke-linecap="round" fill="none" />
                        </svg>
                    </button>
                )}
            </For>
        </div>
    );
}
