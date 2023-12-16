import { Setter, Show, createEffect, createSignal } from "solid-js";
import Icon from "../components/Icon";
import { Lang } from "./languages";
import { Options } from "./options";
import { Screens } from "./properties";

interface Props {
    options: Options;
    screens: Screens;
    lang: Lang;
    setScreenStack: Setter<string[]>;
    setHighlight: Setter<string>;
}

function findShortestPath(
    source: string,
    target: string,
    graph: Screens,
    path: string[] = [],
): string[] | null {
    const totalPath = [...path, source];
    const possiblePaths = graph[source].children
        .map((child) => {
            if (child.type !== "link" || path.includes(child.name)) return null;
            if (child.name === target) return [...totalPath, child.name];
            return findShortestPath(child.name, target, graph, totalPath);
        })
        .filter((child) => child !== null) as string[][];

    if (possiblePaths.length === 0) return null;
    return possiblePaths.sort((a, b) => a.length - b.length)[0];
}

export default function SearchField(props: Props) {
    const [possibleOptions, setPossibleOptions] = createSignal<
        [string, string][]
    >([]);
    const [selectedIndex, setSelectedIndex] = createSignal(0);

    const updateSearch = (value: string) => {
        if (value.length === 0) {
            setSelectedIndex(0);
            setPossibleOptions([]);
            return;
        }
        value = value.toLowerCase();
        const possibleLangValues = Object.entries(props.lang.option)
            .filter(
                ([key, langValue]) =>
                    key.toLowerCase().includes(value) ||
                    langValue.text.toLowerCase().includes(value),
            )
            .map(([key]) => key);

        const options = Object.entries(props.screens)
            .map(([screenName, screen]) =>
                screen.children
                    .map((child) => {
                        if (child.type === "empty" || child.type === "profile")
                            return "";
                        return child.name;
                    })
                    .filter((name) => possibleLangValues.includes(name))
                    .map((name) => [screenName, name] as [string, string]),
            )
            .flat();
        setPossibleOptions(options);
        setSelectedIndex(0);
    };

    const changeSelectedIndex = (delta: number) => {
        let newIndex = selectedIndex() + delta;
        const count = possibleOptions().length;
        newIndex = ((newIndex % count) + count) % count;
        setSelectedIndex(newIndex);
    };

    createEffect(() => {
        const options = possibleOptions();
        if (options.length === 0) {
            props.setScreenStack(["main"]);
            return;
        }
        const [screenName, optionName] = options[selectedIndex()];
        const path = findShortestPath("main", screenName, props.screens);
        if (path === null) {
            changeSelectedIndex(1);
            return;
        }

        props.setScreenStack(path);
        props.setHighlight(optionName);
    });

    return (
        <div class="relative flex items-center">
            <input
                type="text"
                class="w-full border-2 border-primary-600 bg-primary-950 p-2 text-lg text-primary-400 outline-none"
                placeholder="Search options"
                onInput={(e) => updateSearch(e.currentTarget.value)}
            />
            <div class="absolute right-2 flex h-full items-center">
                <Show when={possibleOptions().length > 0}>
                    <button
                        class="flex items-center text-primary-400"
                        onClick={() => changeSelectedIndex(-1)}
                    >
                        <Icon icon="chevron_left" />
                    </button>
                    <span class="text-lg text-primary-400">
                        {selectedIndex() + 1} / {possibleOptions().length}
                    </span>
                    <button
                        class="flex items-center text-primary-400"
                        onClick={() => changeSelectedIndex(1)}
                    >
                        <Icon icon="chevron_right" />
                    </button>
                </Show>
            </div>
        </div>
    );
}
