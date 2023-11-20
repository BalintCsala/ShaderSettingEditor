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

const RECOGNIZED_CONST_VARIABLES = [
    "shadowMapResolution",
    "shadowDistance",
    "shadowDistanceRenderMul",
    "shadowIntervalSize",
    "generateShadowMipmap",
    "generateShadowColorMipmap",
    "shadowHardwareFiltering",
    "shadowHardwareFiltering0",
    "shadowHardwareFiltering1",
    "shadowtex0Mipmap",
    "shadowtexMipmap",
    "shadowtex1Mipmap",
    "shadowcolor0Mipmap",
    "shadowColor0Mipmap",
    "shadowcolor1Mipmap",
    "shadowColor1Mipmap",
    "shadowtex0Nearest",
    "shadowtexNearest",
    "shadow0MinMagNearest",
    "shadowtex1Nearest",
    "shadow1MinMagNearest",
    "shadowcolor0Nearest",
    "shadowColor0Nearest",
    "shadowColor0MinMagNearest",
    "shadowcolor1Nearest",
    "shadowColor1Nearest",
    "shadowColor1MinMagNearest",
    "wetnessHalflife",
    "drynessHalflife",
    "eyeBrightnessHalflife",
    "centerDepthHalflife",
    "sunPathRotation",
    "ambientOcclusionLevel",
    "superSamplingLevel",
    "noiseTextureResolution",
];

function parseOption(line: string): { name: string; option: Option } | null {
    if (line.startsWith("//")) {
        // Boolean option, default off
        const [head, details] = line
            .substring(2)
            .trim()
            .split(/\/\//)
            .map(part => part.trim());
        const [, name] = head.replace("//", "").trim().split(/\s+/g);

        return {
            name,
            option: {
                type: "boolean",
                description: details,
                value: false,
            },
        };
    }

    const [head, details] = line.split(/\/\//).map(part => part.trim());

    if (line.startsWith("const")) {
        // Const option
        const [, , name, , value] = head.replace(";", "").split(/\s+/g);
        if (!RECOGNIZED_CONST_VARIABLES.includes(name)) return null;

        if (!details || !details.includes("[")) {
            // Values are optional
            return {
                name,
                option: {
                    type: "text",
                    description: details ?? "",
                    values: [value],
                    value,
                },
            };
        }

        const [description, valuesRaw] = details.replace("]", "").split("[");
        return {
            name,
            option: {
                type: "text",
                description,
                values: valuesRaw.split(/\s+/g),
                value,
            },
        };
    }

    const [, name, value] = head.split(/\s+/g);
    if (!value) {
        // Boolean option, default on
        return {
            name,
            option: {
                type: "boolean",
                description: details,
                value: true,
            },
        };
    }

    if (!details) {
        // I dub thee the Sasha setting
        return {
            name,
            option: {
                type: "text",
                description: "",
                values: [value],
                value,
            },
        };
    }

    if (!details.includes("[")) {
        // Values are optional
        return {
            name,
            option: {
                type: "text",
                description: details,
                values: [value],
                value,
            },
        };
    }

    const [description, valuesRaw] = details.replace("]", "").split("[");
    return {
        name,
        option: {
            type: "text",
            description,
            values: valuesRaw.split(/\s+/g),
            value,
        },
    };
}

export async function parseOptions(zip: JSZip) {
    const files = Object.entries(zip.files);

    const options: Options = {};
    await Promise.all(
        files.map(async ([, file]) => {
            const content = await file.async("text");
            content.split("\n").forEach(line => {
                if (!line.includes("#define") && !line.includes("const")) return;
                line = line.trim();
                const parsed = parseOption(line);
                if (parsed === null) {
                    return;
                }
                const { name, option } = parsed;
                options[name] = option;
            });
        }),
    );

    return options;
}
