import { createSignal, onCleanup, Setter, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import { Lang } from "../../languages";
import { Options, TextOption } from "../../options";
import { OptionElement } from "../Screen";
import { Ranges } from "../../properties";
import { getPercentageWithGrowth, interpolateWithGrowth } from "../../growth";
import ColoredText from "../../../components/ColoredText";

const [currentlyDragging, setCurrentlyDragging] = createSignal("");

interface Props {
    lang: Lang;
    selector: OptionElement;
    option: TextOption;
    setOptions: Setter<Options>;
    setTooltip: Setter<string>;
    resetTooltip: () => void;
    highlight: string;
    ranges: Ranges;
}

export default function SliderOption(props: Props) {
    const selectedIndex = () => {
        const opt = props.option;
        return opt.values
            .map((x) => parseFloat(x).toFixed(5))
            .indexOf(parseFloat(opt.value).toFixed(5));
    };

    const range = () => {
        return props.ranges[props.selector.name];
    };

    const percentage = () => {
        const rangeData = range();
        if (!rangeData) {
            return selectedIndex() / (props.option.values.length - 1);
        }

        return getPercentageWithGrowth(
            rangeData.growth,
            rangeData.min,
            rangeData.max,
            parseFloat(props.option.value),
        );
    };

    const view = (
        <div
            class={twMerge(
                "duration-75 transition-colors hover:bg-primary-900 group relative flex h-full w-full items-center justify-center border-2 border-primary-600 bg-primary-950 p-2",
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
            }}
            onBlur={() => props.resetTooltip()}
            onMouseDown={(e) => {
                if (currentlyDragging() != "") return;
                setCurrentlyDragging(props.selector.name);
                handleSelect(e);
            }}
        >
            <span
                class={twMerge(
                    "select-none text-lg text-primary-400 group-hover:hidden",
                    currentlyDragging() !== "" ? "group-hover:block" : "",
                    currentlyDragging() === props.selector.name
                        ? "group-hover:hidden hidden"
                        : "",
                )}
            >
                <ColoredText>
                    {props.lang.option[props.selector.name]?.text ||
                        props.selector.name}
                </ColoredText>
                :{" "}
                <ColoredText>
                    {props.lang.option[props.selector.name]?.values[
                        props.option.value
                    ] || props.option.value}
                </ColoredText>
            </span>
            <span class="select-none text-lg">&nbsp;</span>
            <div
                class={twMerge(
                    "absolute left-0 hidden h-1 w-full bg-primary-600 group-hover:block",
                    currentlyDragging() !== "" ? "group-hover:hidden" : "",
                    currentlyDragging() === props.selector.name
                        ? "group-hover:block block"
                        : "",
                )}
            />
            <div
                class={twMerge(
                    "absolute left-0 right-0 top-0 hidden h-full group-hover:block",
                    currentlyDragging() !== "" ? "group-hover:hidden" : "",
                    currentlyDragging() === props.selector.name
                        ? "group-hover:block block"
                        : "",
                )}
            >
                <div
                    class="pointer-events-none absolute flex items-center whitespace-nowrap transition-all"
                    style={{ left: `${percentage() * 100}%` }}
                >
                    <span
                        class="relative select-none border-2 border-primary-800 bg-primary-950 p-2 text-lg text-primary-400"
                        style={{ right: `${percentage() * 100}%` }}
                    >
                        <ColoredText>
                            {props.lang.option[props.selector.name]?.values[
                                props.option.value
                            ] || props.option.value}
                        </ColoredText>
                    </span>
                </div>
            </div>
        </div>
    ) as HTMLDivElement;

    const handleSelect = (e: MouseEvent) => {
        const rect = view.getBoundingClientRect();
        const perc = Math.min(
            Math.max((e.clientX - rect.x) / rect.width, 0),
            1,
        );

        if (props.selector.name in props.ranges) {
            const rangeData = range();
            props.setOptions((options) => ({
                ...options,
                [props.selector.name]: {
                    ...props.option,
                    value: interpolateWithGrowth(
                        rangeData.growth,
                        rangeData.min,
                        rangeData.max,
                        rangeData.step,
                        perc,
                    ).toString(),
                },
            }));
            return;
        }

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

    const releaseListener = () => {
        if (currentlyDragging() === props.selector.name) {
            setCurrentlyDragging("");
        }
    };

    const moveListener = (e: MouseEvent): void => {
        if (currentlyDragging() !== props.selector.name) return;
        handleSelect(e);
    };

    window.addEventListener("mouseup", releaseListener);
    window.addEventListener("blur", releaseListener);
    window.addEventListener("mousemove", moveListener);

    onCleanup(() => {
        window.removeEventListener("mouseup", releaseListener);
        window.removeEventListener("blur", releaseListener);
        window.removeEventListener("mousemove", moveListener);
    });

    return (
        <Show
            when={props.option}
            fallback={
                <div class="group relative flex h-full w-full items-center justify-center border-2 border-primary-600 bg-primary-950 p-2">
                    <span>Unknown option: {props.selector.name}</span>
                </div>
            }
        >
            {view}
        </Show>
    );
}
