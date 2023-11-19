import { Color, ColorChanger, Colors } from "../data";
import { Lang } from "../languages";
import { Options, TextOption } from "../options";

interface Props {
    colorChanger: ColorChanger;
    lang: Lang;
    options: Options;
    colors: Colors;
    setOptions: (options: Options) => void;
    setTooltip: (tooltip: string) => void;
    resetTooltip: () => void;
}

function parseHex(color: string) {
    const red = parseInt(color.substring(1, 3), 16);
    const green = parseInt(color.substring(3, 5), 16);
    const blue = parseInt(color.substring(5, 7), 16);

    return { red, green, blue };
}

function toHex(color: { red: number; green: number; blue: number }) {
    return `#${color.red.toString(16).padStart(2, "0")}${color.green.toString(16).padStart(2, "0")}${color.blue.toString(16).padStart(2, "0")}`;
}

export default function ColorButton(props: Props) {
    const colorOption = () => props.colors[props.colorChanger.name];
    const componentOption = (comp: keyof Color) => colorOption()[comp];
    const getComp = (comp: keyof Color) => Math.floor(parseFloat(props.options[componentOption(comp)].value as string) * 255);

    const getColor = () => `rgb(${(["red", "green", "blue"] as const).map(c => getComp(c))})`;

    return (
        <div
            class="relative flex w-full cursor-pointer justify-center border-2 border-emerald-600 p-2 text-lg"
            onMouseEnter={() => {
                const tooltip = props.lang.option[props.colorChanger.name]?.description;
                if (tooltip) props.setTooltip(tooltip);
            }}
            onMouseLeave={() => props.resetTooltip()}
            onBlur={() => props.resetTooltip()}
            style={{
                background: getColor(),
            }}>
            <input
                type="color"
                class="absolute left-0 top-0 h-full w-full cursor-pointer"
                value={toHex({ red: getComp("red"), green: getComp("green"), blue: getComp("blue") })}
                onChange={e => {
                    const col = parseHex(e.currentTarget.value);
                    const redOption = componentOption("red");
                    const greenOption = componentOption("green");
                    const blueOption = componentOption("blue");

                    props.setOptions({
                        ...props.options,
                        [redOption]: { ...(props.options[redOption] as TextOption), value: (col.red / 255).toFixed(2) },
                        [greenOption]: { ...(props.options[greenOption] as TextOption), value: (col.green / 255).toFixed(2) },
                        [blueOption]: { ...(props.options[blueOption] as TextOption), value: (col.blue / 255).toFixed(2) },
                    });
                }}
            />
            <span class="text-shadow pointer-events-none z-10 select-none text-black shadow-red-600 drop-shadow-lg">
                {props.lang.option[props.colorChanger.name]?.text || props.colorChanger.name}
            </span>
        </div>
    );
}
