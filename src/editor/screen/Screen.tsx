import { For, Match, Setter, Show, Switch } from "solid-js";
import { Lang } from "../languages";
import { Options, TextOption } from "../options";
import { Profiles } from "../properties";
import { ColorOptionGroups } from "../properties";
import ColorButton from "./elements/ColorButton";
import LinkButton from "./elements/LinkButton";
import { OptionButton } from "./elements/OptionButton";
import ProfileButton from "./elements/ProfileButton";
import SliderOption from "./elements/SliderOption";

export interface LinkElement {
    type: "link";
    name: string;
}

export interface OptionElement {
    type: "option";
    name: string;
}

export interface ColorElement {
    type: "color";
    name: string;
}

export interface ProfileElement {
    type: "profile";
}

export interface EmptyElement {
    type: "empty";
}

export type ScreenElement =
    | LinkElement
    | OptionElement
    | ProfileElement
    | EmptyElement
    | ColorElement;

export interface ScreenData {
    columns: number;
    children: ScreenElement[];
}

interface Props {
    lang: Lang;
    options: Options;
    screen: ScreenData;
    sliders: string[];
    currentProfileName: string;
    profiles: Profiles;
    hiddenOptions: { [key: string]: string };
    colorGroups: ColorOptionGroups;
    setCurrentProfileName: Setter<string>;
    setScreenStack: Setter<string[]>;
    setTooltip: Setter<string>;
    resetTooltip: () => void;
    setOptions: Setter<Options>;
}

export default function Screen(props: Props) {
    return (
        <div
            class="grid gap-2 p-2"
            style={{
                "grid-template-columns": `repeat(${props.screen.columns}, 1fr)`,
            }}>
            <For each={props.screen.children}>
                {element => (
                    <div class="self-stretch">
                        <Switch>
                            <Match when={element.type === "empty"}>
                                <span class="select-none">&nbsp;</span>
                            </Match>
                            <Match when={element.type === "link"}>
                                <LinkButton
                                    lang={props.lang}
                                    link={element as LinkElement}
                                    setScreenStack={props.setScreenStack}
                                    setTooltip={props.setTooltip}
                                    resetTooltip={props.resetTooltip}
                                />
                            </Match>
                            <Match when={element.type === "profile"}>
                                <ProfileButton
                                    profiles={props.profiles}
                                    currentProfileName={
                                        props.currentProfileName
                                    }
                                    setCurrentProfileName={
                                        props.setCurrentProfileName
                                    }
                                    setOptions={props.setOptions}
                                    lang={props.lang}
                                    setTooltip={props.setTooltip}
                                    resetTooltip={props.resetTooltip}
                                    hiddenOptions={props.hiddenOptions}
                                />
                            </Match>
                            <Match when={element.type === "option"}>
                                <Show
                                    when={props.sliders.includes(
                                        (element as OptionElement).name,
                                    )}
                                    fallback={
                                        <OptionButton
                                            lang={props.lang}
                                            selector={element as OptionElement}
                                            setOptions={props.setOptions}
                                            setTooltip={props.setTooltip}
                                            resetTooltip={props.resetTooltip}
                                            option={
                                                props.options[
                                                    (element as OptionElement)
                                                        .name
                                                ]
                                            }
                                        />
                                    }>
                                    <SliderOption
                                        lang={props.lang}
                                        setOptions={props.setOptions}
                                        selector={element as OptionElement}
                                        setTooltip={props.setTooltip}
                                        resetTooltip={props.resetTooltip}
                                        option={
                                            props.options[
                                                (element as OptionElement).name
                                            ] as TextOption
                                        }
                                    />
                                </Show>
                            </Match>
                            <Match when={element.type === "color"}>
                                <ColorButton
                                    setOptions={props.setOptions}
                                    lang={props.lang}
                                    colorChanger={element as ColorElement}
                                    setTooltip={props.setTooltip}
                                    resetTooltip={props.resetTooltip}
                                    redOption={
                                        props.options[
                                            props.colorGroups[
                                                (element as ColorElement).name
                                            ].red
                                        ] as TextOption
                                    }
                                    greenOption={
                                        props.options[
                                            props.colorGroups[
                                                (element as ColorElement).name
                                            ].green
                                        ] as TextOption
                                    }
                                    blueOption={
                                        props.options[
                                            props.colorGroups[
                                                (element as ColorElement).name
                                            ].blue
                                        ] as TextOption
                                    }
                                    colorGroup={
                                        props.colorGroups[
                                            (element as ColorElement).name
                                        ]
                                    }
                                />
                            </Match>
                        </Switch>
                    </div>
                )}
            </For>
        </div>
    );
}
