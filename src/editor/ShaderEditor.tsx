import JSZip from "jszip";
import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import Button from "../Button";
import Icon from "../Icon/Icon";
import ScreenStack from "./ScreenStack";
import { ColorChanger, ColorOptions, Link, OptionSelector, Profiles, Screens, parseProperties } from "./properties";
import { EMPTY_LANGS, getDefaultLanguage, parseLangFiles } from "./languages";
import { Options, parseOptions } from "./options";
import ColorButton from "./screen_buttons/ColorButton";
import LinkButton from "./screen_buttons/LinkButton";
import { OptionButton } from "./screen_buttons/OptionButton";
import ProfileButton from "./screen_buttons/ProfileButton";
import SliderOption from "./screen_buttons/SliderOption";
import { exportOptions } from "./export";

interface Props {
    file: File;
}

const DEFAULT_TOOLTIP = "";

export default function ShaderEditor(props: Props) {
    const [zip, setZip] = createSignal<JSZip | null>(null);

    const [screens, setScreens] = createSignal<Screens>({});
    const [profiles, setProfiles] = createSignal<Profiles>({});
    const [colors, setColors] = createSignal<ColorOptions>({});
    const [options, setOptions] = createSignal<Options>({});
    const [sliders, setSliders] = createSignal<string[]>([]);
    const [langs, setLangs] = createSignal(EMPTY_LANGS);
    const [currentLangName, setCurrentLangName] = createSignal("en_us");
    const [tooltip, setTooltip] = createSignal(DEFAULT_TOOLTIP);
    const [hiddenOptions, setHiddenOptions] = createSignal<{ [key: string]: string }>({});
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
            const options = await parseOptions(zip);
            const { screens, profiles, colors, sliders, special, hiddenOptions } = parseProperties(shadersProperties, options);
            const langs = await parseLangFiles(zip);

            setScreens(screens);
            setProfiles(profiles);
            setLangs(langs);
            setColors(colors);
            setSliders(sliders);
            setCurrentLangName(getDefaultLanguage(langs));
            setHiddenOptions(hiddenOptions);

            Object.entries(hiddenOptions).forEach(([name, value]) => {
                const option = options[name];
                switch (option.type) {
                    case "boolean": {
                        option.value = value === "true";
                        break;
                    }
                    case "text": {
                        option.value = value;
                        break;
                    }
                }
            });
            setOptions(options);

            setZip(zip);
            setScreenStack(["main"]);

            document.body.dataset.special = special;
        });
    });

    return (
        <Show when={zip()} fallback={<span class="text-primary-400">Loading file...</span>}>
            <ScreenStack lang={currentLang()} screenStack={screenStack()} setScreenStack={setScreenStack} />
            <div class="grid gap-2 p-2" style={{ "grid-template-columns": `repeat(${currentScreen().columns}, 1fr)` }}>
                <For each={currentScreen().children}>
                    {element => (
                        <div>
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
                                        screens={screens()}
                                    />
                                </Match>
                                <Match when={element.type === "profile"}>
                                    <ProfileButton
                                        currentProfileName={currentProfileName()}
                                        options={options()}
                                        profiles={profiles()}
                                        setCurrentProfileName={setCurrentProfileName}
                                        setOptions={setOptionsAndResetProfile}
                                        lang={currentLang()}
                                        setTooltip={setTooltip}
                                        resetTooltip={resetTooltip}
                                        hiddenOptions={hiddenOptions()}
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
            <div class="m-2 mb-0 grow border-2 border-primary-600 p-2 text-lg text-primary-400">
                <For each={tooltip().split(/(?<=\.)\s/g)}>{part => <p>{part}</p>}</For>
            </div>
            <div class="flex justify-between p-2">
                <div>
                    <Button
                        onClick={() => {
                            const languages = Object.keys(langs());
                            setCurrentLangName(languages[(languages.indexOf(currentLangName()) + 1) % languages.length]);
                        }}>
                        <Icon icon="language" />
                        {currentLangName().toUpperCase()}
                    </Button>
                    <Button class="ml-4" onClick={() => exportOptions(options(), props.file.name)}>
                        <Icon icon="download" />
                        Export settings
                    </Button>
                </div>
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
