import { createEffect, createSignal, onCleanup } from "solid-js";

interface Color {
    red: number;
    green: number;
    blue: number;
}

interface Props {
    color: Color;
    onChange: (color: Color) => void;
    class?: string;
}

function rgbToHsv(color: Color) {
    const maxComponent = Math.max(color.red, color.green, color.blue),
        difference = maxComponent - Math.min(color.red, color.green, color.blue);
    const hue =
        difference &&
        (maxComponent == color.red
            ? (color.green - color.blue) / difference
            : maxComponent == color.green
            ? 2 + (color.blue - color.red) / difference
            : 4 + (color.red - color.green) / difference);
    return { hue: 60 * (hue < 0 ? hue + 6 : hue), saturation: maxComponent && difference / maxComponent, value: maxComponent };
}
function hsvToRgb(hue: number, saturation: number, value: number) {
    const f = (n: number, k = (n + hue / 60) % 6) => value - value * saturation * Math.max(Math.min(k, 4 - k, 1), 0);
    return { red: f(5), green: f(3), blue: f(1) };
}

export default function ColorSelector(props: Props) {
    const [mainActive, setMainActive] = createSignal(false);
    const [barActive, setBarActive] = createSignal(false);

    const handleSelection = (e: MouseEvent, canvas: HTMLCanvasElement) => {
        if (!mainActive() && !barActive) return;
        const rect = canvas.getBoundingClientRect();
        const relativeX = Math.min(Math.max(e.clientX - rect.x, 0), rect.width);
        const relativeY = Math.min(Math.max(e.clientY - rect.y, 0), rect.height);

        if (mainActive()) {
            const { value } = rgbToHsv(props.color);
            const hue = (relativeX / rect.width) * 359;
            const saturation = 1 - relativeY / rect.height;
            props.onChange(hsvToRgb(hue, saturation, value));
        } else if (barActive()) {
            const { hue, saturation } = rgbToHsv(props.color);
            const value = 1 - relativeY / rect.height;
            props.onChange(hsvToRgb(hue, saturation, value));
        }
    };

    const canvas = (
        <canvas
            class="border-2 border-white"
            onMouseDown={e => {
                setMainActive(true);
                handleSelection(e, canvas);
            }}
        />
    ) as HTMLCanvasElement;
    const barCanvas = (
        <canvas
            class="border-2 border-white"
            onMouseDown={e => {
                setBarActive(true);
                handleSelection(e, barCanvas);
            }}
        />
    ) as HTMLCanvasElement;

    const onBlur = () => {
        setMainActive(false);
        setBarActive(false);
    };
    const onMouseMove = (e: MouseEvent) => handleSelection(e, canvas);

    document.addEventListener("blur", onBlur);
    document.addEventListener("mouseup", onBlur);

    document.addEventListener("mousemove", onMouseMove);

    onCleanup(() => {
        document.removeEventListener("blur", onBlur);
        document.removeEventListener("mouseup", onBlur);

        document.removeEventListener("mousemove", onMouseMove);
    });

    createEffect(() => {
        const { hue, saturation, value } = rgbToHsv(props.color);
        const width = 144;
        const height = 144;

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        {
            const ctx = canvas.getContext("2d")!;
            const imageData = ctx.createImageData(width, height);

            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    const hue = (x / width) * 360;
                    const saturation = 1 - y / height;
                    const { red, green, blue } = hsvToRgb(hue, saturation, value);
                    imageData.data[(x + y * width) * 4 + 0] = Math.round(red * 255);
                    imageData.data[(x + y * width) * 4 + 1] = Math.round(green * 255);
                    imageData.data[(x + y * width) * 4 + 2] = Math.round(blue * 255);
                    imageData.data[(x + y * width) * 4 + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);

            const x = (hue / 360) * width;
            const y = (1 - saturation) * height;

            ctx.beginPath();
            ctx.moveTo(x, y - 9);
            ctx.lineTo(x, y + 9);
            ctx.moveTo(x - 9, y);
            ctx.lineTo(x + 9, y);
            ctx.lineWidth = 5;
            ctx.strokeStyle = "white";
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y - 8);
            ctx.lineTo(x, y + 8);
            ctx.moveTo(x - 8, y);
            ctx.lineTo(x + 8, y);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
        barCanvas.width = 16;
        barCanvas.height = height;
        barCanvas.style.width = "16px";
        barCanvas.style.height = `${height}px`;

        {
            const ctx = barCanvas.getContext("2d")!;
            const imageData = ctx.createImageData(16, height);

            for (let x = 0; x < 16; x++) {
                for (let y = 0; y < height; y++) {
                    const value = 1 - y / height;
                    const { red, green, blue } = hsvToRgb(hue, saturation, value);
                    imageData.data[(x + y * 16) * 4 + 0] = Math.round(red * 255);
                    imageData.data[(x + y * 16) * 4 + 1] = Math.round(green * 255);
                    imageData.data[(x + y * 16) * 4 + 2] = Math.round(blue * 255);
                    imageData.data[(x + y * 16) * 4 + 3] = 255;
                }
            }
            ctx.putImageData(imageData, 0, 0);
            const y = (1 - value) * height;
            ctx.beginPath();
            ctx.rect(0, y - 3, 16, 6);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "white";
            ctx.stroke();

            ctx.beginPath();
            ctx.rect(0, y - 2, 16, 4);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
    });

    return (
        <div class={props.class} onClick={e => e.stopImmediatePropagation()}>
            <div class="flex gap-4">
                {canvas}
                {barCanvas}
            </div>
        </div>
    );
}
