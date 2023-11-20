import Button from "../../Button";
import ColoredText from "../../ColoredText";
import Icon from "../../Icon/Icon";
import { Link, Screens } from "../data";
import { Lang } from "../languages";

interface Props {
    screenStack: string[];
    screens: Screens;
    setScreenStack: (stack: string[]) => void;
    link: Link;
    lang: Lang;
    setTooltip: (tooltip: string) => void;
    resetTooltip: () => void;
}

export default function LinkButton(props: Props) {
    return (
        <Button
            onMouseEnter={() => {
                const tooltip = props.lang.screen[props.link.name]?.description;
                if (tooltip) props.setTooltip(tooltip);
            }}
            onMouseLeave={() => props.resetTooltip()}
            onBlur={() => props.resetTooltip()}
            class="w-full"
            onClick={() => {
                if (props.link.name in props.screens) props.setScreenStack([...props.screenStack, props.link.name]);
            }}>
            <ColoredText>{props.lang.screen[props.link.name]?.text || props.link.name}</ColoredText>
            <Icon icon="arrow_forward" />
        </Button>
    );
}
