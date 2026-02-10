
import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Panel,
  Handle,
  Position,
  MarkerType,
  Connection,
  Edge
} from 'reactflow';
import dagre from 'dagre';
import { 
  Shield, 
  Network, 
  Router, 
  Wifi, 
  Tv, 
  Smartphone, 
  Phone, 
  Database, 
  HardDrive, 
  Info, 
  Trash2, 
  Maximize2, 
  Settings2,
  Cpu,
  CircleHelp,
  Cloud,
  Globe
} from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { UserRole } from '../types';

// Map string keys to Lucide icons to allow serialization of topology data
const ICON_MAP: Record<string, React.ElementType> = {
  shield: Shield,
  network: Network,
  router: Router,
  wifi: Wifi,
  tv: Tv,
  smartphone: Smartphone,
  phone: Phone,
  database: Database,
  harddrive: HardDrive,
  cpu: Cpu,
  help: CircleHelp,
  cloud: Cloud,
  globe: Globe
};

// Custom Node Component
const NetworkNode = ({ data, selected }: any) => {
  const Icon = ICON_MAP[data.icon] || CircleHelp;
  const isSelected = selected;
  
  return (
    <div className={`px-4 py-3 rounded-2xl border-2 transition-all shadow-lg min-w-[140px] flex items-center gap-3 bg-white ${
      isSelected ? 'border-[#0070C0] ring-4 ring-blue-100' : 'border-slate-100'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#0070C0]" />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${data.color || 'bg-slate-100 text-slate-600'}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{data.type}</p>
        <p className="text-xs font-bold text-[#171844] truncate">{data.label}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[#0070C0]" />
    </div>
  );
};

const nodeTypes = {
  networkNode: NetworkNode,
};

// Node Library using serializable icon keys
const NODE_PALETTE = [
  // --- EXTERNAL ---
  { id: 'internet', label: 'Public Internet (WAN)', type: 'EXTERNAL', icon: 'globe', color: 'bg-slate-900 text-white' },
  { id: 'nonius-cloud', label: 'Nonius Cloud', type: 'CLOUD', icon: 'cloud', color: 'bg-[#171844] text-[#87A237]' },
  { id: 'nonius-cdn', label: 'Nonius CDN', type: 'CLOUD', icon: 'cloud', color: 'bg-emerald-600 text-white' },
  // --- INFRA ---
  { id: 'firewall', label: 'Firewall', type: 'INFRA', icon: 'shield', color: 'bg-red-50 text-red-600' },
  { id: 'core-switch', label: 'Core Switch', type: 'INFRA', icon: 'network', color: 'bg-[#171844] text-white' },
  { id: 'edge-switch', label: 'Edge Switch', type: 'INFRA', icon: 'network', color: 'bg-[#0070C0] text-white' },
  // --- SYSTEMS ---
  { id: 'tv-server', label: 'TV Server', type: 'TV', icon: 'database', color: 'bg-slate-100 text-slate-600' },
  { id: 'ap', label: 'Access Point', type: 'WIFI', icon: 'wifi', color: 'bg-[#87A237]/10 text-[#87A237]' },
  { id: 'stb', label: 'Set-Top Box', type: 'TV', icon: 'tv', color: 'bg-slate-100 text-slate-500' },
  { id: 'chromecast', label: 'Chromecast', type: 'CAST', icon: 'smartphone', color: 'bg-slate-100 text-slate-500' },
  { id: 'pbx', label: 'PBX Server', type: 'VOICE', icon: 'cpu', color: 'bg-slate-100 text-slate-600' },
  { id: 'ip-phone', label: 'IP Phone', type: 'VOICE', icon: 'phone', color: 'bg-slate-100 text-slate-500' },
];

const NetworkVisualizer: React.FC = () => {
  const { activeProject, saveProject, role } = useProjects();
  const isViewOnly = role === UserRole.PROJECT_MANAGER;
  
  const [nodes, setNodes, onNodesChange] = useNodesState(activeProject?.topology?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeProject?.topology?.edges || []);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showConnectionModal, setShowConnectionModal] = useState<any>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Sync state with active project
  useEffect(() => {
    if (activeProject?.topology) {
      // Basic check to avoid infinite loops
      if (JSON.stringify(activeProject.topology.nodes) !== JSON.stringify(nodes)) {
        setNodes(activeProject.topology.nodes);
        setEdges(activeProject.topology.edges);
      }
    }
  }, [activeProject?.id]);

  const onSave = useCallback(() => {
    if (!activeProject) return;
    saveProject({
      ...activeProject,
      topology: { nodes, edges },
      updatedAt: new Date().toISOString(),
    });
  }, [nodes, edges, activeProject, saveProject]);

  const onConnect = useCallback((params: any) => {
    // Validation logic
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);

    // Rule: APs cannot daisy-chain directly
    if (sourceNode?.data.type === 'WIFI' && targetNode?.data.type === 'WIFI') {
      alert("Validation Error: Access Points cannot daisy-chain directly. Use a Switch.");
      return;
    }

    setShowConnectionModal(params);
  }, [nodes]);

  const completeConnection = (type: 'fiber' | 'copper' | 'stacking') => {
    const { source, target } = showConnectionModal;
    const style: any = { strokeWidth: 2 };
    let color = '#0070C0'; // Copper Default

    if (type === 'fiber') {
      color = '#ef4444';
      style.strokeWidth = 4;
    } else if (type === 'stacking') {
      color = '#171844';
      style.strokeDasharray = '5,5';
    }

    const newEdge = {
      ...showConnectionModal,
      id: `e-${source}-${target}-${Date.now()}`,
      label: type.toUpperCase(),
      labelStyle: { fill: color, fontWeight: 700, fontSize: 10 },
      style: { ...style, stroke: color },
      markerEnd: { type: MarkerType.ArrowClosed, color },
    };

    setEdges((eds) => addEdge(newEdge, eds));
    setShowConnectionModal(null);
  };

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      if (isViewOnly) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const typeStr = event.dataTransfer.getData('application/reactflow');

      if (typeof typeStr === 'undefined' || !typeStr || !reactFlowBounds) return;

      const item = JSON.parse(typeStr);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `node-${Date.now()}`,
        type: 'networkNode',
        position,
        data: { 
          label: item.label, 
          icon: item.icon, // String key (e.g., 'shield')
          type: item.type, 
          color: item.color,
          ip: '0.0.0.0',
          location: 'Main Rack'
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, isViewOnly]
  );

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  const updateNodeData = (id: string, updates: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...updates } };
        }
        return node;
      })
    );
    setSelectedNode((prev: any) => ({ ...prev, data: { ...prev.data, ...updates } }));
  };

  const deleteSelected = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  };

  const onLayout = useCallback(() => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', marginx: 100, marginy: 100, nodesep: 150, ranksep: 200 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 180, height: 80 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    setNodes((nds) =>
      nds.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - 90,
            y: nodeWithPosition.y - 40,
          },
        };
      })
    );
  }, [nodes, edges]);

  return (
    <div className="flex flex-col h-[750px] bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-500">
      {/* Top Controls */}
      <div className="h-20 border-b border-slate-100 flex items-center justify-between px-10 shrink-0 bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-[#171844]">Network Topology Builder</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Drag nodes to map infrastructure</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onLayout}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#171844] hover:bg-slate-50 transition-all shadow-sm"
          >
            <Maximize2 size={16} /> Auto-Layout
          </button>
          {!isViewOnly && (
            <button 
              onClick={onSave}
              className="flex items-center gap-2 px-6 py-2 bg-[#87A237] text-white rounded-xl text-xs font-bold uppercase transition-all shadow-lg shadow-green-100"
            >
              Commit Topology
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbox */}
        <aside className="w-64 border-r border-slate-100 bg-white p-6 overflow-y-auto shrink-0 scrollbar-hide">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Device Library</h3>
          <div className="space-y-4">
            {NODE_PALETTE.map((item) => {
              const Icon = ICON_MAP[item.icon] || CircleHelp;
              return (
                <div
                  key={item.id}
                  draggable={!isViewOnly}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  className={`p-3 rounded-2xl border border-slate-100 flex items-center gap-3 cursor-grab hover:border-[#0070C0] hover:bg-blue-50 transition-all group ${isViewOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171844] leading-tight">{item.label}</p>
                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">{item.type}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
             <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4">Legend</h4>
             <div className="space-y-3">
               <div className="flex items-center gap-2">
                 <div className="h-1 w-6 bg-red-500 rounded-full"></div>
                 <span className="text-[10px] font-bold text-slate-600 uppercase">Fiber (10G)</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-[2px] w-6 bg-[#0070C0] rounded-full"></div>
                 <span className="text-[10px] font-bold text-slate-600 uppercase">Copper (1G)</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-[2px] w-6 border-t-2 border-dashed border-slate-900"></div>
                 <span className="text-[10px] font-bold text-slate-600 uppercase">Stacking</span>
               </div>
             </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background color="#cbd5e1" gap={20} />
              <Controls className="!bg-white !border-slate-200 !shadow-lg" />
              
              <Panel position="top-left" className="bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                 <Info size={14} className="text-[#0070C0]" />
                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tip: Top handle is Target, Bottom is Source</p>
              </Panel>
            </ReactFlow>

            {/* Connection Modal Overlay */}
            {showConnectionModal && (
              <div className="absolute inset-0 bg-[#171844]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full space-y-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 text-[#0070C0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Settings2 size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#171844]">Connection Type</h3>
                    <p className="text-slate-500 text-sm mt-1">Define the physical media for this link.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => completeConnection('copper')} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:border-[#0070C0] transition-all group text-left">
                       <div>
                         <p className="text-xs font-bold text-[#171844]">Copper (UTP/Cat6)</p>
                         <p className="text-[10px] text-slate-400">Standard 1Gbps / PoE</p>
                       </div>
                       <div className="w-4 h-1 bg-[#0070C0] rounded-full"></div>
                    </button>
                    <button onClick={() => completeConnection('fiber')} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-red-50 hover:border-red-500 transition-all group text-left">
                       <div>
                         <p className="text-xs font-bold text-[#171844]">Fiber (SFP+/10G)</p>
                         <p className="text-[10px] text-slate-400">High-speed backbone link</p>
                       </div>
                       <div className="w-4 h-2 bg-red-500 rounded-full"></div>
                    </button>
                    <button onClick={() => completeConnection('stacking')} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-slate-400 transition-all group text-left">
                       <div>
                         <p className="text-xs font-bold text-[#171844]">Stacking / DAC</p>
                         <p className="text-[10px] text-slate-400">Management logical stack</p>
                       </div>
                       <div className="w-4 h-1 border-t-2 border-dashed border-slate-900"></div>
                    </button>
                  </div>
                  <button onClick={() => setShowConnectionModal(null)} className="w-full py-3 text-slate-400 font-bold text-xs uppercase hover:text-red-500">Cancel Connection</button>
                </div>
              </div>
            )}
          </ReactFlowProvider>
        </div>

        {/* Right Inspector */}
        {selectedNode && (
          <aside className="w-80 border-l border-slate-100 bg-white p-8 overflow-y-auto shrink-0 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Node Inspector</h3>
              <button onClick={() => setSelectedNode(null)} className="text-slate-300 hover:text-slate-600">
                <Trash2 size={18} className="hover:text-red-500" onClick={(e) => { e.stopPropagation(); deleteSelected(); }} />
              </button>
            </div>

            <div className="space-y-6">
              {(() => {
                const Icon = ICON_MAP[selectedNode.data.icon] || CircleHelp;
                return (
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${selectedNode.data.color}`}>
                    <Icon size={32} />
                  </div>
                );
              })()}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Node Display Name</label>
                  <input 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#0070C0] outline-none"
                    value={selectedNode.data.label}
                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    disabled={isViewOnly}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Management IP Address</label>
                  <input 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#0070C0] outline-none"
                    value={selectedNode.data.ip}
                    onChange={(e) => updateNodeData(selectedNode.id, { ip: e.target.value })}
                    disabled={isViewOnly}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Deployment Location</label>
                  <input 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0070C0] outline-none"
                    value={selectedNode.data.location}
                    onChange={(e) => updateNodeData(selectedNode.id, { location: e.target.value })}
                    placeholder="Rack A, Unit 4"
                    disabled={isViewOnly}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                   <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Technical Info</p>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Type</p>
                        <p className="text-[10px] font-bold text-[#171844]">{selectedNode.data.type}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Internal ID</p>
                        <p className="text-[10px] font-bold text-[#171844] truncate">{selectedNode.id}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </aside>
        )}
        
        {!selectedNode && (
          <aside className="w-80 border-l border-slate-100 bg-slate-50 p-8 flex flex-col items-center justify-center text-center opacity-60">
             <Settings2 size={48} className="text-slate-300 mb-4" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a node to inspect properties</p>
          </aside>
        )}
      </div>
    </div>
  );
};

export default NetworkVisualizer;
