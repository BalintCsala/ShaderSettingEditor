import { Setter } from "solid-js";
import Button from "../../../components/Button";
import ColoredText from "../../../components/ColoredText";
import Icon from "../../../components/Icon";
import { Lang } from "../../languages";
import { LinkElement } from "../Screen";

interface Props {
    setScreenStack: Setter<string[]>;
    link: LinkElement;
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
            class="h-full w-full"
            onClick={() => {
                props.setScreenStack((prevScreenStack) => [
                    ...prevScreenStack,
                    props.link.name,
                ]);
            }}
        >
            <ColoredText>
                {props.lang.screen[props.link.name]?.text || props.link.name}
            </ColoredText>
            <Icon icon="arrow_forward" />
        </Button>
    );
}
