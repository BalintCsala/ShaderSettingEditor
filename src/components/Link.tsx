import { JSX } from "solid-js/jsx-runtime";

interface Props {
    children: JSX.Element;
    url: string;
}

export default function Link(props: Props) {
    return (
        <a
            href={props.url}
            class="text-purple-600 underline hover:text-purple-700">
            {props.children}
        </a>
    );
}
