import Button from "../../Button";
import { Profiles } from "../data";
import { Options } from "../options";

interface Props {
    currentProfileName: string;
    setCurrentProfileName: (name: string) => void;
    profiles: Profiles;
    options: Options;
    lang: Lang;
    setOptions: (options: Options) => void;
}

export default function ProfileButton(props: Props) {
    const nextProfile = () => {
        const curr = props.currentProfileName;
        const names = Object.keys(props.profiles);
        const currIndex = names.indexOf(curr);
        return names[(currIndex + 1) % names.length];
    };

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
            onClick={() => {
                const next = nextProfile();
                const profileSettings = props.profiles[next];
                const optionsCopy = { ...props.options };
                profileSettings.forEach(setting => {
                    if (!(setting.name in optionsCopy)) {
                        console.warn(`Error while applying profile. ${setting.name} is not a setting`);
                        return;
                    }
                    optionsCopy[setting.name].value = setting.value;
                });

                props.setOptions(optionsCopy);
                props.setCurrentProfileName(next);
            }}>
            Profile: {props.currentProfileName}
        </Button>
    );
}
