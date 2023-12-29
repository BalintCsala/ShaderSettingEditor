import { GrowthType } from "./growth";
import { Options } from "./options";
import { ScreenElement } from "./screen/Screen";
import { ScreenData } from "./screen/Screen";
import { ColorOptionGroup } from "./screen/elements/ColorButton";
import { Setting } from "./screen/elements/ProfileButton";

export interface Range {
    min: number;
    max: number;
    step: number;
    growth: GrowthType;
}

export type Screens = { [key: string]: ScreenData };
export type Profiles = { [key: string]: Setting[] };
export type ColorOptionGroups = { [key: string]: ColorOptionGroup };
export type Ranges = { [key: string]: Range };

export interface CopyProfile {
    type: "copyProfile";
    name: string;
}

function flattenSettings(
    settings: (Setting | CopyProfile)[],
    profiles: { [key: string]: (Setting | CopyProfile)[] },
): Setting[] {
    return settings.reduce((settings, next) => {
        if (next.type !== "copyProfile") return [...settings, next];

        return [...settings, ...flattenSettings(profiles[next.name], profiles)];
    }, [] as Setting[]);
}

function parseScreenElements(list: string) {
    return list
        .trim()
        .split(/\s+/g)
        .map((element) => {
            if (element === "<empty>") {
                return { type: "empty" as const };
            } else if (element === "<profile>") {
                return { type: "profile" as const };
            } else if (element.startsWith("[")) {
                return {
                    type: "link" as const,
                    name: element.replace(/\[|\]/g, ""),
                };
            } else if (element.startsWith("(")) {
                return {
                    type: "color" as const,
                    name: element.replace(/\(|\)/g, ""),
                };
            } else {
                return {
                    type: "option" as const,
                    name: element,
                };
            }
        });
}

function checkIfIdentifierIsCorrect(identifier: string) {
    if (identifier.startsWith("-")) return false;
    if (identifier.match(/[^a-z-]/)) return false;
    return true;
}

function parseScreen(
    path: string[],
    right: string,
    parsedOptions: Options,
): Partial<ScreenData> {
    if (path[2] === "columns") {
        return {
            columns: parseInt(right),
        };
    }
    if (right === "*") {
        return {
            columns: 3,
            children: Object.keys(parsedOptions).map((name) => {
                return {
                    type: "option",
                    name,
                };
            }),
        };
    }
    return {
        children: parseScreenElements(right),
    };
}

function parseProfileSettings(right: string) {
    return right
        .trim()
        .split(/\s+/g)
        .map((element) => {
            if (element.startsWith("profile")) {
                const name = element.replace("profile.", "");
                return {
                    type: "copyProfile" as const,
                    name,
                };
            }
            if (element.match(/[=:]/)) {
                const [name, value] = element.split(/[=:]/);
                return {
                    type: "textSetting" as const,
                    name,
                    value,
                };
            }

            return {
                type: "booleanSetting" as const,
                name: element.replace(/!/g, ""),
                value: element.indexOf("!") === -1,
            };
        });
}

function parseColorOption(
    path: string[],
    value: string,
    option: ColorOptionGroup,
    colorReplaceMap: Map<string, string | null>,
) {
    const name = path[2];
    if (path.length === 4 && path[3] === "format") {
        if (
            value !== "separate" &&
            value !== "separate_255" &&
            value !== "combined" &&
            value !== "combined_255"
        ) {
            console.warn(`Incorrect color format for ${name}`);
            return option;
        }
        option.format = value;
        return option;
    }
    const rightParts = value.split(/\s+/g);
    if (rightParts.length === 1) {
        option.color = value;
        colorReplaceMap.set(value, name);
    } else if (rightParts.length === 3) {
        const [red, green, blue] = rightParts;
        option = { ...option, red, green, blue };
        colorReplaceMap.set(red, name);
        colorReplaceMap.set(green, null);
        colorReplaceMap.set(blue, null);
    } else {
        console.warn(`Incorrect color definition for ${name}`);
        return option;
    }
    return option;
}

