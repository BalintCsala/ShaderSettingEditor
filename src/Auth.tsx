import { Show } from "solid-js";

export default function Auth() {
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get("error");
    const description = searchParams.get("description");
    const uid = searchParams.get("uid");

    if (uid) {
        window.opener.postMessage({ uid });
    }

    return (
        <main class="flex h-screen w-screen items-center justify-center">
            <div class="m-8 max-w-lg border-2 border-primary-600 p-12 text-center">
                <Show
                    when={!error}
                    fallback={
                        <>
                            <h1 class="mb-4 text-3xl text-primary-400">
                                Error
                            </h1>
                            <span class="text-primary-400">{description}</span>
                        </>
                    }
                >
                    <h1 class="mb-4 text-3xl text-primary-400">Success</h1>
                    <span class="text-primary-400">
                        This page will close in a couple of seconds...
                    </span>
                </Show>
            </div>
        </main>
    );
}
