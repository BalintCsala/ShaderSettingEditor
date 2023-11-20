import Button from "../../Button";
import { Profiles } from "../data";
import { Lang } from "../languages";
import { Options } from "../options";

interface Props {
    currentProfileName: string;
    setCurrentProfileName: (name: string) => void;
    profiles: Profiles;
    options: Options;
    lang: Lang;
    setOptions: (options: Options) => void;
    setTooltip: (tooltip: string) => void;
    resetTooltip: () => void;
    hiddenOptions: { [key: string]: string };
}

export default function ProfileButton(props: Props) {
    const nextProfile = () => {
        const curr = props.currentProfileName;
        const names = Object.keys(props.profiles);
        const currIndex = names.indexOf(curr);
        return names[(currIndex + 1) % names.length];
    };

    const changeTooltip = () => {
        const tooltip = (props.lang.profileDescription ?? "") + (props.lang.profile[props.currentProfileName]?.description ?? "");
        if (tooltip) {
            props.setTooltip(tooltip);
        } else {
            props.resetTooltip();
        }
    };
    return (
        <Button
            onMouseEnter={changeTooltip}
            onMouseLeave={() => props.resetTooltip()}
            onBlur={() => props.resetTooltip()}
            class="w-full"
            onClick={() => {
                const next = nextProfile();
                const profileSettings = props.profiles[next];
                const optionsCopy = { ...props.options };
                profileSettings.forEach(setting => {
                    if (setting.name in props.hiddenOptions) return;
                    if (!(setting.name in optionsCopy)) {
                        console.warn(`Error while applying profile. ${setting.name} is not a setting`);
                        return;
                    }
                    optionsCopy[setting.name].value = setting.value;
                });

                props.setOptions(optionsCopy);
                props.setCurrentProfileName(next);
                changeTooltip();
            }}>
            Profile: {props.lang.profile[props.currentProfileName]?.text || props.currentProfileName}
        </Button>
    );
}
