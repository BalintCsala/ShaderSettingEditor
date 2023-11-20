import JSZip from "jszip";

export interface LangValue {
    text: string;
    description: string;
}

export interface ScreenLangValue extends LangValue {}

export interface OptionLangValue extends LangValue {
    values: { [key: string]: string };
    prefix: string;
    suffix: string;
}

export interface ProfileLangValue extends LangValue {}

export interface Lang {
    screen: { [key: string]: ScreenLangValue };
    option: { [key: string]: OptionLangValue };
    profile: { [key: string]: ProfileLangValue };
    profileDescription: string;
}

export type Langs = { [key: string]: Lang };

export const EMPTY_LANG = {
    screen: {},
    option: {},
    profile: {},
    profileDescription: "",
};

export const EMPTY_LANGS: Langs = {
    none: EMPTY_LANG,
};

function createScreenIfUndefined(screen: ScreenLangValue | undefined) {
    if (screen) return screen;
    return {
        text: "",
        description: "",
    };
}

function createProfileIfUndefined(profile: ProfileLangValue | undefined) {
    if (profile) return profile;
    return {
        text: "",
        description: "",
    };
}

function createOptionIfUndefined(option: OptionLangValue) {
    if (option) return option;
    return {
        text: "",
        description: "",
        prefix: "",
        suffix: "",
        values: {},
    };
}

export async function parseLangFiles(zip: JSZip) {
    const langs: Langs = {};

    await Promise.all(
        Object.entries(zip.files)
            .filter(([name]) => name.endsWith(".lang"))
            .map(async ([name, file]) => {
                const pathParts = name.split(/\\|\//g);
                const language = pathParts[pathParts.length - 1].replace(".lang", "");
                const lang: Lang = {
                    screen: {},
                    option: {},
                    profile: {},
                    profileDescription: "",
                };

                (await file.async("text"))
                    .split("\n")
                    .map(line => line.trim())
                    .filter(line => line.length > 0 && !line.startsWith("#"))
                    .forEach(line => {
                        const [path, str] = line.split("=").map(part => part.trim());
                        if (path === "profile.comment") {
                            lang.profileDescription = str;
                            return;
                        }
                        const pathParts = path.split(".");

                        if (pathParts.length < 2) {
                            throw `Failed to parse language setting: ${line}`;
                        }

                        const [type, name] = pathParts;

                        switch (type) {
                            case "profile": {
                                const profileLang = createProfileIfUndefined(lang.profile[name]);
                                if (pathParts[pathParts.length - 1] === "comment") {
                                    profileLang.description = str;
                                } else {
                                    profileLang.text = str;
                                }
                                lang.profile[name] = profileLang;
                                break;
                            }
                            case "option": {
                                const optionLang = createOptionIfUndefined(lang.option[name]);

                                if (pathParts[pathParts.length - 1] === "comment") {
                                    optionLang.description = str;
                                } else {
                                    optionLang.text = str;
                                }

                                lang.option[name] = optionLang;
                                break;
                            }
                            case "suffix": {
                                const optionLang = createOptionIfUndefined(lang.option[name]);
                                optionLang.suffix = str;
                                lang.option[name] = optionLang;
                                break;
                            }
                            case "prefix": {
                                const optionLang = createOptionIfUndefined(lang.option[name]);
                                optionLang.prefix = str;
                                lang.option[name] = optionLang;
                                break;
                            }
                            case "value": {
                                const value = pathParts[2];
                                const optionLang = createOptionIfUndefined(lang.option[name]);
                                optionLang.values[value] = str;
                                lang.option[name] = optionLang;
                                break;
                            }
                            case "screen": {
                                const screenLang = createScreenIfUndefined(lang.screen[name]);

                                if (pathParts[pathParts.length - 1] === "comment") {
                                    screenLang.description = str;
                                } else {
                                    screenLang.text = str;
                                }

                                lang.screen[name] = screenLang;
                                break;
                            }
                        }
                    });

                langs[language] = lang;
            }),
    );

    if (Object.keys(langs).length === 0) {
        return EMPTY_LANGS;
    }

    return langs;
}

export function getDefaultLanguage(langs: Langs) {
    // Completely unbiased default language selection
    const priorities: { [key: string]: number } = {
        en_us: 10,
        en_gb: 9,
        de_de: 5,
        fr_fr: -5,
    };

    let selectedLanguage = "none";
    let highestPriority = -Infinity;

    Object.keys(langs)
        .map(lang => ({
            priority: priorities[lang] ?? 0,
            lang,
        }))
        .forEach(({ priority, lang }) => {
            if (priority > highestPriority) {
                highestPriority = priority;
                selectedLanguage = lang;
            }
        });

    return selectedLanguage;
}
