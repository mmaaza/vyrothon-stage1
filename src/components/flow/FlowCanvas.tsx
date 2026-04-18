'use client'
import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  reconnectEdge,
  useReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type FinalConnectionState,
  type HandleType,
  type NodeChange,
  type EdgeChange,
  type Node,
} from "@xyflow/react";
import {
  useFlowStore,
  getCipher,
  CIPHER_DEFS,
  makeNodeDefaults,
  withinSingleWireDegreeLimit,
  type NodeData,
} from "@/store";
import CipherNode from "./CipherNode";

const nodeTypes = { cipher: CipherNode };

const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "var(--color-cipher-500)", strokeWidth: 1.5 },
};

function FlowInner() {
  const { screenToFlowPosition } = useReactFlow();
  const { nodes, edges, mode, setNodes, setEdges, addNode, selectNode } = useFlowStore();
  const reconnectExcludeEdgeIdRef = useRef<string | null>(null);

  const isValidConnection = useCallback((conn: Connection | Edge) => {
    const { edges: current } = useFlowStore.getState();
    const edgeId =
      "edgeId" in conn && typeof (conn as Connection & { edgeId?: string }).edgeId === "string"
        ? (conn as Connection & { edgeId: string }).edgeId
        : undefined;
    const exclude = edgeId ?? reconnectExcludeEdgeIdRef.current ?? undefined;
    return withinSingleWireDegreeLimit(current, conn.source, conn.target, exclude);
  }, []);

  const onReconnectStart = useCallback((_e: unknown, edge: Edge) => {
    reconnectExcludeEdgeIdRef.current = edge.id;
  }, []);

  const onReconnectEnd = useCallback(
    (_evt: unknown, _edge: Edge, _handle: HandleType, _state: FinalConnectionState) => {
      reconnectExcludeEdgeIdRef.current = null;
    },
    []
  );

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
    (connection: Connection) => {
      const current = useFlowStore.getState().edges;
      if (!withinSingleWireDegreeLimit(current, connection.source, connection.target)) return;
      setEdges(
        addEdge(
          { ...connection, animated: true, style: { stroke: "var(--color-cipher-500)", strokeWidth: 1.5 } },
          current
        )
      );
    },
    [setEdges]
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      const current = useFlowStore.getState().edges;
      if (!withinSingleWireDegreeLimit(current, newConnection.source, newConnection.target, oldEdge.id)) return;
      setEdges(reconnectEdge(oldEdge, newConnection, current));
    },
    [setEdges]
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
      const def = CIPHER_DEFS.find((c) => c.id === algorithmId);
      if (!def) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const { params } = makeNodeDefaults(algorithmId);
      addNode({
        id: `${algorithmId}-${Date.now()}`,
        type: "cipher",
        position,
        data: { label: def.label, algorithm: def.id, category: def.category, params },
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
      className={`cs-flow cs-flow--${mode}`}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onReconnect={onReconnect}
      onReconnectStart={onReconnectStart}
      onReconnectEnd={onReconnectEnd}
      isValidConnection={isValidConnection}
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
