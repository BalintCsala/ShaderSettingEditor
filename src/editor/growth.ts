export enum GrowthType {
    Logarithmic = "logarithmic",
    SquareRoot = "square_root",
    Linear = "linear",
    Quadratic = "quadratic",
    Exponential = "exponential",
}

const funcMapping = {
    [GrowthType.Logarithmic]: {
        func: (value: number) => Math.log(value),
        inv: (value: number) => Math.exp(value),
    },
    [GrowthType.SquareRoot]: {
        func: (value: number) => Math.sqrt(value),
        inv: (value: number) => Math.pow(value, 2),
    },
    [GrowthType.Linear]: {
        func: (value: number) => value,
        inv: (value: number) => value,
    },
    [GrowthType.Quadratic]: {
        func: (value: number) => Math.pow(value, 2),
        inv: (value: number) => Math.sqrt(value),
    },
    [GrowthType.Exponential]: {
        func: (value: number) => Math.exp(value),
        inv: (value: number) => Math.log(value),
    },
};

export function interpolateWithGrowth(
    type: GrowthType,
    min: number,
    max: number,
    step: number,
    value: number,
) {
    const mapping = funcMapping[type];
    const rawRes = mapping.func(
        mapping.inv(min) * (1 - value) + mapping.inv(max) * value,
    );
    return Math.round(rawRes / step) * step;
}

export function getPercentageWithGrowth(
    type: GrowthType,
    min: number,
    max: number,
    value: number,
) {
    const mapping = funcMapping[type];
    return (
        (mapping.inv(value) - mapping.inv(min)) /
        (mapping.inv(max) - mapping.inv(min))
    );
}
