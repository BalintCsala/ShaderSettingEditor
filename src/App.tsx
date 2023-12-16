import { Show, createSignal } from "solid-js";
import AboutButton from "./AboutButton";
import Icon from "./components/Icon";
import ShaderEditor from "./editor/ShaderEditor";
import SupportButton from "./SupportButton";
import {
    ProjectionVersionData,
    fetchProjectData,
    fetchProjectVersions,
} from "./modrinth";
import JSZip from "jszip";

export default function App() {
    const [zipPromise, setZipPromise] = createSignal<Promise<JSZip> | null>(
        null,
    );
    const [fileName, setFileName] = createSignal("");
    const [fileOver, setFileOver] = createSignal(false);

    const fileUpload = (
        <input
            onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                setZipPromise(JSZip.loadAsync(file));
            }}
            class="hidden"
            type="file"
            accept=".zip"
        />
    ) as HTMLInputElement;

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("shader")) {
        const tryLoadShader = () => {
            setZipPromise(async () => {
                const slug = searchParams.get("shader")!;
                const projectData = await fetchProjectData(slug);
                if (projectData.project_type !== "shader") {
                    throw new Error("Not a shader");
                }

                const versions = await fetchProjectVersions(slug);
                let version: ProjectionVersionData;
                if (searchParams.has("version")) {
                    const versionNumber = searchParams.get("version");
                    version = versions.find(
                        (v) => v.version_number === versionNumber,
                    )!;
                } else {
                    version = versions[0];
                }
                const file = version.files.find((file) => file.primary)!;
                console.log(version.version_number);

                const blob = await fetch(file.url).then((r) => r.blob());
                setFileName(file.filename);
                return await JSZip.loadAsync(blob);
            });
        };
        tryLoadShader();
    }
    return (
        <div class="flex h-screen w-screen max-w-6xl flex-col items-center p-4 text-4xl">
            <header class="mb-4 flex w-full justify-between text-left">
                <span class="hidden text-primary-400 md:inline">
                    Extra shader editor
                </span>
                <div class="flex w-full justify-between gap-2 md:w-auto">
                    <SupportButton />
                    <AboutButton />
                </div>
            </header>
            <main
                onDrop={(e) => {
                    e.preventDefault();
                    const item = e.dataTransfer?.items[0];
                    if (!item || item.kind !== "file") return;

                    const file = item.getAsFile();
                    if (!file) return;
                    setFileName(file.name);
                    setZipPromise(JSZip.loadAsync(file));
                }}
                onDragOver={(e) => {
                    setFileOver(true);
                    e.preventDefault();
                }}
                onDragLeave={() => setFileOver(false)}
                class="relative flex w-full grow flex-col gap-2 overflow-y-hidden border-2 border-primary-600 p-2"
            >
                <Show
                    when={zipPromise()}
                    fallback={
                        <div class="flex h-full w-full items-center justify-center">
                            <Show
                                when={!fileOver()}
                                fallback={
                                    <div class="pointer-events-none text-primary-400">
                                        Release to upload
                                    </div>
                                }
                            >
                                <button
                                    onClick={() => fileUpload.click()}
                                    class="flex flex-col items-center border-4 border-dotted border-primary-600 bg-primary-950 p-8 transition-colors hover:bg-primary-900"
                                >
                                    <Icon
                                        icon="upload"
                                        class="text-9xl text-primary-400"
                                    />
                                    <span class="text-primary-400">
                                        Select a shader
                                    </span>
                                    {fileUpload}
                                </button>
                            </Show>
                        </div>
                    }
                >
                    {(promise) => (
                        <ShaderEditor
                            zipPromise={promise()}
                            fileName={fileName()}
                        />
                    )}
                </Show>
                <div class="overlay hidden" />
            </main>
        </div>
    );
}
