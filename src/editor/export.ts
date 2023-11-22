import { Options } from "./options";

export function exportOptions(options: Options, filename: string) {
    const settingsContent = Object.entries(options)
        .map(([name, option]) => {
            switch (option.type) {
                case "boolean": {
                    return `${name}=${option.value ? "true" : "false"}`;
                }
                case "text": {
                    return `${name}=${option.value}`;
                }
            }
        })
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute(
        "href",
        `data:text/plain;charset=utf-8,${encodeURIComponent(settingsContent)}`,
    );
    link.setAttribute("download", `${filename}.txt`);
    link.click();
}
