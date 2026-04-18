'use client'
import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  ReactFlowProvider,
  type Connection,
  type NodeChange,
  type EdgeChange,
  type Node,
} from "@xyflow/react";
import { useFlowStore, ALGORITHMS, type NodeData } from "@/store";
import CipherNode from "./CipherNode";

const nodeTypes = { cipher: CipherNode };

const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "var(--color-cipher-500)", strokeWidth: 1.5 },
};

function FlowInner() {
  const { screenToFlowPosition } = useReactFlow();
  const { nodes, edges, setNodes, setEdges, addNode, selectNode } = useFlowStore();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes(applyNodeChanges(changes, nodes) as Node<NodeData>[]),
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges(addEdge({ ...connection, animated: true, style: { stroke: "var(--color-cipher-500)", strokeWidth: 1.5 } }, edges)),
    [edges, setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const algorithmId = e.dataTransfer.getData("application/cipherstack");
      if (!algorithmId) return;
      const algo = ALGORITHMS.find((a) => a.id === algorithmId);
      if (!algo) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNode({
        id: `${algorithmId}-${Date.now()}`,
        type: "cipher",
        position,
        data: { label: algo.label, algorithm: algo.id, category: algo.category, key: "" },
      });
    },
    [screenToFlowPosition, addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => selectNode(node.id),
    [selectNode]
  );

  const onPaneClick = useCallback(() => selectNode(null), [selectNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      deleteKeyCode="Delete"
      proOptions={{ hideAttribution: true }}
      style={{ background: "transparent" }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1.5}
        color="var(--color-border)"
      />
      <Controls
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
        }}
      />
    </ReactFlow>
  );
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100%" }}>
        <FlowInner />
      </div>
    </ReactFlowProvider>
  );
}
