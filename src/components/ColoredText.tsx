import { JSX, createEffect, createSignal } from "solid-js";

interface Props {
    children: string;
}

type Style = Pick<
    JSX.CSSProperties,
    "color" | "font-weight" | "text-decoration" | "font-style"
>;

const FORMAT_CODES: { [key: string]: Style } = {
    0: { color: "#000" },
    1: { color: "#00A" },
    2: { color: "#0A0" },
    3: { color: "#0AA" },
    4: { color: "#A00" },
    5: { color: "#A0A" },
    6: { color: "#FA0" },
    7: { color: "#AAA" },
    8: { color: "#555" },
    9: { color: "#55F" },
    a: { color: "#5F5" },
    b: { color: "#5FF" },
    c: { color: "#F55" },
    d: { color: "#F5F" },
    e: { color: "#FF5" },
    f: { color: "#FFF" },
    l: { "font-weight": "bold" },
    n: { "text-decoration": "underline" },
    o: { "font-style": "italic" },
    m: { "text-decoration": "line-through" },
    r: {
        color: "",
        "font-weight": "normal",
        "text-decoration": "none",
        "font-style": "normal",
    },
};

export default function ColoredText(props: Props) {
    const [parts, setParts] = createSignal<JSX.Element[]>([]);

    createEffect(() => {
        let style: Style = {};
        setParts(
            (props.children + "")
                .split(/(?=§)|(?<=§.)/g)
                .map((raw) => {
                    if (raw.startsWith("§")) {
                        style = { ...style, ...FORMAT_CODES[raw[1]] };
                        return null;
                    }
                    return <span style={{ ...style }}>{raw}</span>;
                })
                .filter((part) => part !== null) as JSX.Element[],
        );
    });

    return <>{parts()}</>;
}
