import { createSignal, Show } from "solid-js";
import { OptionSelector } from "../data";
import { Lang } from "../languages";
import { Options, TextOption } from "../options";

interface Props {
    selector: OptionSelector;
    options: Options;
    setOptions: (options: Options) => void;
    lang: Lang;
    setTooltip: (tooltip: string) => void;
    resetTooltip: () => void;
}

export default function SliderOption(props: Props) {
    const option = () => props.options[props.selector.name] as TextOption;
    const selectedIndex = () => {
        const opt = option();
        return opt.values.map(x => parseFloat(x).toFixed(5)).indexOf(parseFloat(opt.value).toFixed(5));
    };
    const percentage = () => Math.floor((selectedIndex() / (option().values.length - 1)) * 100);

    const [active, setActive] = createSignal(false);

    const handleSelect = (e: MouseEvent & { currentTarget: HTMLDivElement }) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const perc = (e.clientX - rect.x) / rect.width;
        props.setOptions({
            ...props.options,
            [props.selector.name]: {
                ...option(),
                value: option().values[Math.round(perc * (option().values.length - 1))],
            },
        });
    };

    return (
        <Show
            when={option()}
            fallback={
                <div class="group relative flex h-full w-full items-center justify-center border-2 border-emerald-600 bg-emerald-950 p-2">
                    <span>Unknown option: {props.selector.name}</span>
                </div>
            }>
            <div
                class="group relative flex h-full w-full items-center justify-center border-2 border-emerald-600 bg-emerald-950 p-2"
                onMouseEnter={() => {
                    const tooltip = props.lang.option[props.selector.name]?.description;
                    if (tooltip) props.setTooltip(tooltip);
                }}
                onMouseLeave={() => {
                    props.resetTooltip();
                    setActive(false);
                }}
                onBlur={() => props.resetTooltip()}
                onMouseDown={e => {
                    setActive(true);
                    handleSelect(e);
                }}
                onMouseUp={() => setActive(false)}
                onMouseMove={e => {
                    if (!active()) return;
                    handleSelect(e);
                }}>
                <span class="select-none text-lg text-emerald-600 group-hover:hidden">
                    {props.lang.option[props.selector.name]?.text || props.selector.name}:{" "}
                    {props.lang.option[props.selector.name]?.values[option().value] || option().value}
                </span>
                <span class="select-none text-lg">&nbsp;</span>
                <div class="absolute left-0 hidden h-1 w-full bg-emerald-600 group-hover:block" />
                <div class="absolute left-0 right-2 top-0 hidden h-full group-hover:block">
                    <div class="absolute z-10 h-full w-2 select-none bg-emerald-600 transition-all duration-75" style={{ left: `${percentage()}%` }}>
                        <span class="pointer-events-none absolute top-full border-2 border-emerald-800 bg-emerald-950 p-2 text-lg text-emerald-600">
                            {props.lang.option[props.selector.name]?.values[option().value] || option().value}
                        </span>
                    </div>
                </div>
            </div>
        </Show>
    );
}
