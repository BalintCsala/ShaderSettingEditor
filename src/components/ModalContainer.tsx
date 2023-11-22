import { JSX } from "solid-js/jsx-runtime";
import { Portal } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import Icon from "./Icon";

interface Props {
    children: JSX.Element;
    class?: string;
    onClose: () => void;
}

export default function ModalContainer(props: Props) {
    return (
        <Portal>
            <div class="absolute left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
                <div
                    class={twMerge(
                        "relative h-min w-[30em] border-2 border-primary-600 bg-gray-950 p-4",
                        props.class,
                    )}>
                    <button
                        class="absolute right-2 top-2 text-primary-400"
                        onClick={() => props.onClose()}>
                        <Icon
                            icon="close"
                            class="text-4xl"
                        />
                    </button>
                    {props.children}
                </div>
            </div>
        </Portal>
    );
}
