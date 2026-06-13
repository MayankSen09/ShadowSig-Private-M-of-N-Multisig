"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { ShieldedIdentityAvatar } from "./shielded-identity-avatar";

interface MerkleTreeGraphProps {
  members: any[];
}

export function MerkleTreeGraph({ members }: MerkleTreeGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Root Node
    nodes.push({
      id: "root",
      position: { x: 250, y: 20 },
      data: { 
        label: (
          <div className="px-3 py-1.5 bg-white rounded-lg shadow-sm border border-[var(--color-border-primary)] text-[11px] font-semibold text-[var(--color-text-primary)] font-mono tracking-wide">
            Root
          </div>
        )
      },
      type: "default",
      style: { background: "transparent", border: "none", padding: 0 }
    });

    // Level 1 Nodes
    for (let i = 0; i < 2; i++) {
      const id = `h${i}`;
      nodes.push({
        id,
        position: { x: 150 + i * 200, y: 100 },
        data: { 
          label: (
            <div className="px-2.5 py-1 bg-white rounded shadow-sm border border-[var(--color-border-primary)] text-[10px] font-mono font-medium text-[var(--color-text-secondary)]">
              H{i}
            </div>
          )
        },
        style: { background: "transparent", border: "none", padding: 0 }
      });
      edges.push({ id: `e-root-${id}`, source: "root", target: id, type: "smoothstep", animated: true });

      // Level 2 Nodes (Leaves)
      for (let j = 0; j < 2; j++) {
        const leafIndex = i * 2 + j;
        const leafId = `l${leafIndex}`;
        const member = members[leafIndex];
        
        nodes.push({
          id: leafId,
          position: { x: 100 + i * 200 + j * 100, y: 180 },
          data: { 
            label: (
              <div className="flex flex-col items-center gap-2.5">
                <div className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[9px] font-mono text-[var(--color-text-secondary)] border border-[var(--color-border-primary)]">
                  L{leafIndex}
                </div>
                {member ? (
                  <ShieldedIdentityAvatar commitment={member.commitment} size="sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-dashed border-gray-300" />
                )}
              </div>
            )
          },
          style: { background: "transparent", border: "none", padding: 0 }
        });
        edges.push({ id: `e-${id}-${leafId}`, source: id, target: leafId, type: "smoothstep", animated: true });
      }
    }

    return { nodes, edges };
  }, [members]);

  return (
    <div style={{ width: '100%', height: '300px' }} className="bg-[var(--color-bg-primary)]/30 rounded-xl relative">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView 
        attributionPosition="bottom-left"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#ccc" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
