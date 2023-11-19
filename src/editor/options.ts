import JSZip from "jszip";

export interface TextOption {
    type: "text";
    values: string[];
    value: string;
    description: string;
}

export interface BooleanOption {
    type: "boolean";
    description: string;
    value: boolean;
}

export type Option = TextOption | BooleanOption;

export type Options = { [key: string]: Option };

const booleanOptionOff = /\/\/\s*#define\s*(\w+)(?:\s*\/\/\s*(.+))?$/;
const booleanOptionOn = /^\s*#define\s*(\w+)(?:\s*\/\/\s*(.+))?$/;
const textOption = /^#define\s*(\S+)\s*(\S+)\s*\/\/\s*(.+)\[([^[]+)]/;

const booleanOptionOffConst = /^const\s*\S+\s*(\S+)\s*=\s*false;(?:\s*\/\/\s*([^[]+))?$/;
const booleanOptionOnConst = /^const\s*\S+\s*(\S+)\s*=\s*true;(?:\s*\/\/\s*([^[]+))?$/;
const textOptionConst = /^const\s*\S+\s*(\S+)\s*=\s*([^;]+);\s*\/\/\s*([^[]+)\[(.+)\]/;

export async function parseOptions(zip: JSZip) {
    const files = Object.entries(zip.files);

    const options: Options = {};
    await Promise.all(
        files.map(async ([, file]) => {
            const content = await file.async("text");
            content.split("\n").forEach(line => {
                line = line.trim();
                let match: RegExpMatchArray | null = line.match(booleanOptionOff) ?? line.match(booleanOptionOffConst);
                if (match) {
                    const [, name, description] = match;
                    options[name] = {
                        type: "boolean",
                        value: false,
                        description: description ?? "",
                    };
                    return;
                }

                match = line.match(booleanOptionOn) ?? line.match(booleanOptionOnConst);
                if (match) {
                    const [, name, description] = match;
                    options[name] = {
                        type: "boolean",
                        value: true,
                        description: description ?? "",
                    };
                    return;
                }

                match = line.match(textOption) ?? line.match(textOptionConst);
                if (match) {
                    const [, name, defaultValue, description, values] = match;
                    options[name] = {
                        type: "text",
                        value: defaultValue,
                        values: values.split(" "),
                        description: description,
                    };
                    return;
                }
            });
        }),
    );

    return options;
}
