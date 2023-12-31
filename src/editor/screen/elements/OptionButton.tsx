import { Match, Setter, Show, Switch } from "solid-js";
import Button from "../../../components/Button";
import ColoredText from "../../../components/ColoredText";
import { Lang } from "../../languages";
import { Option, Options } from "../../options";
import { OptionElement } from "../Screen";
import { twMerge } from "tailwind-merge";

interface Props {
    selector: OptionElement;
    lang: Lang;
    option: Option;
    setOptions: Setter<Options>;
    setTooltip: Setter<string>;
    resetTooltip: () => void;
    highlight: string;
}

export function OptionButton(props: Props) {
    const onMouseEnter = () => {
        const langOption = props.lang.option[props.selector.name];
        if (!langOption) return;
        const tooltip = langOption.description ?? "";
        if (tooltip) props.setTooltip(tooltip);
    };
    const onClick = (e: MouseEvent): void => {
        e.preventDefault();
        const option = props.option;
        if (option.type === "boolean") {
            props.setOptions((options) => ({
                ...options,
                [props.selector.name]: {
                    ...option,
                    value: !option.value,
                },
            }));
            return;
        }

        let index = option.values.indexOf(option.value);

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
        index = (index + option.values.length) % option.values.length;
        props.setOptions((options) => ({
            ...options,
            [props.selector.name]: {
                ...option,
                value: option.values[index],
            },
        }));
    };
    return (
        <Button
            onMouseEnter={onMouseEnter}
            onMouseLeave={() => props.resetTooltip()}
            onBlur={() => props.resetTooltip()}
            class={twMerge(
                "h-full w-full",
                props.selector.name === props.highlight
                    ? "border-primary-200 bg-primary-800 text-primary-100"
                    : "",
            )}
            onClick={onClick}
        >
            <Show
                when={props.option}
                fallback={<span>Unknown option: {props.selector.name}</span>}
            >
                {(option) => (
                    <span>
                        <ColoredText>
                            {props.lang.option[props.selector.name]?.text ||
                                props.selector.name}
                        </ColoredText>
                        <span>: </span>
                        <Switch>
                            <Match when={option().type === "boolean"}>
                                {option().value ? "Enabled" : "Disabled"}
                            </Match>
                            <Match when={option().type === "text"}>
                                <ColoredText>
                                    {props.lang.option[props.selector.name]
                                        ?.values[option().value as string] ??
                                        option().value}
                                </ColoredText>
                            </Match>
                        </Switch>
                    </span>
                )}
            </Show>
        </Button>
    );
}
