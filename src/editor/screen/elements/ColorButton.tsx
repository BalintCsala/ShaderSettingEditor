import { Setter, Show, createSignal } from "solid-js";
import ColorSelector from "../../../components/ColorSelector";
import { Lang } from "../../languages";
import { Options, TextOption } from "../../options";
import { ColorElement } from "../Screen";

export interface ColorOptionGroup {
    red: string;
    blue: string;
    green: string;
}

interface Props {
    lang: Lang;
    colorChanger: ColorElement;
    colorGroup: ColorOptionGroup;
    redOption: TextOption;
    greenOption: TextOption;
    blueOption: TextOption;
    resetTooltip: () => void;
    setOptions: Setter<Options>;
    setTooltip: Setter<string>;
}

export default function ColorButton(props: Props) {
    const [active, setActive] = createSignal(false);

    const getComponent = (comp: "red" | "green" | "blue") =>
        parseFloat(props[`${comp}Option`].value as string);

    const getColor = () =>
        `rgb(${(["red", "green", "blue"] as const).map(c =>
            Math.round(getComponent(c) * 255),
        )})`;

    const clickOutside = () => {
        if (!active()) return;
        setActive(false);
        document.removeEventListener("click", clickOutside);
    };

    return (
        <button
            class="relative flex h-full w-full cursor-pointer justify-center border-2 border-primary-600 p-2 text-lg"
            onMouseEnter={() => {
                const tooltip =
                    props.lang.option[props.colorChanger.name]?.description;
                if (tooltip) props.setTooltip(tooltip);
            }}
            onMouseLeave={() => props.resetTooltip()}
            onBlur={() => props.resetTooltip()}
            onClick={() => {
                setActive(true);
                document.addEventListener("click", clickOutside);
            }}
            style={{
                background: getColor(),
            }}>
            <Show when={active()}>
                <ColorSelector
                    color={{
                        red: getComponent("red"),
                        green: getComponent("green"),
                        blue: getComponent("blue"),
                    }}
                    class="absolute -right-0.5 top-full z-10 border-2 border-primary-600 bg-gray-900 p-4"
                    onChange={color => {
                        props.setOptions(options => ({
                            ...options,
                            [props.colorGroup.red]: {
                                ...props.redOption,
                                value: color.red.toString(),
                            },
                            [props.colorGroup.green]: {
                                ...props.greenOption,
                                value: color.green.toString(),
                            },
                            [props.colorGroup.blue]: {
                                ...props.blueOption,
                                value: color.blue.toString(),
                            },
                        }));
                    }}
                />
            </Show>
            <span class="text-stroke pointer-events-none select-none font-bold text-black shadow-red-600 drop-shadow-lg">
                {props.lang.option[props.colorChanger.name]?.text ||
                    props.colorChanger.name}
            </span>
        </button>
    );
}
