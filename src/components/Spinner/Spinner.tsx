/* eslint-disable tailwindcss/no-custom-classname */
import style from "./Spinner.module.css";

interface Props {
    class?: string;
}

export default function Spinner(props: Props) {
    return (
        <div class={props.class ?? ""}>
            <div class="relative h-[2.75em] w-[4.75em]">
                <div
                    class={`${style.card} absolute h-[0.5em] w-[2em] bg-primary-600`}
                />
                <div
                    class={`${style.card} absolute h-[0.5em] w-[2em] bg-primary-600`}
                />
                <div
                    class={`${style.card} absolute h-[0.5em] w-[2em] bg-primary-600`}
                />
                <div
                    class={`${style.card} absolute h-[0.5em] w-[2em] bg-primary-600`}
                />
            </div>
        </div>
    );
}
