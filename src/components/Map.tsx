import React, { FC, useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Beneficiary, Ward, Neighborhood } from '../data/mockData';

interface MapProps {
  beneficiaries: Beneficiary[];
  wards: Ward[];
  neighborhoods?: Neighborhood[];
  boundary?: [number, number][];
  highlightWards: number[];
  filter: any;
  onCategoryToggle?: (category: string | null) => void;
}

export const CATEGORY_COLORS: Record<string, string> = {
  healthcare: '#3b82f6', // Blue
  education: '#22c55e', // Green
  issue_resolution: '#f59e0b', // Yellow/Orange
  smart_voter: '#a855f7', // Purple
  direct_call: '#ec4899', // Pink
  jobs: '#06b6d4', // Cyan
};

// Tile helper
const getTileUrl = (x: number, y: number, z: number) => {
  const s = ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)];
  return `https://${s}.basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}.png`;
};

export const ImpactMap: FC<MapProps> = ({ beneficiaries, wards, neighborhoods, boundary, highlightWards, filter, onCategoryToggle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef(d3.zoomIdentity);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);
  const tileCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const filteredData = useMemo(() => {
    return beneficiaries.filter(b => {
      if (filter.category && b.category !== filter.category) return false;
      if (filter.urgency && b.urgency !== filter.urgency) return false;
      return true;
    });
  }, [beneficiaries, filter]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const { width, height } = containerRef.current!.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    window.addEventListener('resize', resize);

    const projection = d3.geoMercator()
      .center([79.4304381, 28.3670355])
      .scale(300000)
      .translate([canvas.width / (2 * window.devicePixelRatio), canvas.height / (2 * window.devicePixelRatio)]);

    const zoom = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.5, 20])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
      });

    zoomBehaviorRef.current = zoom;
    d3.select(canvas).call(zoom);

    const cssWidth = canvas.width / window.devicePixelRatio;
    const cssHeight = canvas.height / window.devicePixelRatio;
    
    let currentTransform = transformRef.current;
    if (currentTransform.k === 1 && currentTransform.x === 0 && currentTransform.y === 0) {
      currentTransform = d3.zoomIdentity
        .translate(cssWidth / 2, cssHeight / 2)
        .scale(2.25)
        .translate(-cssWidth / 2, -cssHeight / 2);
    }
    
    d3.select(canvas).call(zoom.transform, currentTransform);

    let animationFrame: number;
    const particles = filteredData.map(b => {
      const idHash = b.id.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return {
        ...b,
        baseX: projection([b.lng, b.lat])![0],
        baseY: projection([b.lng, b.lat])![1],
        idHash,
      };
    });

    const render = () => {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      const transform = transformRef.current;
      
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // 1. Draw Real Map Tiles
      const k = transform.k;
      const z = Math.max(12, Math.min(18, Math.floor(Math.log2(k * 300000 * 2 * Math.PI / 256))));
      const n = Math.pow(2, z);
      const worldSize = 2 * Math.PI * 300000;
      const tileSize = worldSize / n;

      // Calculate current center in lon/lat to find visible tiles
      const cssWidth = canvas.width / window.devicePixelRatio;
      const cssHeight = canvas.height / window.devicePixelRatio;
      const centerLonLat = projection.invert([(cssWidth / 2 - transform.x) / k, (cssHeight / 2 - transform.y) / k])!;
      
      const centerTileX = (centerLonLat[0] + 180) / 360 * n;
      const centerTileY = (1 - Math.log(Math.tan(centerLonLat[1] * Math.PI / 180) + 1 / Math.cos(centerLonLat[1] * Math.PI / 180)) / Math.PI) / 2 * n;

      // Calculate range based on viewport size
      const rangeX = Math.ceil(cssWidth / (tileSize * k)) + 1;
      const rangeY = Math.ceil(cssHeight / (tileSize * k)) + 1;

      for (let dx = -rangeX; dx <= rangeX; dx++) {
        for (let dy = -rangeY; dy <= rangeY; dy++) {
          const tx = Math.floor(centerTileX) + dx;
          const ty = Math.floor(centerTileY) + dy;
          
          if (tx < 0 || tx >= n || ty < 0 || ty >= n) continue;
          
          const key = `${z}/${tx}/${ty}`;
          let img = tileCache.current.get(key);
          if (!img) {
            img = new Image();
            img.src = getTileUrl(tx, ty, z);
            img.onload = () => { /* trigger redraw if needed */ };
            tileCache.current.set(key, img);
          }

          if (img.complete) {
            const lon1 = tx / n * 360 - 180;
            const lat1 = Math.atan(Math.sinh(Math.PI * (1 - 2 * ty / n))) * 180 / Math.PI;
            const pos = projection([lon1, lat1])!;
            
            // Use a tiny overlap (0.5px) to prevent seams
            ctx.drawImage(img, pos[0] - 0.25, pos[1] - 0.25, tileSize + 0.5, tileSize + 0.5);
          }
        }
      }

      // 1.5 Draw Boundary (Muted for a more sober look)
      if (boundary && boundary.length > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; // Muted white/gray
        ctx.lineWidth = 1.5 / k;
        ctx.setLineDash([10 / k, 5 / k]);
        ctx.beginPath();
        boundary.forEach((coord, i) => {
          const [x, y] = projection([coord[1], coord[0]])!;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw Particles
      const visibleBeneficiaries = particles.filter(p => {
        if (filter.category && p.category !== filter.category) return false;
        if (filter.urgency && p.urgency !== filter.urgency) return false;
        return true;
      });

      visibleBeneficiaries.forEach(p => {
        const now = Date.now();
        const age = now - p.timestamp;
        const color = CATEGORY_COLORS[p.category];
        
        if (age < 2000) {
          // Shooting star effect for new particles - they shine and twinkle
          const speed = 0.001 + (p.idHash % 10) * 0.0005;
          const alpha = (Math.sin(now * speed + p.idHash) + 1) / 2;
          
          ctx.shadowBlur = 8 / k;
          ctx.shadowColor = color;
          ctx.fillStyle = color;
          ctx.globalAlpha = Math.max(0.4, alpha);
          
          const progress = age / 2000;
          const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          
          const startX = p.baseX + 100 / k;
          const startY = p.baseY - 200 / k;
          
          const currentX = startX + (p.baseX - startX) * easeProgress;
          const currentY = startY + (p.baseY - startY) * easeProgress;
          
          // Draw trail
          ctx.beginPath();
          const trailStartX = startX + (currentX - startX) * Math.max(0, easeProgress - 0.2);
          const trailStartY = startY + (currentY - startY) * Math.max(0, easeProgress - 0.2);
          ctx.moveTo(trailStartX, trailStartY);
          ctx.lineTo(currentX, currentY);
          
          // Gradient for trail
          if (Math.abs(currentX - trailStartX) > 0.1 || Math.abs(currentY - trailStartY) > 0.1) {
            const gradient = ctx.createLinearGradient(trailStartX, trailStartY, currentX, currentY);
            gradient.addColorStop(0, 'rgba(255,255,255,0)');
            gradient.addColorStop(1, color);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2 / k;
            ctx.stroke();
          }
          
          // Draw particle head
          ctx.beginPath();
          ctx.arc(currentX, currentY, 3 / k, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else {
          // Settled particles - no shine, no twinkle
          ctx.shadowBlur = 0;
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.6; // Constant alpha for background particles
          ctx.beginPath();
          ctx.arc(p.baseX, p.baseY, 2 / k, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Draw Labels (Wards & Neighborhoods) - Drawn after particles to stay on top
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      // 4.1 Draw Wards
      wards.forEach(ward => {
        const isHighlighted = highlightWards.includes(ward.id);
        const shouldShowAll = k > 3.5;
        
        if (!isHighlighted && !shouldShowAll) return;
        
        const [x, y] = projection([ward.center[1], ward.center[0]])!;
        
        ctx.save();
        const wardAlpha = isHighlighted ? 1.0 : Math.min(0.5, (k - 3.5) * 0.5);
        ctx.globalAlpha = wardAlpha;
        ctx.fillStyle = isHighlighted ? 'rgba(255, 255, 255, 0.9)' : 'rgba(156, 163, 175, 0.8)'; 
        ctx.font = `${isHighlighted ? 'bold' : 'normal'} ${10 / k}px Inter`;
        ctx.textAlign = 'center';
        ctx.fillText(ward.name.toUpperCase(), x, y);
        ctx.restore();
      });

      // 4.2 Draw Neighborhood Labels
      if (neighborhoods) {
        neighborhoods.forEach(n => {
          const pos = projection([n.center[1], n.center[0]])!;
          
          if (n.type === 'macro') {
            const macroAlpha = Math.max(0, 1 - (k - 1.2) * 1.5);
            if (macroAlpha <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = macroAlpha;
            ctx.fillStyle = 'rgba(156, 163, 175, 1)'; 
            ctx.font = `bold ${24 / k}px Inter`;
            ctx.textAlign = 'center';
            ctx.shadowBlur = 10 / k;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText(n.name, pos[0], pos[1]);
            ctx.restore();
          } else if (k > 1.8) {
            const fadeIn = Math.min(1, (k - 1.8) * 2);
            const fadeOut = Math.max(0, 1 - (k - 4.5) * 1.5);
            const microAlpha = fadeIn * fadeOut;
            if (microAlpha <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = microAlpha;
            ctx.fillStyle = 'rgba(156, 163, 175, 0.9)'; 
            ctx.font = `bold ${13 / k}px Inter`;
            ctx.textAlign = 'center';
            ctx.shadowBlur = 4 / k;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.fillText(n.name.toUpperCase(), pos[0], pos[1]);
            
            ctx.beginPath();
            ctx.arc(pos[0], pos[1] + (7 / k), 2.5 / k, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(16, 185, 129, ${microAlpha})`;
            ctx.fill();
            ctx.restore();
          }
        });
      }
      ctx.restore();

      ctx.restore();

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [filteredData, wards, highlightWards, filter.category]);

  const handleZoomIn = () => {
    if (canvasRef.current && zoomBehaviorRef.current) {
      d3.select(canvasRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 1.5);
    }
  };

  const handleZoomOut = () => {
    if (canvasRef.current && zoomBehaviorRef.current) {
      d3.select(canvasRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 0.75);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#050505] relative overflow-hidden cursor-move">
      <canvas ref={canvasRef} className="block" />
      
      <div className="absolute top-8 left-8 flex flex-col gap-2 z-10">
        <button onClick={handleZoomIn} className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">+</button>
        <button onClick={handleZoomOut} className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">-</button>
      </div>

    </div>
  );
};
