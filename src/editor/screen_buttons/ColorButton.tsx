import { Show, createSignal } from "solid-js";
import ColorSelector from "../../components/ColorSelector";
import { ColorChanger, ColorOption, ColorOptions } from "../data";
import { Lang } from "../languages";
import { Options, TextOption } from "../options";

interface Props {
    colorChanger: ColorChanger;
    lang: Lang;
    options: Options;
    colors: ColorOptions;
    setOptions: (options: Options) => void;
    setTooltip: (tooltip: string) => void;
    resetTooltip: () => void;
}

export default function ColorButton(props: Props) {
    const [active, setActive] = createSignal(false);
    const colorOption = () => props.colors[props.colorChanger.name];
    const componentOption = (comp: keyof ColorOption) => colorOption()[comp];
    const getComp = (comp: keyof ColorOption) => parseFloat(props.options[componentOption(comp)].value as string);
    const getColor = () => `rgb(${(["red", "green", "blue"] as const).map(c => Math.round(getComp(c) * 255))})`;

    const clickOutside = () => {
        if (!active()) return;
        setActive(false);
        document.removeEventListener("click", clickOutside);
    };

    return (
        <button
            class="relative flex w-full cursor-pointer justify-center border-2 border-primary-600 p-2 text-lg"
            onMouseEnter={() => {
                const tooltip = props.lang.option[props.colorChanger.name]?.description;
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
                    color={{ red: getComp("red"), green: getComp("green"), blue: getComp("blue") }}
                    class="absolute -right-0.5 top-full z-10 border-2 border-primary-600 bg-gray-900 p-4"
                    onChange={color => {
                        const redOption = componentOption("red");
                        const greenOption = componentOption("green");
                        const blueOption = componentOption("blue");

                        props.setOptions({
                            ...props.options,
                            [redOption]: { ...(props.options[redOption] as TextOption), value: color.red.toString() },
                            [greenOption]: { ...(props.options[greenOption] as TextOption), value: color.green.toString() },
                            [blueOption]: { ...(props.options[blueOption] as TextOption), value: color.blue.toString() },
                        });
                    }}
                />
            </Show>
            <span class="text-shadow pointer-events-none select-none text-black shadow-red-600 drop-shadow-lg">
                {props.lang.option[props.colorChanger.name]?.text || props.colorChanger.name}
            </span>
        </button>
    );
}
