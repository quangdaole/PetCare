"use client";

import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { TrackingEntry } from "../../pet-tracking/types";

type Props = { entries: TrackingEntry[]; days: number };

export default function ActivityChart({ entries, days }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(640);
  const height = 260;
  const margin = { top: 12, right: 16, bottom: 28, left: 40 };

  // Resize
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setWidth(Math.max(320, Math.floor(e.contentRect.width)));
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Data: bucket by day
  const series = useMemo(() => {
    const now = new Date();
    const start = d3.timeDay.offset(d3.timeDay(now), -days + 1);
    const daysArr = d3.timeDay.range(start, d3.timeDay.offset(now, 1));

    const counts = new Map(daysArr.map((d) => [d3.timeFormat("%Y-%m-%d")(d), 0]));
    for (const e of entries) {
      const key = d3.timeFormat("%Y-%m-%d")(new Date(e.dateISO));
      if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
    }
    return daysArr.map((d) => ({ date: d, value: counts.get(d3.timeFormat("%Y-%m-%d")(d)) || 0 }));
  }, [entries, days]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.selectAll<SVGGElement, unknown>("g.root").data([null]);
    const gEnter = g.enter().append("g").attr("class", "root");
    gEnter.merge(g as any).attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(series, (d) => d.date) as [Date, Date])
      .range([0, innerW]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(series, (d) => d.value)! || 1])
      .nice()
      .range([innerH, 0]);

    // axes
    const gx = gEnter.selectAll<SVGGElement, unknown>("g.x").data([null]);
    gx.enter().append("g").attr("class", "x").merge(gx as any)
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(Math.min(6, series.length)).tickFormat(d3.timeFormat("%m/%d") as any));

    const gy = gEnter.selectAll<SVGGElement, unknown>("g.y").data([null]);
    gy.enter().append("g").attr("class", "y").merge(gy as any)
      .call(d3.axisLeft(y).ticks(5));

    // line
    const line = d3.line<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.value));

    const path = gEnter.selectAll<SVGPathElement, unknown>("path.line").data([series]);
    path.enter()
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .merge(path as any)
      .attr("d", line as any)
      .attr("stroke", "currentColor");

    // dots (for simple tooltip via title)
    const dots = gEnter.selectAll<SVGCircleElement, any>("circle.dot").data(series);
    dots.enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .merge(dots as any)
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.value))
      .append("title")
      .text((d) => `${d3.timeFormat("%b %d")(d.date)}: ${d.value}`);
    dots.exit().remove();
  }, [series, width, height, margin.left, margin.right, margin.top, margin.bottom]);

  return (
    <div ref={wrapRef}>
      <svg ref={svgRef} className="w-full h-[260px] text-blue-700" />
    </div>
  );
}
