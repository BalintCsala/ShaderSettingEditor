import { Setter, Show, createSignal } from "solid-js";
import ColorSelector, { Color } from "../../../components/ColorSelector";
import { Lang } from "../../languages";
import { Options, TextOption } from "../../options";
import { ColorElement } from "../Screen";
import { twMerge } from "tailwind-merge";
import { Portal } from "solid-js/web";

export type ColorOptionGroup = {
    format: "separate" | "separate_255" | "combined" | "combined_255";
    red?: string;
    blue?: string;
    green?: string;
    color?: string;
};

interface Props {
    lang: Lang;
    colorChanger: ColorElement;
    colorGroup: ColorOptionGroup;
    redOption?: TextOption;
    greenOption?: TextOption;
    blueOption?: TextOption;
    colorOption?: TextOption;
    resetTooltip: () => void;
    setOptions: Setter<Options>;
    setTooltip: Setter<string>;
    highlight: string;
}

export default function ColorButton(props: Props) {
    const [active, setActive] = createSignal(false);

    const getComponent = (comp: "red" | "green" | "blue") => {
        const scaler = props.colorGroup.format.endsWith("255") ? 255 : 1;
        if (props.colorGroup.format.startsWith("combined")) {
            const values = props
                .colorOption!.value.replace("vec3(", "")
                .replace(")", "")
                .split(",");
            return (
                parseFloat(values[["red", "green", "blue"].indexOf(comp)]) /
                scaler
            );
        }
        return parseFloat(props[`${comp}Option`]!.value as string) / scaler;
    };

    const getColor = () =>
        `rgb(${(["red", "green", "blue"] as const).map((c) =>
            Math.round(getComponent(c) * 255),
        )})`;

    const clickOutside = () => {
        if (!active()) return;
        setActive(false);
        document.removeEventListener("click", clickOutside);
    };

    const onColorChange = (color: Color): void => {
        const scaler = props.colorGroup.format.endsWith("255") ? 255 : 1;
        if (
            props.colorGroup.format === "combined" ||
            props.colorGroup.format === "combined_255"
        ) {
            props.setOptions((options) => ({
                ...options,
                [props.colorGroup.color!]: {
                    ...props.colorOption!,
                    value: `vec3(${[
                        color.red * scaler,
                        color.green * scaler,
                        color.blue * scaler,
                    ]})`,
                },
            }));
            return;
        }
        props.setOptions((options) => ({
            ...options,
            [props.colorGroup.red!]: {
                ...props.redOption!,
                value: (color.red * scaler).toString(),
            },
            [props.colorGroup.green!]: {
                ...props.greenOption!,
                value: (color.green * scaler).toString(),
            },
            [props.colorGroup.blue!]: {
                ...props.blueOption!,
                value: (color.blue * scaler).toString(),
            },
        }));
    };

    const selectorReferencePoint = (<div />) as HTMLDivElement;

    return (
        <button
            class={twMerge(
                "relative flex h-full w-full cursor-pointer justify-center border-2 border-primary-600 p-2 text-lg",
                props.highlight === props.colorChanger.name
                    ? "border-primary-200 bg-primary-800 text-primary-100"
                    : "",
            )}
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
            }}
        >
            <Show when={active()}>
                {selectorReferencePoint}
                <Portal>
                    <ColorSelector
                        color={{
                            red: getComponent("red"),
                            green: getComponent("green"),
                            blue: getComponent("blue"),
                        }}
                        class="absolute z-10 border-2 border-primary-600 bg-gray-900 p-4"
                        /* -right-0.5 top-full */
                        style={{
                            top: `calc(${
                                selectorReferencePoint.getBoundingClientRect().y
                            }px + 2.25rem)`,
                            left: `calc(${
                                selectorReferencePoint.getBoundingClientRect().x
                            }px - 4.15rem)`,
                        }}
                        onChange={onColorChange}
                    />
                </Portal>
            </Show>
            <span class="text-stroke pointer-events-none select-none font-bold text-black shadow-red-600 drop-shadow-lg">
                {props.lang.option[props.colorChanger.name]?.text ||
                    props.colorChanger.name}
            </span>
        </button>
    );
}
