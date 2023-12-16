import { createSignal, Setter, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import { Lang } from "../../languages";
import { Options, TextOption } from "../../options";
import { OptionElement } from "../Screen";

interface Props {
    lang: Lang;
    selector: OptionElement;
    option: TextOption;
    setOptions: Setter<Options>;
    setTooltip: Setter<string>;
    resetTooltip: () => void;
    highlight: string;
}

export default function SliderOption(props: Props) {
    const [dragging, setDragging] = createSignal(false);

    const selectedIndex = () => {
        const opt = props.option;
        return opt.values
            .map((x) => parseFloat(x).toFixed(5))
            .indexOf(parseFloat(opt.value).toFixed(5));
    };
    const percentage = () =>
        Math.floor((selectedIndex() / (props.option.values.length - 1)) * 100);

    const handleSelect = (
        e: MouseEvent & { currentTarget: HTMLDivElement },
    ) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const perc = (e.clientX - rect.x) / rect.width;
        props.setOptions((options) => ({
            ...options,
            [props.selector.name]: {
                ...props.option,
                value: props.option.values[
                    Math.round(perc * (props.option.values.length - 1))
                ],
            },
        }));
    };

    return (
        <Show
            when={props.option}
            fallback={
                <div class="group relative flex h-full w-full items-center justify-center border-2 border-primary-600 bg-primary-950 p-2">
                    <span>Unknown option: {props.selector.name}</span>
                </div>
            }
        >
            <div
                class={twMerge(
                    "group relative flex h-full w-full items-center justify-center border-2 border-primary-600 bg-primary-950 p-2",
                    props.selector.name === props.highlight
                        ? "border-primary-200 bg-primary-800 text-primary-100"
                        : "",
                )}
                onMouseEnter={() => {
                    const tooltip =
                        props.lang.option[props.selector.name]?.description;
                    if (tooltip) props.setTooltip(tooltip);
                }}
                onMouseLeave={() => {
                    props.resetTooltip();
                    setDragging(false);
                }}
                onBlur={() => props.resetTooltip()}
                onMouseDown={(e) => {
                    setDragging(true);
                    handleSelect(e);
                }}
                onMouseUp={() => setDragging(false)}
                onMouseMove={(e) => {
                    if (!dragging()) return;
                    handleSelect(e);
                }}
            >
                <span class="select-none text-lg text-primary-400 group-hover:hidden">
                    {props.lang.option[props.selector.name]?.text ||
                        props.selector.name}
                    :{" "}
                    {props.lang.option[props.selector.name]?.values[
                        props.option.value
                    ] || props.option.value}
                </span>
                <span class="select-none text-lg">&nbsp;</span>
                <div class="absolute left-0 hidden h-1 w-full bg-primary-600 group-hover:block" />
                <div class="absolute left-0 right-2 top-0 hidden h-full group-hover:block">
                    <div
                        class="absolute z-10 h-full w-2 select-none bg-primary-600 transition-all duration-75"
                        style={{ left: `${percentage()}%` }}
                    >
                        <span class="pointer-events-none absolute top-full border-2 border-primary-800 bg-primary-950 p-2 text-lg text-primary-400">
                            {props.lang.option[props.selector.name]?.values[
                                props.option.value
                            ] || props.option.value}
                        </span>
                    </div>
                </div>
            </div>
        </Show>
    );
}
