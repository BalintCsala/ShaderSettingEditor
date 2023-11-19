import { Show, Switch, Match } from "solid-js";
import Button from "../../Button";
import { OptionSelector } from "../data";
import { Options } from "../options";
import { Lang } from "../languages";
import ColoredText from "../../ColoredText";

interface Props {
    selector: OptionSelector;
    options: Options;
    lang: Lang;
    setOptions: (options: Options) => void;
    setTooltip: (tooltip: string) => void;
    resetTooltip: () => void;
}

export function OptionButton(props: Props) {
    const option = () => props.options[props.selector.name];
    return (
        <Button
            onMouseEnter={() => {
                const tooltip = props.lang.option[props.selector.name]?.description;
                console.log(tooltip);

                if (tooltip) props.setTooltip(tooltip);
            }}
            onMouseLeave={() => props.resetTooltip()}
            onBlur={() => props.resetTooltip()}
            class="w-full"
            onClick={e => {
                e.preventDefault();
                const curr = option();
                if (curr.type === "boolean") {
                    props.setOptions({
                        ...props.options,
                        [props.selector.name]: { ...curr, value: !curr.value },
                    });
                    return;
                }

                let index = curr.values.indexOf(curr.value);

                switch (e.button) {
                    case 0: {
                        index++;
                        break;
                    }
                    case 2: {
                        index--;
                        break;
                    }
                }
                index = (index + curr.values.length) % curr.values.length;
                props.setOptions({
                    ...props.options,
                    [props.selector.name]: { ...curr, value: curr.values[index] },
                });
            }}>
            <Show when={option()} fallback={<span>Unknown option: {props.selector.name}</span>}>
                {option => (
                    <span>
                        {props.lang.option[props.selector.name]?.text || props.selector.name}:{" "}
                        <Switch>
                            <Match when={option().type === "boolean"}>{option().value ? "Enabled" : "Disabled"}</Match>
                            <Match when={option().type === "text"}>
                                <ColoredText>{props.lang.option[props.selector.name]?.values[option().value as string] ?? option().value}</ColoredText>
                            </Match>
                        </Switch>
                    </span>
                )}
            </Show>
        </Button>
    );
}