export function parseProperties(
    propertiesFile: string,
    parsedOptions: Options,
) {
    const screens: Screens = {};
    const profiles: { [key: string]: (Setting | CopyProfile)[] } = {};
    const colors: ColorOptionGroups = {};
    const colorReplaceMap = new Map<string, string | null>();
    let sliders: string[] = [];
    let special = "";
    let colorScheme = "emerald";
    let identifier: string | null = null;
    const ranges: Ranges = {};
    const hiddenOptions: { [key: string]: string } = {};
    const appends: { screenName: string; index: number; options: string }[] =
        [];

    const removeEmptyAfter: { [key: string]: string[] } = {};
    const removeEmptyBefore: { [key: string]: string[] } = {};

    propertiesFile = propertiesFile.replace(/\\\r?\n/g, " ");

    propertiesFile
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length !== 0)
        .map((line) => {
            const [left, ...rest] = line.split("=");
            const right = rest.join("=").trim();
            const path = left.trim().split(".");
            switch (path[0]) {
                case "screen": {
                    const name = path[1] ?? "main";
                    screens[name] = {
                        ...(screens[name] ?? { columns: 2, children: [] }),
                        ...parseScreen(path, right, parsedOptions),
                    };
                    break;
                }
                case "profile": {
                    const name = path[1];
                    profiles[name] = parseProfileSettings(right);
                    break;
                }
                case "sliders": {
                    sliders = [...sliders, ...right.split(/\s+/g)];
                    break;
                }
                case "extra": {
                    switch (path[1]) {
                        case "identifier": {
                            if (!checkIfIdentifierIsCorrect(right)) {
                                console.warn("Identifier is incorrect");
                                break;
                            }
                            identifier = right;
                            break;
                        }
                        case "colorScheme": {
                            colorScheme = right;
                            break;
                        }
                        case "colors": {
                            const name = path[2];
                            const option = colors[name] ?? {
                                format: "separate",
                            };
                            colors[name] = parseColorOption(
                                path,
                                right,
                                option,
                                colorReplaceMap,
                            );
                            option;
                            break;
                        }
                        case "hidden": {
                            const name = path[2];
                            hiddenOptions[name] = right;
                            break;
                        }
                        case "removeEmptyAfter": {
                            const screenName = path[2];
                            const options = right.split(/\s+/g);
                            removeEmptyAfter[screenName] = [
                                ...(removeEmptyAfter[screenName] ?? []),
                                ...options,
                            ];
                            break;
                        }
                        case "removeEmptyBefore": {
                            const screenName = path[2];
                            const options = right.split(/\s+/g);
                            removeEmptyBefore[screenName] = [
                                ...(removeEmptyBefore[screenName] ?? []),
                                ...options,
                            ];
                            break;
                        }
                        case "append": {
                            const screenName = path[2];
                            const index = parseInt(path[3]);
                            appends.push({
                                screenName,
                                index,
                                options: right,
                            });
                            break;
                        }
                        case "range": {
                            const option = path[2];
                            if (!(option in ranges)) {
                                ranges[option] = {
                                    min: -1,
                                    max: -1,
                                    step: 0.0001,
                                    growth: GrowthType.Linear,
                                };
                            }
                            if (!sliders.includes(option)) {
                                sliders.push(option);
                            }
                            switch (path[3]) {
                                case "min":
                                case "max":
                                case "step":
                                    ranges[option][path[3]] = parseFloat(right);
                                    break;
                                case "growth":
                                    ranges[option][path[3]] =
                                        right as GrowthType;
                            }
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

    // Validate colors
    Object.entries(colors).forEach(([name, color]) => {
        if (color.red === undefined && color.color === undefined) {
            console.warn(`Option values for ${name} are not defined`);
            delete colors[name];
            return;
        }
        if (
            (color.format === "separate" || color.format === "separate_255") &&
            color.red === undefined
        ) {
            console.warn(`Color format doesn't match for ${name}`);
            delete colors[name];
            return;
        }
        if (
            (color.format === "combined" || color.format === "combined_255") &&
            color.color === undefined
        ) {
            console.warn(`Color format doesn't match for ${name}`);
            delete colors[name];
            return;
        }
    });

    Object.entries(removeEmptyAfter).forEach(([screenName, options]) => {
        const screen = screens[screenName];

        for (let i = screen.children.length - 1; i > 0; i--) {
            const prev = screen.children[i - 1];
            if (screen.children[i].type !== "empty" || prev.type !== "option")
                continue;

            if (options.includes(prev.name)) {
                screen.children.splice(i, 1);
            }
        }
    });

    Object.entries(removeEmptyBefore).forEach(([screenName, options]) => {
        const screen = screens[screenName];
        for (let i = screen.children.length - 2; i >= 0; i--) {
            const next = screen.children[i + 1];
            if (screen.children[i].type !== "empty" || next.type !== "option")
                continue;

            if (options.includes(next.name)) {
                screen.children.splice(i, 1);
            }
        }
    });

    // Replace the components of color options
    Object.values(screens).forEach((screen) => {
        screen.children = screen.children
            .map((child) => {
                if (child.type !== "option") return child;

                if (child.name in hiddenOptions) return null;
                if (!colorReplaceMap.has(child.name)) return child;

                const replaceBy = colorReplaceMap.get(child.name)!;
                if (replaceBy === null) return null;

                return {
                    type: "color",
                    name: replaceBy,
                };
            })
            .filter((child) => child !== null) as ScreenElement[];
    });

    for (const profile in profiles) {
        profiles[profile] = flattenSettings(profiles[profile], profiles);
    }

    appends.forEach(({ screenName, index, options }) => {
        const screen = screens[screenName];
        screen.children.splice(index, 0, ...parseScreenElements(options));
    });

    if (Object.keys(screens).length === 0) {
        screens.main = {
            columns: 3,
            children: Object.keys(parsedOptions).map((name) => {
                return {
                    type: "option",
                    name,
                };
            }),
        };
    }

    return {
        screens,
        profiles: profiles as Profiles,
        colors,
        sliders,
        special,
        hiddenOptions,
        identifier,
        colorScheme,
        ranges,
    };
}
