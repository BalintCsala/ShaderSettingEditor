import { Setter } from "solid-js";
import Button from "../../../components/Button";
import ColoredText from "../../../components/ColoredText";
import { Lang } from "../../languages";
import { Options } from "../../options";
import { Profiles } from "../../properties";

export interface TextSetting {
    type: "textSetting";
    name: string;
    value: string;
}

export interface BooleanSetting {
    type: "booleanSetting";
    name: string;
    value: boolean;
}

export type Setting = TextSetting | BooleanSetting;

interface Props {
    lang: Lang;
    currentProfileName: string;
    setCurrentProfileName: Setter<string>;
    profiles: Profiles;
    hiddenOptions: { [key: string]: string };
    setOptions: Setter<Options>;
    setTooltip: Setter<string>;
    resetTooltip: () => void;
}

export default function ProfileButton(props: Props) {
    const nextProfile = (offset: number) => {
        const curr = props.currentProfileName;
        const names = Object.keys(props.profiles);
        const currIndex = names.indexOf(curr);
        const nextIndex = (currIndex + offset + names.length) % names.length;
        return names[nextIndex];
    };

    const changeTooltip = () => {
        const tooltip =
            (props.lang.profileDescription ?? "") +
            (props.lang.profile[props.currentProfileName]?.description ?? "");
        if (tooltip) {
            props.setTooltip(tooltip);
        } else {
            props.resetTooltip();
        }
    };
    const clickHandler = (e: MouseEvent) => {
        e.preventDefault();
        const next = nextProfile(e.button === 0 ? 1 : -1);
        const profileSettings = props.profiles[next];
        props.setOptions((options) => {
            const optionsCopy = { ...options };
            profileSettings.forEach((setting) => {
                if (setting.name in props.hiddenOptions) return;
                if (!(setting.name in optionsCopy)) {
                    console.warn(
                        `Error while applying profile. ${setting.name} is not a setting`,
                    );
                    return;
                }
                optionsCopy[setting.name].value = setting.value;
            });
            return optionsCopy;
        });

        props.setCurrentProfileName(next);
        changeTooltip();
    };

    return (
        <Button
            onMouseEnter={changeTooltip}
            onMouseLeave={() => props.resetTooltip()}
            onBlur={() => props.resetTooltip()}
            class="h-full w-full"
            onClick={clickHandler}
        >
            Profile:{" "}
            <ColoredText>
                {props.lang.profile[props.currentProfileName]?.text ||
                    props.currentProfileName}
            </ColoredText>
        </Button>
    );
}
