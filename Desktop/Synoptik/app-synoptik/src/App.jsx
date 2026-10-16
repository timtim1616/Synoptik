// src/App.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  getNodesBounds,
  getViewportForBounds,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Download, 
  SlidersHorizontal,
  Home,
  StickyNote,
  ClipboardList,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalDistributeCenter,
  LogOut,
  Star,
  Maximize2,
  ExternalLink,
  Plus,
  X,
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react';

import DeviceNode from './components/DeviceNode.jsx';
import AnnotationNode, { NOTE_COLORS } from './components/AnnotationNode.jsx';
import CustomEdge, { CABLE_STANDARD_LENGTHS } from './components/CustomEdge.jsx';
import Dashboard from './components/Dashboard.jsx';
import AuthModal from './components/AuthModal.jsx';
import CatalogModal from './components/CatalogModal.jsx';
import Logo from './components/Logo.jsx';
import { ProjectModal, ExportModal, EquipmentListModal } from './components/Modals.jsx';
import { 
  SIGNAL_COLORS, 
  DOMAINS,
  CATEGORIES, 
  PORT_PRESETS,
  getCategoryMeta, 
  normalizeCategoryId,
  getDomainForCategory,
  INITIAL_EQUIPMENT_LIBRARY 
} from './constants/equipment.js';
import { pb } from './services/pocketbase.js';
import { fetchProductInfo } from './services/productSearch.js';

