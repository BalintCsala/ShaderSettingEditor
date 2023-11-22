import { Show, createSignal } from "solid-js";
import AboutButton from "./AboutButton";
import Icon from "./components/Icon";
import ShaderEditor from "./editor/ShaderEditor";
import SupportButton from "./SupportButton";

export default function App() {
    const [file, setFile] = createSignal<File | null>(null);
    const [fileOver, setFileOver] = createSignal(false);

    const fileUpload = (
        <input
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            class="hidden"
            type="file"
            accept=".zip"
        />
    ) as HTMLInputElement;

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
                onDrop={e => {
                    e.preventDefault();
                    const item = e.dataTransfer?.items[0];
                    if (!item || item.kind !== "file") return;

                    setFile(item.getAsFile());
                }}
                onDragOver={e => {
                    setFileOver(true);
                    e.preventDefault();
                }}
                onDragLeave={() => setFileOver(false)}
                class="relative flex w-full grow flex-col overflow-y-hidden border-2 border-primary-600">
                <Show
                    when={file()}
                    fallback={
                        <div class="flex h-full w-full items-center justify-center">
                            <Show
                                when={!fileOver()}
                                fallback={
                                    <div class="pointer-events-none text-primary-400">
                                        Release to upload
                                    </div>
                                }>
                                <button
                                    onClick={() => fileUpload.click()}
                                    class="flex flex-col items-center border-4 border-dotted border-primary-600 bg-primary-950 p-8 transition-colors hover:bg-primary-900">
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
                    }>
                    {file => <ShaderEditor file={file()} />}
                </Show>
                <div class="overlay hidden" />
            </main>
        </div>
    );
}
