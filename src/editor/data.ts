export interface Link {
    type: "link";
    name: string;
}

export interface OptionSelector {
    type: "option";
    name: string;
    slider: boolean;
}

export interface ColorChanger {
    type: "color";
    name: string;
}

export interface Profile {
    type: "profile";
}

export interface Empty {
    type: "empty";
}

export type ScreenElement = Link | OptionSelector | Profile | Empty | ColorChanger;

export interface Screen {
    children: ScreenElement[];
}

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

export interface Color {
    red: string;
    blue: string;
    green: string;
}

export type Setting = TextSetting | BooleanSetting;

export type Screens = { [key: string]: Screen };

export type Profiles = { [key: string]: Setting[] };

export type Colors = { [key: string]: Color };

export interface Properties {
    screens: Screens;
    profiles: Profiles;
    colors: Colors;
    sliders: string[];
    special: string;
}

export function parseProperties(propertiesFile: string) {
    const screens: Screens = {};
    const profiles: Profiles = {};
    const colors: Colors = {};
    const colorReplaceMap = new Map<string, string | null>();
    let sliders: string[] = [];
    let special = "";

    propertiesFile = propertiesFile.replace(/\\\r?\n\r?\n?/g, " ");

    propertiesFile
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length !== 0)
        .map(line => {
            const [left, right] = line.split("=").map(part => part.trim());
            const path = left.split(".");
            switch (path[0]) {
                case "screen": {
                    const name = path[1] ?? "main";
                    const children = right
                        .trim()
                        .split(/\s+/g)
                        .map(element => {
                            if (element === "<empty>") {
                                return { type: "empty" as const };
                            } else if (element === "<profile>") {
                                return { type: "profile" as const };
                            } else if (element.startsWith("[")) {
                                return {
                                    type: "link" as const,
                                    name: element.replace(/\[|\]/g, ""),
                                };
                            } else {
                                return {
                                    type: "option" as const,
                                    name: element,
                                    slider: false,
                                };
                            }
                        });
                    screens[name] = {
                        children,
                    };

                    break;
                }
                case "profile": {
                    const name = path[1];

                    const settings = right
                        .trim()
                        .split(/\s+/g)
                        .map(element => {
                            if (element.indexOf(":") !== -1) {
                                const [name, value] = element.split(":");
                                return {
                                    type: "textSetting" as const,
                                    name,
                                    value,
                                };
                            }
                            return {
                                type: "booleanSetting" as const,
                                name: element.replace(/!/g, ""),
                                value: element.indexOf("!") !== -1,
                            };
                        });
                    profiles[name] = settings;
                    break;
                }
                case "sliders": {
                    sliders = right.split(/\s+/g);
                    break;
                }
                case "extra": {
                    switch (path[1]) {
                        case "colors": {
                            const name = path[2];
                            const [red, green, blue] = right.split(/\s+/g);
                            colors[name] = { red, green, blue };
                            colorReplaceMap.set(red, name);
                            colorReplaceMap.set(green, null);
                            colorReplaceMap.set(blue, null);
                            break;
                        }
                        case "special": {
                            special = right.trim();
                            break;
                        }
                    }
                    break;
                }
            }
        });

    for (const key in screens) {
        const screen = screens[key];
        screen.children = screen.children
            .map(child => {
                if (child.type !== "option" || !colorReplaceMap.has(child.name)) return child;

                const replaceBy = colorReplaceMap.get(child.name)!;
                if (replaceBy === null) return replaceBy;

                const color = colors[replaceBy];
                if (child.name === color.red) {
                    return {
                        type: "color",
                        name: replaceBy,
                    };
                }
                return null;
            })
            .filter(child => child !== null) as ScreenElement[];
    }

    return {
        screens,
        profiles,
        colors,
        sliders,
        special,
    };
}