const nodeTypes = {
  device: DeviceNode,
  annotation: AnnotationNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const SNAP_GRID = [18, 18];

export default function App() {
  const reactFlowWrapper = useRef(null);

  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);

  const urlParams = new URLSearchParams(window.location.search);
  const requestedProjectId = urlParams.get('project');

  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(requestedProjectId);
  const [equipmentLibrary, setEquipmentLibrary] = useState(INITIAL_EQUIPMENT_LIBRARY);

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('synoptik_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // État produit dynamique
  const [productData, setProductData] = useState(null);
  const [isProductLoading, setIsProductLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarDomain, setSidebarDomain] = useState('all');

  const [projectData, setProjectData] = useState({
    title: 'Nouveau Synoptique',
    version: 'v1.0',
    date: new Date().toLocaleDateString('fr-FR'),
    eventDate: '',
    author: '',
    location: ''
  });

  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showAddPortModal, setShowAddPortModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [exportConfig, setExportConfig] = useState({
    format: 'pdf',
    theme: 'dark',
    includeCartouche: true,
    includeContact: true
  });

  const [portPresetSearch, setPortPresetSearch] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState(PORT_PRESETS[0].id);
  const [newPortBaseName, setNewPortBaseName] = useState('Port');
  const [newPortDirection, setNewPortDirection] = useState('inputs');
  const [batchCount, setBatchCount] = useState(1);

  // Chargement des données produit
  useEffect(() => {
    if (!selectedNode || selectedNode.type !== 'device') {
      setProductData(null);
      setIsProductLoading(false);
      return;
    }

    let isMounted = true;
    setIsProductLoading(true);

    const brand = selectedNode.data?.brand || '';
    const label = selectedNode.data?.label || '';

    fetchProductInfo(brand, label).then((info) => {
      if (isMounted) {
        setProductData(info);
        setIsProductLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedNode?.id, selectedNode?.data?.label, selectedNode?.data?.brand]);

  const toggleFavorite = useCallback((idOrLabel) => {
    setFavorites((prev) => {
      const updated = prev.includes(idOrLabel)
        ? prev.filter((id) => id !== idOrLabel)
        : [...prev, idOrLabel];
      localStorage.setItem('synoptik_favorites', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteEdgeById = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setSelectedEdge((prev) => (prev?.id === edgeId ? null : prev));
  }, [setEdges]);

  const deleteNodeById = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode((prev) => (prev?.id === nodeId ? null : prev));
  }, [setNodes, setEdges]);

  const changeAnnotationText = useCallback((nodeId, text) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === nodeId) {
        return { ...n, data: { ...n.data, text } };
      }
      return n;
    }));
    setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data: { ...prev.data, text } } : prev));
  }, [setNodes]);

  const updateNodeDataDirect = useCallback((nodeId, updatedData) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === nodeId) {
        return { ...n, data: updatedData };
      }
      return n;
    }));
    setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data: updatedData } : prev));
  }, [setNodes]);

  useEffect(() => {
    return pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
      setIsAuthenticated(!!token);
    });
  }, []);

  const handleLogout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setProjects([]);
  };

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const records = await pb.collection('projects').getFullList({
        sort: '-updated',
      });
      setProjects(records);
    } catch (err) {
      console.error('Erreur chargement projets :', err);
    }
  }, [isAuthenticated]);

  const fetchEquipment = useCallback(async () => {
    try {
      const records = await pb.collection('equipment').getFullList({
        sort: 'label',
      });
      if (records.length > 0) {
        setEquipmentLibrary(records);
      }
    } catch {
      setEquipmentLibrary(INITIAL_EQUIPMENT_LIBRARY);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
      fetchEquipment();
    }
  }, [isAuthenticated, fetchProjects, fetchEquipment]);

  const isInitialLoadedRef = useRef(false);

  useEffect(() => {
    if (!activeProjectId || !isAuthenticated) {
      document.title = 'SynopTik';
      isInitialLoadedRef.current = false;
      return;
    }

    if (isInitialLoadedRef.current) return;

    const loadActiveProject = async () => {
      try {
        const proj = await pb.collection('projects').getOne(activeProjectId);

        if (proj) {
          isInitialLoadedRef.current = true;
          document.title = `${proj.title} · SynopTik`;
          setProjectData({
            title: proj.title,
            version: proj.version || 'v1.0',
            date: proj.date || new Date().toLocaleDateString('fr-FR'),
            eventDate: proj.eventDate || '',
            author: proj.author || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : ''),
            location: proj.location || ''
          });

          const hydratedNodes = (proj.nodes || [])
            .filter((n) => n.type !== 'zone')
            .map((node) => {
              if (node.type === 'annotation') {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    onDelete: deleteNodeById,
                    onChangeText: changeAnnotationText,
                  }
                };
              }
              if (node.type === 'device') {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    category: normalizeCategoryId(node.data?.category),
                    bidirectional: node.data?.bidirectional || [],
                    onUpdateData: updateNodeDataDirect,
                  }
                };
              }
              return node;
            });

          const hydratedEdges = (proj.edges || []).map((edge) => ({
            ...edge,
            type: 'custom',
            data: {
              ...edge.data,
              onDeleteEdge: deleteEdgeById,
            }
          }));

          setNodes(hydratedNodes);
          setEdges(hydratedEdges);
        }
      } catch (err) {
        console.error('Erreur chargement projet :', err);
      }
    };

    loadActiveProject();
  }, [activeProjectId, isAuthenticated, deleteNodeById, changeAnnotationText, updateNodeDataDirect, deleteEdgeById, currentUser, setNodes, setEdges]);

  // Sauvegarde automatique transparente
  useEffect(() => {
    if (!activeProjectId || !isAuthenticated || !isInitialLoadedRef.current) return;

    const timeout = setTimeout(async () => {
      try {
        await pb.collection('projects').update(activeProjectId, {
          title: projectData.title,
          version: projectData.version,
          date: projectData.date,
          eventDate: projectData.eventDate,
          author: projectData.author,
          location: projectData.location,
          nodes,
          edges,
        });
      } catch (err) {
        console.error('Erreur sauvegarde silencieuse :', err);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [nodes, edges, projectData, activeProjectId, isAuthenticated]);

  const handleOpenProjectInNewTab = (id) => {
    const url = `${window.location.origin}${window.location.pathname}?project=${id}`;
    window.open(url, '_blank');
  };

  const handleCreateProject = async (title) => {
    if (!currentUser) return;
    try {
      const authorName = currentUser?.firstName 
        ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() 
        : (currentUser.name || currentUser.email || '');

      const record = await pb.collection('projects').create({
        title,
        version: 'v1.0',
        date: new Date().toLocaleDateString('fr-FR'),
        eventDate: '',
        author: authorName,
        location: '',
        user: currentUser.id,
        nodes: [],
        edges: []
      });
      setProjects((prev) => [record, ...prev]);
      handleOpenProjectInNewTab(record.id);
    } catch (err) {
      alert('Impossible de créer le projet : ' + err.message);
    }
  };

  const handleDuplicateProject = async (id) => {
    const source = projects.find((p) => p.id === id);
    if (!source || !currentUser) return;

    try {
      const duplicated = await pb.collection('projects').create({
        title: `${source.title} (Copie)`,
        version: source.version || 'v1.0',
        date: new Date().toLocaleDateString('fr-FR'),
        eventDate: source.eventDate || '',
        author: currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : (currentUser.name || ''),
        location: source.location || '',
        user: currentUser.id,
        nodes: source.nodes || [],
        edges: source.edges || [],
      });
      setProjects((prev) => [duplicated, ...prev]);
    } catch (err) {
      alert('Impossible de dupliquer : ' + err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Supprimer définitivement ce synoptique ?')) return;

    try {
      await pb.collection('projects').delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProjectId === id) {
        window.location.href = window.location.pathname;
      }
    } catch (err) {
      alert('Impossible de supprimer : ' + err.message);
    }
  };

  const handleGoToDashboard = () => {
    window.open(window.location.pathname, '_blank');
  };

  const handleAddDevice = (device) => {
    const center = reactFlowInstance?.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }) || { x: 300, y: 200 };

    const snappedX = Math.round(center.x / SNAP_GRID[0]) * SNAP_GRID[0];
    const snappedY = Math.round(center.y / SNAP_GRID[1]) * SNAP_GRID[1];

    const newNode = {
      id: `device_${Date.now()}`,
      type: 'device',
      position: {
        x: snappedX,
        y: snappedY,
      },
      data: { 
        ...device, 
        category: normalizeCategoryId(device.category),
        bidirectional: device.bidirectional || [],
        role: '', 
        ip: '', 
        powerWatts: device.powerWatts || '',
        onUpdateData: updateNodeDataDirect,
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setSelectedNode(newNode);
    setSelectedEdge(null);
    if (isMobile) setMobileInspectorOpen(true);
  };

  const handleAddAnnotation = () => {
    const center = reactFlowInstance?.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }) || { x: 300, y: 200 };

    const snappedX = Math.round(center.x / SNAP_GRID[0]) * SNAP_GRID[0];
    const snappedY = Math.round(center.y / SNAP_GRID[1]) * SNAP_GRID[1];

    const newNote = {
      id: `note_${Date.now()}`,
      type: 'annotation',
      position: { x: snappedX, y: snappedY },
      style: { width: 180, height: 100 },
      data: {
        text: '',
        colorId: 'slate',
        onDelete: deleteNodeById,
        onChangeText: changeAnnotationText,
      }
    };

    setNodes((nds) => nds.concat(newNote));
    setSelectedNode(newNote);
    setSelectedEdge(null);
    if (isMobile) setMobileInspectorOpen(true);
  };

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      const cleanSourceHandle = (params.sourceHandle || '').replace(/_src|_tgt/g, '');
      const cleanTargetHandle = (params.targetHandle || '').replace(/_src|_tgt/g, '');

      const allSourcePorts = [
        ...(sourceNode?.data?.inputs || []),
        ...(sourceNode?.data?.outputs || []),
        ...(sourceNode?.data?.bidirectional || [])
      ];
      const allTargetPorts = [
        ...(targetNode?.data?.inputs || []),
        ...(targetNode?.data?.outputs || []),
        ...(targetNode?.data?.bidirectional || [])
      ];

      const sourcePort = allSourcePorts.find((p) => p.id === cleanSourceHandle);
      const targetPort = allTargetPorts.find((p) => p.id === cleanTargetHandle);

      const sourceType = sourcePort?.type || 'Inconnu';
      const targetType = targetPort?.type || 'Inconnu';

      const isMismatch = sourceType !== targetType;
      const baseColor = SIGNAL_COLORS[sourceType] || (sourceType === 'USB-C' ? '#f97316' : '#94a3b8');

      const newEdge = {
        ...params,
        type: 'custom',
        style: {
          stroke: isMismatch ? '#ef4444' : baseColor,
          strokeWidth: 3,
        },
        data: {
          sourceType,
          targetType,
          isMismatch,
          label: '',
          length: 'Non spécifié',
          onDeleteEdge: deleteEdgeById,
        }
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, setEdges, deleteEdgeById]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    if (isMobile) setMobileInspectorOpen(true);
  }, [isMobile]);

  const onEdgeClick = useCallback((_, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    if (isMobile) setMobileInspectorOpen(true);
  }, [isMobile]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    if (isMobile) setMobileInspectorOpen(false);
  }, [isMobile]);

  const onDragStart = (event, nodeData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      const template = JSON.parse(rawData);
      const rawPos = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const position = {
        x: Math.round(rawPos.x / SNAP_GRID[0]) * SNAP_GRID[0],
        y: Math.round(rawPos.y / SNAP_GRID[1]) * SNAP_GRID[1],
      };

      const newNode = {
        id: `device_${Date.now()}`,
        type: 'device',
        position,
        data: { 
          ...template, 
          category: normalizeCategoryId(template.category),
          bidirectional: template.bidirectional || [],
          role: '', 
          ip: '', 
          powerWatts: template.powerWatts || '',
          onUpdateData: updateNodeDataDirect,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode);
      setSelectedEdge(null);
      if (isMobile) setMobileInspectorOpen(true);
    },
    [reactFlowInstance, setNodes, updateNodeDataDirect, isMobile]
  );

  const updateSelectedNodeData = (field, value) => {
    if (!selectedNode) return;

    setSelectedNode((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        data: {
          ...prev.data,
          [field]: value
        }
      };
    });

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              [field]: value
            }
          };
        }
        return n;
      })
    );
  };

  const updateSelectedEdgeData = (field, value) => {
    if (!selectedEdge) return;
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === selectedEdge.id) {
          const updated = {
            ...edge,
            data: { ...edge.data, [field]: value }
          };
          setSelectedEdge(updated);
          return updated;
        }
        return edge;
      })
    );
  };

  const togglePortVisibility = (direction, portId) => {
    if (!selectedNode) return;
    const currentList = selectedNode.data[direction] || [];
    const updatedList = currentList.map((p) => {
      if (p.id === portId) {
        return { ...p, visible: p.visible === false ? true : false };
      }
      return p;
    });
    updateSelectedNodeData(direction, updatedList);
  };

  const handleRemovePortFromInspector = (direction, portId) => {
    if (!selectedNode) return;
    const currentList = selectedNode.data[direction] || [];
    const updatedList = currentList.filter((p) => p.id !== portId);
    updateSelectedNodeData(direction, updatedList);
  };

  const handleBatchAddPorts = (e) => {
    e.preventDefault();
    if (!selectedNode) return;

    const preset = PORT_PRESETS.find((p) => p.id === selectedPresetId) || PORT_PRESETS[0];
    const count = Math.max(1, parseInt(batchCount, 10) || 1);
    const isBi = newPortDirection === 'bidirectional';

    const newPorts = [];
    for (let i = 1; i <= count; i++) {
      const portName = count === 1 
        ? newPortBaseName.trim() 
        : `${newPortBaseName.trim()} ${i}`;

      newPorts.push({
        id: `port_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`,
        name: portName,
        type: preset.type,
        connector: preset.connector,
        isBiDirectional: isBi,
        direction: newPortDirection,
        visible: true,
      });
    }

    if (isBi) {
      const currentBi = selectedNode.data.bidirectional || [];
      updateSelectedNodeData('bidirectional', [...currentBi, ...newPorts]);
    } else {
      const targetList = selectedNode.data[newPortDirection] || [];
      updateSelectedNodeData(newPortDirection, [...targetList, ...newPorts]);
    }

    setShowAddPortModal(false);
    setNewPortBaseName('Port');
    setBatchCount(1);
  };

  const selectedNodes = useMemo(() => nodes.filter((n) => n.selected), [nodes]);

  const alignNodes = (type) => {
    if (selectedNodes.length < 2) return;

    setNodes((nds) => {
      const selected = nds.filter((n) => n.selected);
      if (selected.length < 2) return nds;

      let targetPos;
      if (type === 'left') {
        targetPos = Math.min(...selected.map((n) => n.position.x));
        const snapped = Math.round(targetPos / SNAP_GRID[0]) * SNAP_GRID[0];
        return nds.map((n) => n.selected ? { ...n, position: { ...n.position, x: snapped } } : n);
      }
      if (type === 'right') {
        targetPos = Math.max(...selected.map((n) => n.position.x));
        const snapped = Math.round(targetPos / SNAP_GRID[0]) * SNAP_GRID[0];
        return nds.map((n) => n.selected ? { ...n, position: { ...n.position, x: snapped } } : n);
      }
      if (type === 'top') {
        targetPos = Math.min(...selected.map((n) => n.position.y));
        const snapped = Math.round(targetPos / SNAP_GRID[1]) * SNAP_GRID[1];
        return nds.map((n) => n.selected ? { ...n, position: { ...n.position, y: snapped } } : n);
      }
      if (type === 'centerH') {
        const avgY = selected.reduce((sum, n) => sum + n.position.y, 0) / selected.length;
        const snappedY = Math.round(avgY / SNAP_GRID[1]) * SNAP_GRID[1];
        return nds.map((n) => n.selected ? { ...n, position: { ...n.position, y: snappedY } } : n);
      }
      if (type === 'centerV') {
        const avgX = selected.reduce((sum, n) => sum + n.position.x, 0) / selected.length;
        const snappedX = Math.round(avgX / SNAP_GRID[0]) * SNAP_GRID[0];
        return nds.map((n) => n.selected ? { ...n, position: { ...n.position, x: snappedX } } : n);
      }
      if (type === 'distributeH') {
        const sorted = [...selected].sort((a, b) => a.position.x - b.position.x);
        const minX = sorted[0].position.x;
        const maxX = sorted[sorted.length - 1].position.x;
        const step = (maxX - minX) / (sorted.length - 1);
        const posMap = new Map();
        sorted.forEach((n, idx) => posMap.set(n.id, Math.round((minX + idx * step) / SNAP_GRID[0]) * SNAP_GRID[0]));
        return nds.map((n) => posMap.has(n.id) ? { ...n, position: { ...n.position, x: posMap.get(n.id) } } : n);
      }
      return nds;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const targets = nodes.filter((n) => n.selected);
        if (targets.length === 0) return;

        const duplicates = targets.map((src) => ({
          ...src,
          id: `${src.type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          position: {
            x: Math.round((src.position.x + 36) / SNAP_GRID[0]) * SNAP_GRID[0],
            y: Math.round((src.position.y + 36) / SNAP_GRID[1]) * SNAP_GRID[1],
          },
          selected: true,
          data: {
            ...src.data,
            label: src.data.label ? `${src.data.label} (Copie)` : 'Copie',
            onDelete: deleteNodeById,
            onChangeText: changeAnnotationText,
            onUpdateData: updateNodeDataDirect,
          }
        }));

        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat(duplicates));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, deleteNodeById, changeAnnotationText, updateNodeDataDirect, setNodes]);

  const captureFlowCanvas = async (theme) => {
    if (nodes.length === 0) {
      alert("Ajoute au moins un appareil avant d'exporter.");
      return null;
    }

    const connectedPortIds = new Set();
    edges.forEach((edge) => {
      if (edge.sourceHandle) connectedPortIds.add(edge.sourceHandle.replace(/_src|_tgt/g, ''));
      if (edge.targetHandle) connectedPortIds.add(edge.targetHandle.replace(/_src|_tgt/g, ''));
    });

    const originalNodes = nodes;

    const exportNodes = originalNodes.map((n) => {
      if (n.type !== 'device') return n;

      return {
        ...n,
        data: {
          ...n.data,
          inputs: (n.data?.inputs || []).map((p) => ({ ...p, visible: connectedPortIds.has(p.id) })),
          outputs: (n.data?.outputs || []).map((p) => ({ ...p, visible: connectedPortIds.has(p.id) })),
          bidirectional: (n.data?.bidirectional || []).map((p) => ({ ...p, visible: connectedPortIds.has(p.id) })),
        }
      };
    });

    setNodes(exportNodes);
    await new Promise((resolve) => setTimeout(resolve, 80));

    const nodesBounds = getNodesBounds(exportNodes);
    const imageWidth = 3840;
    const imageHeight = 2160;

    const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.4, 2.5, 0.12);
    const viewportElement = reactFlowWrapper.current.querySelector('.react-flow__viewport');

    let captureResult = null;
    if (viewportElement) {
      const captureOptions = {
        backgroundColor: theme === 'light' ? '#ffffff' : '#121214',
        width: imageWidth,
        height: imageHeight,
        pixelRatio: 3.0,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      };

      const dataUrl = await toPng(viewportElement, captureOptions);
      captureResult = { dataUrl, width: imageWidth, height: imageHeight };
    }

    setNodes(originalNodes);
    return captureResult;
  };

  const executeExport = async () => {
    setIsExporting(true);
    try {
      const isPdf = exportConfig.format === 'pdf';
      const result = await captureFlowCanvas(exportConfig.theme);
      if (!result) return;

      const exportDate = new Date().toLocaleDateString('fr-FR');

      if (!isPdf) {
        const link = document.createElement('a');
        link.download = `${projectData.title.replace(/\s+/g, '_')}_${exportConfig.theme}.png`;
        link.href = result.dataUrl;
        link.click();
      } else {
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
        const pageWidth = 297;
        const pageHeight = 210;
        const margin = 8;
        const isLight = exportConfig.theme === 'light';

        pdf.setFillColor(isLight ? 255 : 18, isLight ? 255 : 18, isLight ? 255 : 20);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        const cartoucheHeight = exportConfig.includeCartouche ? 24 : 0;
        const schemaAreaWidth = pageWidth - (margin * 2);
        const schemaAreaHeight = pageHeight - (margin * 2) - cartoucheHeight - (exportConfig.includeCartouche ? 4 : 0);

        const imgRatio = result.width / result.height;
        let renderWidth = schemaAreaWidth;
        let renderHeight = renderWidth / imgRatio;

        if (renderHeight > schemaAreaHeight) {
          renderHeight = schemaAreaHeight;
          renderWidth = renderHeight * imgRatio;
        }

        const posX = margin + (schemaAreaWidth - renderWidth) / 2;
        const posY = margin + (schemaAreaHeight - renderHeight) / 2;

        pdf.addImage(result.dataUrl, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');

        if (exportConfig.includeCartouche) {
          const cartoucheY = pageHeight - margin - cartoucheHeight;

          pdf.setFillColor(isLight ? 245 : 22, isLight ? 245 : 23, isLight ? 247 : 26);
          pdf.setDrawColor(isLight ? 210 : 46, isLight ? 210 : 48, isLight ? 215 : 56);
          pdf.roundedRect(margin, cartoucheY, schemaAreaWidth, cartoucheHeight, 1.5, 1.5, 'FD');

          pdf.setTextColor(isLight ? 20 : 255, isLight ? 20 : 255, isLight ? 20 : 255);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(projectData.title, margin + 5, cartoucheY + 6.5);

          pdf.setTextColor(isLight ? 2 : 56, isLight ? 132 : 189, isLight ? 199 : 248);
          pdf.setFontSize(8);
          pdf.text(`Indice : ${projectData.version}`, margin + 5, cartoucheY + 12.5);

          pdf.setTextColor(isLight ? 90 : 156, isLight ? 90 : 163, isLight ? 90 : 175);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);

          const eventDateText = projectData.eventDate ? `Date Presta : ${projectData.eventDate}` : `Édité le : ${exportDate}`;
          pdf.text(eventDateText, margin + 5, cartoucheY + 18);

          const midX = margin + 85;
          const authorText = projectData.author || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : 'Régie');
          pdf.text(`Responsable : ${authorText}`, midX, cartoucheY + 6.5);
          pdf.text(`Lieu : ${projectData.location || 'Non précisé'}`, midX, cartoucheY + 12.5);

          if (exportConfig.includeContact && currentUser?.phone) {
            pdf.setTextColor(isLight ? 2 : 56, isLight ? 132 : 189, isLight ? 199 : 248);
            pdf.text(`Contact : ${currentUser.phone}`, midX, cartoucheY + 18);
          }

          const presentSignals = Array.from(
            new Set(edges.map((e) => e.data?.sourceType).filter(Boolean))
          );

          const legX = margin + 175;
          pdf.setTextColor(isLight ? 20 : 220, isLight ? 20 : 220, isLight ? 20 : 220);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7.5);
          pdf.text('Signaux actifs :', legX, cartoucheY + 6.5);

          pdf.setFont('helvetica', 'normal');
          if (presentSignals.length === 0) {
            pdf.setTextColor(isLight ? 120 : 140, isLight ? 120 : 140, isLight ? 120 : 140);
            pdf.text('Aucun câble relié', legX, cartoucheY + 13);
          } else {
            presentSignals.forEach((sig, idx) => {
              const hex = SIGNAL_COLORS[sig] || '#94a3b8';
              const col = Math.floor(idx / 3);
              const row = idx % 3;
              const xPos = legX + (col * 32);
              const yPos = cartoucheY + 12 + (row * 4.5);

              pdf.setFillColor(hex);
              pdf.rect(xPos, yPos - 2.2, 2.5, 2.5, 'F');

              pdf.setTextColor(isLight ? 60 : 209, isLight ? 60 : 213, isLight ? 60 : 219);
              pdf.text(sig, xPos + 4, yPos);
            });
          }
        }

        pdf.save(`${projectData.title.replace(/\s+/g, '_')}_${projectData.version}.pdf`);
      }
      setShowExportModal(false);
    } catch (err) {
      console.error('Erreur export :', err);
    } finally {
      setIsExporting(false);
    }
  };

  const sidebarEquipment = useMemo(() => {
    const q = sidebarSearch.toLowerCase().trim();

    return (equipmentLibrary || [])
      .filter((item) => {
        if (!item || !item.label) return false;

        const itemDomain = item.domain || getDomainForCategory(item.category);
        const matchesDomain = sidebarDomain === 'all' || itemDomain === sidebarDomain;

        const matchesSearch =
          q === '' ||
          item.label.toLowerCase().includes(q) ||
          (item.brand && item.brand.toLowerCase().includes(q));

        return matchesDomain && matchesSearch;
      })
      .sort((a, b) => {
        const isFavA = favorites.includes(a.id || a.label);
        const isFavB = favorites.includes(b.id || b.label);
        if (isFavA && !isFavB) return -1;
        if (!isFavA && isFavB) return 1;
        return (a.label || '').localeCompare(b.label || '');
      });
  }, [equipmentLibrary, sidebarDomain, sidebarSearch, favorites]);

  const filteredPresets = useMemo(() => {
    const q = portPresetSearch.toLowerCase().trim();
    if (!q) return PORT_PRESETS;
    return PORT_PRESETS.filter((p) => p.label.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
  }, [portPresetSearch]);

  const hasSelection = Boolean(selectedNode || selectedEdge);

  if (!isAuthenticated) {
    return (
      <AuthModal
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  if (!activeProjectId) {
    return (
      <Dashboard
        projects={projects}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProject={handleOpenProjectInNewTab}
        onCreateProject={handleCreateProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onUserUpdated={(updated) => setCurrentUser(updated)}
      />
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#121214' }}>
      <header style={{
        height: '44px',
        background: '#18191d',
        borderBottom: '1px solid #282a30',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleGoToDashboard}
            title="Tableau de bord"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 9px',
              background: '#22242a',
              border: '1px solid #333640',
              borderRadius: '5px',
              color: '#d1d5db',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <Home size={13} />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Accueil</span>
          </button>
          <span style={{ fontSize: '12px', color: '#4b5563' }}>/</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Logo size={18} />
            <span style={{ fontSize: '13px', color: '#f3f4f6', fontWeight: 600 }}>{projectData.title}</span>
          </div>
          <span style={{ fontSize: '10px', background: '#272930', padding: '1px 5px', borderRadius: '3px', color: '#9ca3af' }}>{projectData.version}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleAddAnnotation}
            title="Ajouter une note"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              background: '#22242a',
              border: '1px solid #333640',
              borderRadius: '5px',
              color: '#d1d5db',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <StickyNote size={13} color="#facc15" />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>+ Note</span>
          </button>

          <button
            onClick={() => setShowEquipmentModal(true)}
            title="Générer la liste du matériel et calcul d'énergie"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              background: '#22242a',
              border: '1px solid #333640',
              borderRadius: '5px',
              color: '#4ade80',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ClipboardList size={13} />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Liste Matos</span>
          </button>

          <button
            onClick={() => setShowProjectModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              background: '#22242a',
              border: '1px solid #333640',
              borderRadius: '5px',
              color: '#d1d5db',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <SlidersHorizontal size={13} />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Infos Projet</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              background: '#2563eb',
              border: 'none',
              borderRadius: '5px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <Download size={13} />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Exporter</span>
          </button>

          {isMobile && hasSelection && (
            <button
              onClick={() => setMobileInspectorOpen(!mobileInspectorOpen)}
              title={mobileInspectorOpen ? "Fermer l'inspecteur" : "Ouvrir l'inspecteur"}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '5px',
                background: mobileInspectorOpen ? '#2563eb' : '#22242a',
                border: '1px solid #333640',
                borderRadius: '5px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {mobileInspectorOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
            </button>
          )}

          <button
            onClick={handleLogout}
            title="Se déconnecter"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {selectedNodes.length >= 2 && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: isMobile ? '12px' : '260px',
            zIndex: 30,
            background: '#1a1b1e',
            border: '1px solid #333640',
            borderRadius: '6px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}>
            <span style={{ fontSize: '10px', color: '#9ca3af', marginRight: '4px' }}>
              Aligner ({selectedNodes.length}) :
            </span>
            <button onClick={() => alignNodes('left')} title="Aligner à gauche" style={{ background: 'transparent', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: '3px' }}>
              <AlignLeft size={14} />
            </button>
            <button onClick={() => alignNodes('centerV')} title="Centrer verticalement" style={{ background: 'transparent', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: '3px' }}>
              <AlignCenter size={14} />
            </button>
            <button onClick={() => alignNodes('right')} title="Aligner à droite" style={{ background: 'transparent', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: '3px' }}>
              <AlignRight size={14} />
            </button>
            <div style={{ width: '1px', height: '14px', background: '#333640', margin: '0 2px' }} />
            <button onClick={() => alignNodes('top')} title="Aligner en haut" style={{ background: 'transparent', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: '3px' }}>
              <AlignVerticalJustifyCenter size={14} />
            </button>
            <button onClick={() => alignNodes('centerH')} title="Centrer horizontalement" style={{ background: 'transparent', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: '3px' }}>
              <AlignHorizontalDistributeCenter size={14} />
            </button>
            <button onClick={() => alignNodes('distributeH')} title="Distribuer horizontalement" style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '3px' }}>
              <AlignHorizontalDistributeCenter size={14} />
            </button>
          </div>
        )}

        <aside style={{
          width: isMobile ? '60px' : '235px',
          background: '#15161a',
          borderRight: '1px solid #262930',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10
        }}>
          <div style={{ padding: isMobile ? '6px 4px' : '10px 10px 6px 10px' }}>
            <button
              onClick={() => setShowCatalogModal(true)}
              style={{
                width: '100%',
                background: '#2563eb',
                border: 'none',
                borderRadius: '5px',
                padding: '7px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              title="Bibliothèque Complète"
            >
              <Maximize2 size={12} />
              {!isMobile && <span>Bibliothèque Complète</span>}
            </button>
          </div>

          {!isMobile && (
            <>
              <div style={{ padding: '0 10px 6px 10px' }}>
                <select
                  value={sidebarDomain}
                  onChange={(e) => setSidebarDomain(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    background: '#1d1f27',
                    border: '1px solid #2c303c',
                    borderRadius: '4px',
                    color: '#38bdf8',
                    fontSize: '10px',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {DOMAINS.map((dom) => (
                    <option key={dom.id} value={dom.id}>{dom.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ padding: '0 10px 6px 10px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={12} style={{ position: 'absolute', left: '7px', color: '#6b7280' }} />
                  <input
                    type="text"
                    placeholder="Filtrer..."
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 6px 4px 22px',
                      background: '#1d1f27',
                      border: '1px solid #2c303c',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '2px 4px' : '2px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sidebarEquipment.map((item) => {
              const meta = getCategoryMeta(item.category);
              const isFav = favorites.includes(item.id || item.label);

              return (
                <div
                  key={item.id || item.label}
                  draggable
                  onDragStart={(e) => onDragStart(e, item)}
                  onClick={() => handleAddDevice(item)}
                  title={`${item.label} (Cliquer pour poser ou glisser)`}
                  style={{
                    padding: isMobile ? '6px 4px' : '6px 8px',
                    background: '#1c1e25',
                    border: `1px solid ${isFav ? '#f59e0b40' : '#282a35'}`,
                    borderLeft: `3px solid ${meta.color}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{
                      fontSize: isMobile ? '9px' : '11px',
                      fontWeight: 600,
                      color: '#f3f4f6',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}>
                      {item.label}
                    </div>
                  </div>

                  {!isMobile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id || item.label);
                      }}
                      title="Favori"
                      style={{ background: 'transparent', border: 'none', color: isFav ? '#f59e0b' : '#4b5563', cursor: 'pointer', padding: '2px' }}
                    >
                      <Star size={11} fill={isFav ? '#f59e0b' : 'none'} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
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
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            // Navigation fluide trackpad (2 doigts) + clic molette souris
            panOnScroll={true}
            panOnScrollMode="free"
            zoomOnPinch={true}
            panOnDrag={[1]}
            selectionOnDrag={true}
            selectionMode="partial"
            deleteKeyCode={['Backspace', 'Delete']}
            snapToGrid={true}
            snapGrid={SNAP_GRID}
            fitView
          >
            <Background color="#23252b" gap={SNAP_GRID[0]} />
            <Controls showInteractive={false} />
            {!isMobile && <MiniMap nodeColor="#2d3139" maskColor="rgba(0, 0, 0, 0.7)" />}
          </ReactFlow>
        </main>

        {hasSelection && (!isMobile || mobileInspectorOpen) && (
          <aside style={{
            width: isMobile ? '260px' : '280px',
            position: isMobile ? 'absolute' : 'relative',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 40,
            background: '#16171a',
            borderLeft: '1px solid #282a30',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isMobile ? '-8px 0 24px rgba(0,0,0,0.8)' : 'none'
          }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #282a30', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af' }}>
                Inspecteur
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => {
                    if (selectedNode) deleteNodeById(selectedNode.id);
                    if (selectedEdge) deleteEdgeById(selectedEdge.id);
                  }}
                  title="Supprimer"
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                >
                  <Trash2 size={15} />
                </button>
                {isMobile && (
                  <button
                    onClick={() => setMobileInspectorOpen(false)}
                    style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {selectedEdge ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11px' }}>
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700 }}>
                      Liaison Câble
                    </span>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#f3f4f6', marginTop: '2px' }}>
                      {selectedEdge.data?.sourceType} ➔ {selectedEdge.data?.targetType}
                    </div>
                  </div>

                  <div>
                    <label style={{ color: '#9ca3af', display: 'block', marginBottom: '3px' }}>Libellé du câble</label>
                    <input
                      type="text"
                      placeholder="Ex: PGM Secours, NDI Cam 1..."
                      value={selectedEdge.data?.label || ''}
                      onChange={(e) => updateSelectedEdgeData('label', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        background: '#22242a',
                        border: '1px solid #333640',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#9ca3af', display: 'block', marginBottom: '3px' }}>Longueur standard</label>
                    <select
                      value={selectedEdge.data?.length || 'Non spécifié'}
                      onChange={(e) => updateSelectedEdgeData('length', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        background: '#22242a',
                        border: '1px solid #333640',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    >
                      {CABLE_STANDARD_LENGTHS.map((len) => (
                        <option key={len} value={len}>{len}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : selectedNode?.type === 'annotation' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '11px' }}>
                  <div>
                    <label style={{ color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Couleur</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {NOTE_COLORS.map((c) => {
                        const isCurrent = selectedNode.data.colorId === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => updateSelectedNodeData('colorId', c.id)}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: c.border,
                              border: isCurrent ? '2px solid #ffffff' : '2px solid transparent',
                              outline: isCurrent ? '2px solid #38bdf8' : 'none',
                              cursor: 'pointer',
                              padding: 0,
                              transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                              transition: 'transform 0.15s ease',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Contenu</label>
                    <textarea
                      rows={5}
                      placeholder="Écrire une note..."
                      value={selectedNode.data.text || ''}
                      onChange={(e) => updateSelectedNodeData('text', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        background: '#22242a',
                        border: '1px solid #333640',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '11px',
                        resize: 'none',
                        outline: 'none',
                        lineHeight: 1.4
                      }}
                    />
                  </div>
                </div>
              ) : selectedNode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                  {isProductLoading ? (
                    <div style={{ padding: '10px', textAlign: 'center', background: '#1c1e25', borderRadius: '6px', color: '#6b7280', fontSize: '10px' }}>
                      Recherche de l'image produit...
                    </div>
                  ) : productData?.imageUrl ? (
                    <div style={{
                      background: '#191b22',
                      border: '1px solid #282c38',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      marginBottom: '4px'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '110px',
                        background: '#0d0e12',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid #262934',
                        position: 'relative'
                      }}>
                        <img
                          src={productData.imageUrl}
                          alt={productData.title}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100px',
                            objectFit: 'contain',
                            padding: '4px'
                          }}
                        />
                      </div>
                      <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#e5e7eb' }}>
                          {productData.title}
                        </span>
                        {productData.pageUrl && (
                          <a
                            href={productData.pageUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Ouvrir la page source de l'image"
                            style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none', fontSize: '9px' }}
                          >
                            <ExternalLink size={10} /> Source
                          </a>
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label style={{ color: '#9ca3af', display: 'block', marginBottom: '3px' }}>Modèle de produit</label>
                    <input
                      type="text"
                      value={selectedNode.data.label || ''}
                      onChange={(e) => updateSelectedNodeData('label', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        background: '#22242a',
                        border: '1px solid #333640',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <button
                      onClick={() => {
                        const q = encodeURIComponent(`${selectedNode.data.brand || ''} ${selectedNode.data.label || ''}`.trim());
                        window.open(`https://www.google.com/search?q=${q}`, '_blank');
                      }}
                      style={{
                        marginTop: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      <ExternalLink size={11} /> Recherche Google complète
                    </button>
                  </div>

                  <div>
                    <label style={{ color: '#38bdf8', display: 'block', marginBottom: '3px', fontWeight: 600 }}>
                      Fonction / Rôle (ex: Cam Large, PC Diff)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Cam Large, PC Diff, Retour Régie..."
                      value={selectedNode.data.role || ''}
                      onChange={(e) => updateSelectedNodeData('role', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        background: '#22242a',
                        border: '1px solid #38bdf8',
                        borderRadius: '4px',
                        color: '#38bdf8',
                        fontSize: '11px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#9ca3af', display: 'block', marginBottom: '3px' }}>Catégorie</label>
                    <select
                      value={normalizeCategoryId(selectedNode.data.category)}
                      onChange={(e) => updateSelectedNodeData('category', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        background: '#22242a',
                        border: '1px solid #333640',
                        borderRadius: '4px',
                        color: '#d1d5db',
                        fontSize: '11px'
                      }}
                    >
                      {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ color: '#9ca3af', display: 'block', marginBottom: '3px' }}>Emplacement</label>
                    <input
                      type="text"
                      placeholder="Régie, Plateau, Scène..."
                      value={selectedNode.data.location || ''}
                      onChange={(e) => updateSelectedNodeData('location', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        background: '#22242a',
                        border: '1px solid #333640',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#06b6d4', display: 'block', marginBottom: '3px', fontWeight: 600 }}>
                      Adresse IP (affichée sur le schéma)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 192.168.10.50"
                      value={selectedNode.data.ip || ''}
                      onChange={(e) => updateSelectedNodeData('ip', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        background: '#22242a',
                        border: '1px solid #06b6d4',
                        borderRadius: '4px',
                        color: '#06b6d4',
                        fontFamily: 'monospace',
                        fontSize: '11px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#9ca3af', display: 'block', marginBottom: '3px' }}>Puissance (Watts)</label>
                      <input
                        type="number"
                        placeholder="Ex: 120"
                        value={selectedNode.data.powerWatts || ''}
                        onChange={(e) => updateSelectedNodeData('powerWatts', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '5px 7px',
                          background: '#22242a',
                          border: '1px solid #333640',
                          borderRadius: '4px',
                          color: '#fbbf24',
                          fontSize: '11px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '16px' }}>
                      <input
                        type="checkbox"
                        id="powerCheck"
                        checked={!!selectedNode.data.power}
                        onChange={(e) => updateSelectedNodeData('power', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label htmlFor="powerCheck" style={{ color: '#d1d5db', cursor: 'pointer' }}>Alim 230V</label>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #282a30', paddingTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}>
                        Connecteurs
                      </span>
                      <button
                        onClick={() => setShowAddPortModal(true)}
                        style={{
                          background: '#2563eb',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '3px 8px',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Plus size={11} /> Ajouter des ports
                      </button>
                    </div>
                    
                    {/* ENTRÉES LATÉRALES (IN) */}
                    <div style={{ marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 600 }}>📥 Entrées (IN - Gauche)</span>
                      <div style={{ marginTop: '3px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {(selectedNode.data.inputs || []).map((p) => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#202227', padding: '3px 6px', borderRadius: '4px' }}>
                            <span style={{ fontSize: '10px', opacity: p.visible === false ? 0.4 : 1 }}>
                              {p.name} ({p.type})
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <button
                                onClick={() => togglePortVisibility('inputs', p.id)}
                                title={p.visible === false ? "Afficher le port" : "Masquer le port"}
                                style={{ background: 'transparent', border: 'none', color: p.visible === false ? '#6b7280' : '#22c55e', cursor: 'pointer', padding: 0 }}
                              >
                                {p.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button
                                onClick={() => handleRemovePortFromInspector('inputs', p.id)}
                                title="Supprimer ce port"
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SORTIES LATÉRALES (OUT) */}
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#a78bfa', fontWeight: 600 }}>📤 Sorties (OUT - Droite)</span>
                      <div style={{ marginTop: '3px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {(selectedNode.data.outputs || []).map((p) => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#202227', padding: '3px 6px', borderRadius: '4px' }}>
                            <span style={{ fontSize: '10px', opacity: p.visible === false ? 0.4 : 1 }}>
                              {p.name} ({p.type})
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <button
                                onClick={() => togglePortVisibility('outputs', p.id)}
                                title={p.visible === false ? "Afficher le port" : "Masquer le port"}
                                style={{ background: 'transparent', border: 'none', color: p.visible === false ? '#6b7280' : '#22c55e', cursor: 'pointer', padding: 0 }}
                              >
                                {p.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button
                                onClick={() => handleRemovePortFromInspector('outputs', p.id)}
                                title="Supprimer ce port"
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PORTS BIDIRECTIONNELS DÉDIÉS (FACE INFÉRIEURE) */}
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 600 }}>🔄 Bidirectionnel / Réseau (Face Inférieure)</span>
                      <div style={{ marginTop: '3px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {(selectedNode.data.bidirectional || []).length === 0 ? (
                          <span style={{ fontSize: '9px', color: '#6b7280', fontStyle: 'italic', paddingLeft: '4px' }}>Aucun port bidirectionnel</span>
                        ) : (
                          (selectedNode.data.bidirectional || []).map((p) => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#202227', padding: '3px 6px', borderRadius: '4px' }}>
                              <span style={{ fontSize: '10px', opacity: p.visible === false ? 0.4 : 1, color: '#a7f3d0' }}>
                                {p.name} ({p.type})
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <button
                                  onClick={() => togglePortVisibility('bidirectional', p.id)}
                                  title={p.visible === false ? "Afficher le port" : "Masquer le port"}
                                  style={{ background: 'transparent', border: 'none', color: p.visible === false ? '#6b7280' : '#22c55e', cursor: 'pointer', padding: 0 }}
                                >
                                  {p.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                                <button
                                  onClick={() => handleRemovePortFromInspector('bidirectional', p.id)}
                                  title="Supprimer ce port"
                                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        )}
      </div>

      <CatalogModal
        show={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        equipmentList={equipmentLibrary}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onSelectEquipment={handleAddDevice}
        onReloadEquipment={fetchEquipment}
      />

      <ProjectModal
        show={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        data={projectData}
        onChange={(field, value) => setProjectData((prev) => ({ ...prev, [field]: value }))}
      />

      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        config={exportConfig}
        onConfigChange={(field, value) => setExportConfig((prev) => ({ ...prev, [field]: value }))}
        onExecute={executeExport}
        isExporting={isExporting}
      />

      <EquipmentListModal
        show={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        nodes={nodes}
        edges={edges}
        projectTitle={projectData.title}
      />
    </div>
  );
}