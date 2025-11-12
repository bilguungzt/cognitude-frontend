import React from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import type { AutopilotLog } from '../../types/api';

interface Props {
  data: AutopilotLog[];
}

interface SankeyNode {
  name: string;
  nodeColor: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface TooltipPayload {
  payload: {
    source: SankeyNode;
    target: SankeyNode;
    value: number;
  };
}

// Custom tooltip for the Sankey diagram
const CustomTooltip: React.FC<{ active?: boolean; payload?: TooltipPayload[] }> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { source, target, value } = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">
          {source.name} → {target.name}
        </p>
        <p className="text-sm text-gray-600">
          Requests: {value}
        </p>
      </div>
    );
  }
  return null;
};

export default function ModelRoutingChart({ data }: Props) {
  // Process the data to create nodes and links for the Sankey diagram
  const processData = (): SankeyData => {
    const nodeMap: Record<string, number> = {};
    const linkMap: Record<string, number> = {};

    // Count occurrences of each model transition
    data.forEach(log => {
      // Add original model to nodes
      nodeMap[log.original_model] = (nodeMap[log.original_model] || 0) + 1;
      
      // Add selected model to nodes
      nodeMap[log.selected_model] = (nodeMap[log.selected_model] || 0) + 1;
      
      // Create a link between original and selected model
      const linkKey = `${log.original_model}->${log.selected_model}`;
      linkMap[linkKey] = (linkMap[linkKey] || 0) + 1;
    });

    // Create nodes array
    const nodes: SankeyNode[] = Object.keys(nodeMap).map(name => ({
      name,
      // Color nodes differently based on their role
      nodeColor: name.includes('gpt') || name.includes('claude') || name.includes('mistral') || name.includes('groq')
        ? '#4f46e5' // indigo for model names
        : '#f59e0b' // amber for other nodes
    }));

    // Create links array
    const links: SankeyLink[] = Object.entries(linkMap).map(([linkKey, value]) => {
      const [sourceName, targetName] = linkKey.split('->');
      const source = nodes.findIndex(node => node.name === sourceName);
      const target = nodes.findIndex(node => node.name === targetName);
      
      return {
        source,
        target,
        value,
      };
    });

    return { nodes, links };
  };

  const { nodes, links } = processData();

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Model Routing Flow
      </h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={{ nodes, links }}
            nodeWidth={20}
            nodePadding={50}
            margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
            iterations={64}
            node={({ x, y, width, height, index, name }) => {
              const node = nodes[index];
              return (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={node.nodeColor}
                    rx={4}
                    ry={4}
                    opacity={0.8}
                  />
                  <text
                    x={x < 200 ? x + width + 6 : x - 6}
                    y={y + height / 2}
                    dy=".35em"
                    textAnchor={x < 200 ? "start" : "end"}
                    fill="#374151"
                    fontSize={12}
                    fontWeight={500}
                  >
                    {name}
                  </text>
                </g>
              );
            }}
            link={{ stroke: '#f59e0b', strokeOpacity: 0.4 }}
          >
            <Tooltip content={<CustomTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">This diagram shows how requests flow from the originally requested model to the model selected by Autopilot.</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            <span>Original Model</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Selected Model</span>
          </div>
        </div>
      </div>
    </div>
  );
}