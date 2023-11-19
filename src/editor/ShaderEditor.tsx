import JSZip from "jszip";
import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import Button from "../Button";
import Icon from "../Icon/Icon";
import ScreenStack from "./ScreenStack";
import { ColorChanger, Colors, Link, OptionSelector, Profiles, Screens, parseProperties } from "./data";
import { EMPTY_LANGS, getDefaultLanguage, parseLangFiles } from "./languages";
import { Options, parseOptions } from "./options";
import ColorButton from "./screen_buttons/ColorButton";
import LinkButton from "./screen_buttons/LinkButton";
import { OptionButton } from "./screen_buttons/OptionButton";
import ProfileButton from "./screen_buttons/ProfileButton";
import SliderOption from "./screen_buttons/SliderOption";

interface Props {
    file: File;
}

const DEFAULT_TOOLTIP = "This page is intentionally left blank";

export default function ShaderEditor(props: Props) {
    const [zip, setZip] = createSignal<JSZip | null>(null);

    const [screens, setScreens] = createSignal<Screens>({});
    const [profiles, setProfiles] = createSignal<Profiles>({});
    const [colors, setColors] = createSignal<Colors>({});
    const [options, setOptions] = createSignal<Options>({});
    const [sliders, setSliders] = createSignal<string[]>([]);
    const [langs, setLangs] = createSignal(EMPTY_LANGS);
    const [currentLangName, setCurrentLangName] = createSignal("en_us");
    const [tooltip, setTooltip] = createSignal(DEFAULT_TOOLTIP);
    const resetTooltip = () => setTooltip(DEFAULT_TOOLTIP);

    const [screenStack, setScreenStack] = createSignal(["main"]);
    const [currentProfileName, setCurrentProfileName] = createSignal("Custom");

    const currentScreenName = () => screenStack()[screenStack().length - 1];
    const currentScreen = () => screens()[currentScreenName()];
    const currentLang = () => langs()[currentLangName()];
    const setOptionsAndResetProfile = (options: Options) => {
        setOptions(options);
        setCurrentProfileName("Custom");
    };

    createEffect(() => {
        JSZip.loadAsync(props.file).then(async zip => {
            const entries = Object.entries(zip.files);
            const shadersPropertiesFile = entries.find(([name]) => name.endsWith("shaders.properties"))?.[1] ?? null;
            if (shadersPropertiesFile === null) {
                return;
            }

            const shadersProperties = await shadersPropertiesFile.async("string");
            const { screens, profiles, colors, sliders, special } = parseProperties(shadersProperties);
            const options = await parseOptions(zip);
            const langs = await parseLangFiles(zip);

            setScreens(screens);
            setProfiles(profiles);
            setOptions(options);
            setLangs(langs);
            setColors(colors);
            setSliders(sliders);
            setCurrentLangName(getDefaultLanguage(langs));

            setZip(zip);
            setScreenStack(["main"]);

            document.querySelector(".special")!.className = "special " + special;
            document.body.dataset.special = special;
        });
    });

    return (
        <Show when={zip()} fallback={<span class="text-emerald-600">Loading file...</span>}>
            <ScreenStack lang={currentLang()} screenStack={screenStack()} setScreenStack={setScreenStack} />
            <div class="flex flex-row flex-wrap">
                <For each={currentScreen().children}>
                    {element => (
                        <div class="w-1/2 p-2">
                            <Switch>
                                <Match when={element.type === "empty"}>
                                    <span class="select-none">&nbsp;</span>
                                </Match>
                                <Match when={element.type === "link"}>
                                    <LinkButton
                                        lang={currentLang()}
                                        link={element as Link}
                                        screenStack={screenStack()}
                                        setScreenStack={setScreenStack}
                                        setTooltip={setTooltip}
                                        resetTooltip={resetTooltip}
                                    />
                                </Match>
                                <Match when={element.type === "profile"}>
                                    <ProfileButton
                                        currentProfileName={currentProfileName()}
                                        options={options()}
                                        profiles={profiles()}
                                        setCurrentProfileName={setCurrentProfileName}
                                        setOptions={setOptionsAndResetProfile}
                                    />
                                </Match>
                                <Match when={element.type === "option"}>
                                    <Show
                                        when={sliders().includes((element as OptionSelector).name)}
                                        fallback={
                                            <OptionButton
                                                lang={currentLang()}
                                                selector={element as OptionSelector}
                                                options={options()}
                                                setOptions={setOptionsAndResetProfile}
                                                setTooltip={setTooltip}
                                                resetTooltip={resetTooltip}
                                            />
                                        }>
                                        <SliderOption
                                            lang={currentLang()}
                                            options={options()}
                                            setOptions={setOptionsAndResetProfile}
                                            selector={element as OptionSelector}
                                            setTooltip={setTooltip}
                                            resetTooltip={resetTooltip}
                                        />
                                    </Show>
                                </Match>
                                <Match when={element.type === "color"}>
                                    <ColorButton
                                        options={options()}
                                        setOptions={setOptionsAndResetProfile}
                                        lang={currentLang()}
                                        colorChanger={element as ColorChanger}
                                        colors={colors()}
                                        setTooltip={setTooltip}
                                        resetTooltip={resetTooltip}
                                    />
                                </Match>
                            </Switch>
                        </div>
                    )}
                </For>
            </div>
            <div class="m-2 grow border-2 border-emerald-600 p-2 text-lg text-emerald-600">{tooltip()}</div>
            <div class="flex justify-between p-2">
                <Button
                    onClick={() => {
                        const languages = Object.keys(langs());
                        setCurrentLangName(languages[(languages.indexOf(currentLangName()) + 1) % languages.length]);
                    }}>
                    <Icon icon="language" />
                    {currentLangName().toUpperCase()}
                </Button>
                <Show when={screenStack().length > 1}>
                    <Button onClick={() => setScreenStack(screenStack().slice(0, -1))}>
                        <Icon icon="arrow_back" />
                        Back
                    </Button>
                </Show>
            </div>
        </Show>
    );
}
