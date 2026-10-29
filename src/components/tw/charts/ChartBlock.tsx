import { Chart as ChartJS } from "chart.js";
import { ReactNode, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface ChartBlockProps {
  title: string;
  /** Defaults to the title. Pass a fuller sentence when the title is terse. */
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  chartClassName?: string;
}

/*
 * Charts carry no card chrome. The surface is the page, the title names the
 * chart, and separation comes from rhythm — wrapping every one in the same
 * rounded box is what makes a statistics screen read as a template.
 *
 * The resize pass exists because a chart that mounts inside a tab can measure
 * its container before the tab has been laid out, leaving a doughnut with a
 * zero-width canvas until the window is resized. One frame later we ask the
 * chart to measure again.
 */
export const ChartBlock = ({ title, ariaLabel, children, className, chartClassName }: ChartBlockProps) => {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let lastWidth = 0;
    let lastHeight = 0;

    const resizeChart = () => {
      const canvas = frame.querySelector("canvas");
      if (!canvas) return;

      const width = frame.clientWidth;
      const height = frame.clientHeight;
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;

      const chart = ChartJS.getChart(canvas);
      if (!chart) return;

      chart.resize();
      chart.update("none");
    };

    let cancelled = false;
    let secondFrame = 0;

    const firstFrame = requestAnimationFrame(() => {
      resizeChart();
      secondFrame = requestAnimationFrame(() => {
        if (!cancelled) resizeChart();
      });
    });

    const observer = new ResizeObserver(resizeChart);
    observer.observe(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      observer.disconnect();
    };
  }, []);

  return (
    <section className={cn("min-w-0", className)}>
      <h3 className="mb-3 text-step-2 font-medium">{title}</h3>

      <div
        ref={frameRef}
        role="img"
        aria-label={ariaLabel ?? title}
        className={cn("relative h-64", chartClassName)}
      >
        {children}
      </div>
    </section>
  );
};
