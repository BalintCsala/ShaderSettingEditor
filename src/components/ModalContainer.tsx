import { JSX } from "solid-js/jsx-runtime";
import { twMerge } from "tailwind-merge";

interface Props {
    children: JSX.Element;
    class?: string;
}

export default function ModalContainer(props: Props) {
    return (
        <div class="absolute left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
            <div class={twMerge("relative h-min w-[30em] border-2 border-primary-600 bg-gray-950 p-4", props.class)}>{props.children}</div>
        </div>
    );
}
