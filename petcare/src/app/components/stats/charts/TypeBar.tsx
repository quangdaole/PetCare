"use client";

import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { TrackingEntry, TrackingType } from "../../pet-tracking/types";

type Props = { entries: TrackingEntry[] };

export default function TypeBar({ entries }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(640);
  const height = 260;
  const margin = { top: 12, right: 16, bottom: 40, left: 40 };

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((ents) => {
      for (const e of ents) setWidth(Math.max(320, Math.floor(e.contentRect.width)));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => {
    const counts = d3.rollup(
      entries,
      (v) => v.length,
      (d) => d.type
    );
    const rows = Array.from(counts, ([type, count]) => ({ type, count })) as { type: TrackingType; count: number }[];
    rows.sort((a, b) => d3.descending(a.count, b.count));
    return rows;
  }, [entries]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.selectAll<SVGGElement, unknown>("g.root").data([null]);
    const gEnter = g.enter().append("g").attr("class", "root");
    gEnter.merge(g as any).attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.type))
      .range([0, innerW])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)! || 1])
      .nice()
      .range([innerH, 0]);

    const gx = gEnter.selectAll<SVGGElement, unknown>("g.x").data([null]);
    gx.enter().append("g").attr("class", "x").merge(gx as any)
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-0.5em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-30)");

    const gy = gEnter.selectAll<SVGGElement, unknown>("g.y").data([null]);
    gy.enter().append("g").attr("class", "y").merge(gy as any)
      .call(d3.axisLeft(y).ticks(5));

    const bars = gEnter.selectAll<SVGRectElement, any>("rect.bar").data(data, (d: any) => d.type);
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.type)!)
      .attr("y", innerH)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", "currentColor")
      .merge(bars as any)
      .transition()
      .attr("x", (d) => x(d.type)!)
      .attr("y", (d) => y(d.count))
      .attr("height", (d) => innerH - y(d.count))
      .attr("width", x.bandwidth());

    bars.exit().remove();

    const labels = gEnter.selectAll<SVGTextElement, any>("text.bar-label").data(data, (d: any) => d.type);
    labels.enter()
      .append("text")
      .attr("class", "bar-label text-xs")
      .attr("text-anchor", "middle")
      .merge(labels as any)
      .attr("x", (d) => (x(d.type)! + x.bandwidth() / 2))
      .attr("y", (d) => y(d.count) - 6)
      .text((d) => d.count)
      .attr("fill", "currentColor");
    labels.exit().remove();
  }, [data, width, height, margin.left, margin.right, margin.top, margin.bottom]);

  return (
    <div ref={wrapRef}>
      <svg ref={svgRef} className="w-full h-[260px] text-blue-700" />
    </div>
  );
}
