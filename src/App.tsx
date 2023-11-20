import { Show, createSignal } from "solid-js";
import AboutButton from "./AboutButton";
import Icon from "./Icon/Icon";
import ShaderEditor from "./editor/ShaderEditor";

export default function App() {
    const [file, setFile] = createSignal<File | null>(null);

    const fileUpload = (<input onChange={e => setFile(e.target.files?.[0] ?? null)} class="hidden" type="file" accept=".zip" />) as HTMLInputElement;

    return (
        <div class="flex h-screen w-screen max-w-6xl flex-col items-center p-4 text-4xl">
            <header class="relative mb-4 w-full text-center">
                <span class="text-emerald-600">Extra shader editor</span>
                <AboutButton />
            </header>
            <main class="relative flex w-full grow flex-col border-2 border-emerald-600">
                <Show
                    when={file()}
                    fallback={
                        <div class="flex h-full w-full items-center justify-center">
                            <button
                                onClick={() => fileUpload.click()}
                                class="flex flex-col items-center border-4 border-dotted border-emerald-600 bg-emerald-950 p-8 transition-colors hover:bg-emerald-900">
                                <Icon icon="upload" class="text-9xl text-emerald-600" />
                                <span class="text-emerald-600">Select a file</span>
                                {fileUpload}
                            </button>
                        </div>
                    }>
                    {file => <ShaderEditor file={file()} />}
                </Show>
                <div class="overlay hidden" />
            </main>
        </div>
    );
}
