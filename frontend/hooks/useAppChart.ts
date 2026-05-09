import { Chart } from "chart.js";
import { useEffect } from "react";

export function useChart(
    ref: React.RefObject<HTMLCanvasElement>,
    config: () => ConstructorParameters<typeof Chart>[1],
    deps: any[] = [] 
) {
    useEffect(() => {
        if (!ref.current) return;

        const chart = new Chart(ref.current, config());

        return () => chart.destroy();
    }, deps);
}