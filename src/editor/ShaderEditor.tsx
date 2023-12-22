import JSZip from "jszip";
import { For, Show, createEffect, createSignal } from "solid-js";
import Button from "../components/Button";
import Icon from "../components/Icon";
import Spinner from "../components/Spinner/Spinner";
import ScreenStack from "./ScreenStack";
import CustomProfiles from "./editor_buttons/CustomProfiles";
import LanguageButton from "./editor_buttons/LanguageButton";
import PostCustomProfile from "./editor_buttons/PostCustomProfile";
import { exportOptions } from "./export";
import { EMPTY_LANGS, getDefaultLanguage, parseLangFiles } from "./languages";
import { Options, parseOptions } from "./options";
import { Profiles, Ranges, Screens, parseProperties } from "./properties";
import { ColorOptionGroups } from "./properties";
import Screen from "./screen/Screen";
import SearchField from "./SearchField";

interface Props {
    zipPromise: Promise<JSZip>;
    fileName: string;
}

const DEFAULT_TOOLTIP = "";

export default function ShaderEditor(props: Props) {
    const [loaded, setLoaded] = createSignal(false);
    const [screens, setScreens] = createSignal<Screens>({});
    const [profiles, setProfiles] = createSignal<Profiles>({});
    const [colors, setColors] = createSignal<ColorOptionGroups>({});
    const [options, setOptions] = createSignal<Options>({});
    const [sliders, setSliders] = createSignal<string[]>([]);
    const [langs, setLangs] = createSignal(EMPTY_LANGS);
    const [currentLangName, setCurrentLangName] = createSignal("en_us");
    const [tooltip, setTooltip] = createSignal(DEFAULT_TOOLTIP);
    const [hiddenOptions, setHiddenOptions] = createSignal<{
        [key: string]: string;
    }>({});
    const [ranges, setRanges] = createSignal<Ranges>({});

    const [identifier, setIdentifier] = createSignal<string | null>(null);
    const resetTooltip = () => setTooltip(DEFAULT_TOOLTIP);

    const [screenStack, setScreenStack] = createSignal(["main"]);
    const [currentProfileName, setCurrentProfileName] = createSignal("Custom");

    const currentScreenName = () => screenStack()[screenStack().length - 1];
    const currentScreen = () => screens()[currentScreenName()];
    const currentLang = () => langs()[currentLangName()];
    const [highlight, setHighlight] = createSignal("");

    createEffect(() => {
        const load = async () => {
            const zip = await props.zipPromise;
            const entries = Object.entries(zip.files);
            const shadersPropertiesFile =
                entries.find(([name]) =>
                    name.endsWith("shaders.properties"),
                )?.[1] ?? null;
            if (shadersPropertiesFile === null) {
                return;
            }

            const shadersProperties =
                await shadersPropertiesFile.async("string");
            const options = await parseOptions(zip);
            const {
                screens,
                profiles,
                colors,
                sliders,
                special,
                hiddenOptions,
                identifier,
                colorScheme,
                ranges,
            } = parseProperties(shadersProperties, options);
            const langs = await parseLangFiles(zip);

            setScreens(screens);
            setProfiles(profiles);
            setLangs(langs);
            setColors(colors);
            setSliders(sliders);
            setCurrentLangName(getDefaultLanguage(langs));
            setHiddenOptions(hiddenOptions);
            setIdentifier(identifier);
            setRanges(ranges);

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

            setScreenStack(["main"]);

            document.body.dataset.special = special;
            document.documentElement.dataset.theme = colorScheme;
            setLoaded(true);
        };
        load();
    });

    const setOptionsAndResetProfile = (
        options: Options | ((prev: Options) => Options),
    ) => {
        setOptions(options);
        setCurrentProfileName("Custom");
    };

    const selectProfile = (profile: {
        [key: string]: string;
        title: string;
        description: string;
        nickname: string;
    }): void => {
        const copy = { ...options() };
        for (const key in copy) {
            if (key in profile) {
                switch (copy[key].type) {
                    case "boolean": {
                        copy[key].value = profile[key] === "true";
                        break;
                    }
                    case "text": {
                        copy[key].value = profile[key];
                        break;
                    }
                }
            }
        }
        setScreenStack(["main"]);
        setCurrentProfileName(profile.title);
    };
    return (
        <Show
            when={loaded()}
            fallback={
                <div class="flex h-full w-full items-center justify-center">
                    <Spinner />
                </div>
            }
        >
            <div class="flex justify-between">
                <ScreenStack
                    lang={currentLang()}
                    screenStack={screenStack()}
                    setScreenStack={setScreenStack}
                />
                <Show when={screenStack().length > 1}>
                    <Button
                        onClick={() =>
                            setScreenStack(screenStack().slice(0, -1))
                        }
                    >
                        <Icon class="mr-2" icon="arrow_back" />
                        Back
                    </Button>
                </Show>
            </div>
            <SearchField
                lang={currentLang()}
                options={options()}
                screens={screens()}
                setScreenStack={setScreenStack}
                setHighlight={setHighlight}
            />
            <div class="h-3/5 overflow-y-auto border-2 border-primary-600">
                <Screen
                    colorGroups={colors()}
                    currentProfileName={currentProfileName()}
                    hiddenOptions={hiddenOptions()}
                    lang={currentLang()}
                    options={options()}
                    profiles={profiles()}
                    resetTooltip={() => resetTooltip()}
                    screen={currentScreen()}
                    setCurrentProfileName={setCurrentProfileName}
                    setOptions={setOptionsAndResetProfile}
                    setScreenStack={setScreenStack}
                    setTooltip={setTooltip}
                    sliders={sliders()}
                    highlight={highlight()}
                    ranges={ranges()}
                />
            </div>
            <div class="mb-0 grow border-2 border-primary-600 p-2 text-lg text-primary-400">
                <For each={tooltip().split(/(?<=\.)\s/g)}>
                    {(part) => <p>{part}</p>}
                </For>
            </div>
            <div class="flex justify-center gap-2 p-2">
                <LanguageButton
                    currentLangName={currentLangName()}
                    langs={langs()}
                    setCurrentLangName={setCurrentLangName}
                />
                <Button
                    class="flex grow basis-1 flex-col items-center md:grow-0 md:flex-row"
                    onClick={() => exportOptions(options(), props.fileName)}
                >
                    <Icon
                        class="text-6xl sm:text-3xl md:mr-2"
                        icon="download"
                    />
                    <span class="hidden whitespace-nowrap sm:inline">
                        Export settings
                    </span>
                </Button>
                <Show when={identifier()}>
                    {(identifier) => (
                        <>
                            <CustomProfiles
                                identifier={identifier()}
                                selectProfile={selectProfile}
                            />
                            <PostCustomProfile
                                identifier={identifier()}
                                options={options()}
                            />
                        </>
                    )}
                </Show>
            </div>
        </Show>
    );
}
