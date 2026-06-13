'use client';

import React, { useRef, useEffect, useState } from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  type: 'COMPANY' | 'MODEL' | 'INVESTOR' | 'TECH';
  x: number;
  y: number;
  size: number;
  color: string;
  description: string;
}

interface Link {
  source: string;
  target: string;
  relation: string;
}

export default function EcosystemMap({ onSelectNode }: { onSelectNode: (node: Node | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState(1.0);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Constants
  const nodes: Node[] = [
    { id: 'openai', name: 'OpenAI', type: 'COMPANY', x: 400, y: 180, size: 25, color: '#ecdcd3', description: 'Leading AI research laboratory, creators of GPT models and custom reasoning interfaces.' },
    { id: 'anthropic', name: 'Anthropic', type: 'COMPANY', x: 580, y: 280, size: 24, color: '#ecdcd3', description: 'Safety-focused AI firm backing Constitutional alignment and Claude models.' },
    { id: 'google', name: 'Google DeepMind', type: 'COMPANY', x: 250, y: 250, size: 24, color: '#ecdcd3', description: 'Unified AI research division responsible for Gemini models and molecular folding algorithms.' },
    { id: 'gpt-5', name: 'GPT-5 Preview', type: 'MODEL', x: 320, y: 80, size: 16, color: '#c28854', description: 'Reasoning model architecture with native multi-agent declarations.' },
    { id: 'claude-3-5', name: 'Claude 3.5 Sonnet', type: 'MODEL', x: 680, y: 200, size: 16, color: '#c28854', description: 'Top-tier text reasoning model with graph context mappings.' },
    { id: 'microsoft', name: 'Microsoft', type: 'INVESTOR', x: 200, y: 100, size: 20, color: '#8b5a2b', description: 'Primary infrastructure cloud partner and major backer of OpenAI.' },
    { id: 'amazon', name: 'Amazon Web Services', type: 'INVESTOR', x: 700, y: 380, size: 20, color: '#8b5a2b', description: 'Cloud host and provider backing Amazon Bedrock and Anthropic integrations.' },
    { id: 'qdrant', name: 'Qdrant Vector DB', type: 'TECH', x: 450, y: 380, size: 18, color: '#ecdcd3', description: 'Distributed high-throughput vector database handling real-time indexing.' },
    { id: 'perplexity', name: 'Perplexity AI', type: 'COMPANY', x: 300, y: 350, size: 22, color: '#ecdcd3', description: 'Conversational web search engine utilizing semantic retrieval APIs.' }
  ];

  const links: Link[] = [
    { source: 'openai', target: 'gpt-5', relation: 'Develops' },
    { source: 'anthropic', target: 'claude-3-5', relation: 'Develops' },
    { source: 'microsoft', target: 'openai', relation: 'Partnership' },
    { source: 'amazon', target: 'anthropic', relation: 'Investment' },
    { source: 'openai', target: 'qdrant', relation: 'Infrastructure' },
    { source: 'anthropic', target: 'qdrant', relation: 'Infrastructure' },
    { source: 'perplexity', target: 'openai', relation: 'API Client' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const handleResize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight || 400;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Apply pan & zoom transformations
      ctx.translate(canvas.width / 2 + panOffset.x, canvas.height / 2 + panOffset.y);
      ctx.scale(zoomScale, zoomScale);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(44, 31, 27, 0.25)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = -2000; x < 2000; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -2000);
        ctx.lineTo(x, 2000);
        ctx.stroke();
      }
      for (let y = -2000; y < 2000; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-2000, y);
        ctx.lineTo(2000, y);
        ctx.stroke();
      }

      // 1. Draw Links
      links.forEach((link) => {
        const srcNode = nodes.find(n => n.id === link.source);
        const tgtNode = nodes.find(n => n.id === link.target);
        if (!srcNode || !tgtNode) return;

        ctx.beginPath();
        ctx.moveTo(srcNode.x - 400, srcNode.y - 230);
        ctx.lineTo(tgtNode.x - 400, tgtNode.y - 230);
        ctx.strokeStyle = 'rgba(194, 136, 84, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Relation label
        const midX = (srcNode.x + tgtNode.x) / 2 - 400;
        const midY = (srcNode.y + tgtNode.y) / 2 - 230;
        ctx.font = '8px monospace';
        ctx.fillStyle = '#a5968f';
        ctx.textAlign = 'center';
        ctx.fillText(link.relation, midX, midY - 4);
      });

      // 2. Draw Nodes
      nodes.forEach((node) => {
        const nx = node.x - 400;
        const ny = node.y - 230;
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNodeId === node.id;

        // Glowing backdrop ring if selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(nx, ny, node.size + 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(194, 136, 84, 0.15)';
          ctx.fill();
        }

        // Outer ring outline
        ctx.beginPath();
        ctx.arc(nx, ny, node.size + (isHovered ? 4 : 0), 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#c28854' : 'rgba(44, 31, 27, 0.8)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        // Node center
        ctx.beginPath();
        ctx.arc(nx, ny, node.size - 2, 0, Math.PI * 2);
        ctx.fillStyle = node.type === 'MODEL' ? '#c28854' : node.type === 'INVESTOR' ? '#8b5a2b' : '#18110e';
        ctx.fill();
        ctx.strokeStyle = '#2c1f1b';
        ctx.stroke();

        // Node label
        ctx.font = 'bold 9.5px sans-serif';
        ctx.fillStyle = isSelected ? '#fff' : '#ecdcd3';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, nx, ny + node.size + 14);

        // Node subtitle
        ctx.font = '7.5px monospace';
        ctx.fillStyle = '#a5968f';
        ctx.fillText(node.type, nx, ny + node.size + 22);
      });

      ctx.restore();
      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [panOffset, zoomScale, hoveredNode, selectedNodeId]);

  // Mouse interaction handlers
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    // Transform coordinates back from zoom and pan offsets
    const transformedX = (clientX - canvas.width / 2 - panOffset.x) / zoomScale;
    const transformedY = (clientY - canvas.height / 2 - panOffset.y) / zoomScale;
    
    return { x: transformedX + 400, y: transformedY + 230 };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };

    // Node click selection check
    const coords = getCanvasCoords(e);
    const clickedNode = nodes.find(node => {
      const dx = node.x - coords.x;
      const dy = node.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.size;
    });

    if (clickedNode) {
      setSelectedNodeId(clickedNode.id);
      onSelectNode(clickedNode);
      isDragging.current = false; // block drag on click
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      setPanOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    } else {
      const coords = getCanvasCoords(e);
      const hovered = nodes.find(node => {
        const dx = node.x - coords.x;
        const dy = node.y - coords.y;
        return Math.sqrt(dx * dx + dy * dy) <= node.size;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 0.05;
    const nextScale = e.deltaY < 0 ? zoomScale + scaleFactor : zoomScale - scaleFactor;
    setZoomScale(Math.min(Math.max(0.5, nextScale), 2.0));
  };

  const resetView = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoomScale(1.0);
    setSelectedNodeId(null);
    onSelectNode(null);
  };

  return (
    <div ref={containerRef} className="relative w-full h-[450px] bg-[#070403] border border-coffee-border/40 rounded-xl overflow-hidden shadow-inner group">
      {/* Help Overlay controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={resetView}
          className="px-2.5 py-1.5 bg-[#0f0a08]/90 hover:bg-coffee-border/60 border border-coffee-border/40 text-coffee-cream rounded text-[10px] font-mono flex items-center gap-1 transition-colors backdrop-blur-md"
        >
          <RefreshCw className="w-3 h-3 text-coffee-accent" />
          <span>Reset Map</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 text-[9px] font-mono text-coffee-text-muted bg-[#0f0a08]/90 border border-coffee-border/40 p-2 rounded backdrop-blur-md flex items-center gap-1">
        <HelpCircle className="w-3.5 h-3.5 text-coffee-accent" />
        <span>Drag to pan, Scroll to zoom, Click nodes</span>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
