import { JSX } from "solid-js/jsx-runtime";
import { twMerge } from "tailwind-merge";

interface Props {
    children: JSX.Element;
    onClick: (e: MouseEvent) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onBlur?: () => void;
    class?: string;
}

export default function Button(props: Props) {
    return (
        <button
            onContextMenu={e => props.onClick(e)}
            onClick={e => props.onClick(e)}
            onMouseEnter={() => props.onMouseEnter?.()}
            onMouseLeave={() => props.onMouseLeave?.()}
            onBlur={() => props.onBlur?.()}
            class={twMerge(
                "border-2 border-emerald-600 bg-emerald-950 p-2 text-lg text-emerald-600 duration-75 transition-colors hover:bg-emerald-900 active:bg-emerald-800",
                props.class ?? "",
            )}>
            {props.children}
        </button>
    );
}
