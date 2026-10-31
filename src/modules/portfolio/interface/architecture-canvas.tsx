"use client";

import {
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type OnNodesChange,
} from "@xyflow/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { AtlasPresentation } from "../domain/architecture-atlas";
import "@xyflow/react/dist/style.css";

type AtlasNodeData = {
  title: string;
  kicker: string;
  dimmed: boolean;
  selected: boolean;
};

type AtlasFlowNode = Node<AtlasNodeData, "atlas">;

const nodeTypes = { atlas: AtlasNodeView };

export function ArchitectureCanvas({
  presentation,
  onSelect,
}: {
  presentation: AtlasPresentation;
  onSelect: (id: string) => void;
}) {
  return (
    <ReactFlowProvider>
      <Canvas presentation={presentation} onSelect={onSelect} />
    </ReactFlowProvider>
  );
}

function Canvas({
  presentation,
  onSelect,
}: {
  presentation: AtlasPresentation;
  onSelect: (id: string) => void;
}) {
  const reduce = useReducedMotion() === true;
  const frameRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const nodes = useMemo<AtlasFlowNode[]>(
    () =>
      presentation.nodes.map((node) => ({
        id: node.id,
        type: "atlas",
        position: positions[node.id] ?? { x: node.column * 320, y: node.row * 170 },
        width: 200,
        height: 58,
        data: { title: node.title, kicker: node.kicker, dimmed: node.dimmed, selected: node.selected },
        draggable: true,
      })),
    [presentation.nodes, positions],
  );
  const edges = useMemo<Edge[]>(() => {
    const byId = new Map(presentation.nodes.map((node) => [node.id, node]));
    return presentation.relations.flatMap((relation) => {
      const from = byId.get(relation.from);
      const to = byId.get(relation.to);
      if (!from || !to) {
        return [];
      }
      if (from.row === to.row && Math.abs(from.column - to.column) > 1) {
        return [];
      }
      const ports = portsBetween(from.column, from.row, to.column, to.row);
      const color = relation.kind === "forbids" ? "#9d1c24" : "#241c1c";
      return [
        {
          id: relation.id,
          source: relation.from,
          target: relation.to,
          sourceHandle: ports.source,
          targetHandle: ports.target,
          label: relation.label,
          type: Math.abs(to.column - from.column) > Math.abs(to.row - from.row) ? "straight" : "smoothstep",
          animated: false,
          style: {
            stroke: color,
            strokeWidth: relation.dimmed ? 1.25 : 1.75,
            opacity: relation.dimmed ? 0.55 : 1,
            strokeDasharray: relation.kind === "forbids" ? "5 5" : undefined,
          },
          labelStyle: { fill: "#5e564f", fontSize: 10 },
          labelBgStyle: { fill: "#f3efe8" },
          markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
        },
      ];
    });
  }, [presentation.nodes, presentation.relations]);

  const onNodesChange: OnNodesChange<AtlasFlowNode> = (changes) => {
    setPositions((current) => {
      let next = current;
      for (const change of changes) {
        if (change.type === "position" && change.position && typeof change.id === "string") {
          const previous = next[change.id];
          if (previous && previous.x === change.position.x && previous.y === change.position.y) {
            continue;
          }
          next = { ...next, [change.id]: change.position };
        }
      }
      return next;
    });
  };

  return (
    <div ref={frameRef} className="atlas relative h-full bg-paper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => onSelect(node.id)}
        fitView
        nodesConnectable={false}
        elementsSelectable
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch
        minZoom={0.4}
        maxZoom={1.6}
        proOptions={{ hideAttribution: false }}
        aria-label="Architectuurkaart. Sleep een onderdeel, of kies er een in de lijst."
      />
      <MapControls frameRef={frameRef} scenarioId={presentation.scenario?.id ?? null} reduce={reduce} />
    </div>
  );
}

function MapControls({
  frameRef,
  scenarioId,
  reduce,
}: {
  frameRef: { current: HTMLDivElement | null };
  scenarioId: string | null;
  reduce: boolean;
}) {
  const flow = useReactFlow();

  useEffect(() => {
    const element = frameRef.current;
    if (!element) {
      return;
    }
    const fit = () => {
      if (element.clientHeight < 40) {
        return;
      }
      void flow.fitView({ padding: 0.34, duration: 0 });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, [scenarioId, flow, frameRef, reduce]);

  return (
    <div className="absolute top-3 right-3 z-10 flex gap-2">
      <MapButton label="Inzoomen" onClick={() => flow.zoomIn({ duration: reduce ? 0 : 180 })}>
        +
      </MapButton>
      <MapButton label="Uitzoomen" onClick={() => flow.zoomOut({ duration: reduce ? 0 : 180 })}>
        −
      </MapButton>
      <MapButton label="Hele kaart" onClick={() => void flow.fitView({ padding: 0.34, duration: reduce ? 0 : 180 })}>
        Passend
      </MapButton>
    </div>
  );
}

function MapButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="bg-white px-3 py-1.5 font-ui text-sm text-ink shadow-material ring-1 ring-black/10"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function AtlasNodeView({ data }: NodeProps<AtlasFlowNode>) {
  return (
    <div
      className={`w-[200px] bg-white px-3 py-3 shadow-material ring-1 ${
        data.selected ? "ring-primary" : "ring-black/10"
      } ${data.dimmed ? "opacity-40" : ""}`}
    >
      <Handle id="top-in" type="target" position={Position.Top} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <Handle id="top-out" type="source" position={Position.Top} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <Handle id="right-in" type="target" position={Position.Right} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <Handle id="right-out" type="source" position={Position.Right} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <Handle id="bottom-in" type="target" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <Handle id="bottom-out" type="source" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <Handle id="left-in" type="target" position={Position.Left} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <Handle id="left-out" type="source" position={Position.Left} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <p className="font-ui text-[10px] font-medium tracking-[0.16em] text-primary uppercase">{data.kicker}</p>
      <p className="mt-1 font-display text-sm font-semibold tracking-tight text-ink">{data.title}</p>
    </div>
  );
}

function portsBetween(fromColumn: number, fromRow: number, toColumn: number, toRow: number): { source: string; target: string } {
  const horizontal = toColumn - fromColumn;
  const vertical = toRow - fromRow;
  if (Math.abs(vertical) >= Math.abs(horizontal)) {
    return vertical >= 0
      ? { source: "bottom-out", target: "top-in" }
      : { source: "top-out", target: "bottom-in" };
  }
  return horizontal >= 0 ? { source: "right-out", target: "left-in" } : { source: "left-out", target: "right-in" };
}
