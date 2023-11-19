import { For, Show } from "solid-js";

interface Props {
    children: string;
}

const COLOR_CODES: { [key: string]: string } = {
    0: "#000",
    1: "#00A",
    2: "#0A0",
    3: "#0AA",
    4: "#A00",
    5: "#A0A",
    6: "#FA0",
    7: "#AAA",
    8: "#555",
    9: "#55F",
    a: "#5F5",
    b: "#5FF",
    c: "#F55",
    d: "#F5F",
    e: "#FF5",
    f: "#FFF",
};

export default function ColoredText(props: Props) {
    return (
        <>
            <For each={props.children.split("§")}>
                {(part, index) => (
                    <Show when={index() > 0} fallback={<span>{part}</span>}>
                        <span style={{ color: COLOR_CODES[part[0]] }}>{part.substring(1)}</span>
                    </Show>
                )}
            </For>
        </>
    );
}
