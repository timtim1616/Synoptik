// src/components/CustomEdge.jsx
import React from 'react';
import { EdgeLabelRenderer, useNodes, useEdges } from '@xyflow/react';
import { SIGNAL_COLORS } from '../constants/equipment.js';
import { AlertTriangle, X } from 'lucide-react';

export const CABLE_STANDARD_LENGTHS = [
  'Non spécifié',
  '1m',
  '2m',
  '3m',
  '5m',
  '10m',
  '15m',
  '20m',
  '30m',
  '50m',
  '75m',
  '100m'
];

function segmentIntersectsBox(p1, p2, box) {
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  if (maxX < box.x || minX > box.x + box.w || maxY < box.y || minY > box.y + box.h) {
    return false;
  }
  if (Math.abs(p1.y - p2.y) < 0.5) {
    return p1.y >= box.y && p1.y <= box.y + box.h && maxX >= box.x && minX <= box.x + box.w;
  }
  if (Math.abs(p1.x - p2.x) < 0.5) {
    return p1.x >= box.x && p1.x <= box.x + box.w && maxY >= box.y && minY <= box.y + box.h;
  }
  return true;
}

function buildHorizontalSegmentWithHops(xStart, y, xEnd, crossingXs, rHop = 5) {
  const dir = xEnd >= xStart ? 1 : -1;
  const minX = Math.min(xStart, xEnd);
  const maxX = Math.max(xStart, xEnd);

  const validCrossings = crossingXs
    .filter((cx) => cx > minX + 10 && cx < maxX - 10)
    .sort((a, b) => (dir === 1 ? a - b : b - a));

  if (validCrossings.length === 0) {
    return `L ${xEnd} ${y}`;
  }

  const parts = [];
  validCrossings.forEach((cx) => {
    parts.push(`L ${cx - dir * rHop} ${y}`);
    const sweep = dir === 1 ? 1 : 0;
    parts.push(`A ${rHop} ${rHop} 0 0 ${sweep} ${cx + dir * rHop} ${y}`);
  });

  parts.push(`L ${xEnd} ${y}`);
  return parts.join(' ');
}

export default function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  sourceHandleId,
  targetHandleId,
  style = {},
  data = {},
  selected,
}) {
  const nodes = useNodes();
  const allEdges = useEdges();

  const computePath = () => {
    const isSourceBottom = sourcePosition === 'bottom';
    const isTargetBottom = targetPosition === 'bottom';

    const margin = 8;
    const allNodeBoxes = nodes.map((n) => {
      const w = n.measured?.width || n.width || 220;
      const h = n.measured?.height || n.height || 130;
      return {
        id: n.id,
        rawX: n.position.x,
        rawY: n.position.y,
        rawW: w,
        rawH: h,
        x: n.position.x - margin,
        y: n.position.y - margin,
        w: w + margin * 2,
        h: h + margin * 2,
      };
    });

    const obstacles = allNodeBoxes.filter((n) => n.id !== source && n.id !== target);
    const targetNodeBox = allNodeBoxes.find((b) => b.id === target);
    const sourceNodeBox = allNodeBoxes.find((b) => b.id === source);

    // 1. GESTION DES CONNECTEURS INFÉRIEURS (USB, SSD, RJ45)
    if (isSourceBottom || isTargetBottom) {
      if (isSourceBottom && isTargetBottom) {
        const yDiff = Math.abs(targetY - sourceY);

        // Boîtiers côte-à-côte sans décalage vertical important
        if (yDiff < 45) {
          let corridorY = Math.max(sourceY, targetY) + 18;
          obstacles.forEach((obs) => {
            if (segmentIntersectsBox({ x: sourceX, y: corridorY }, { x: targetX, y: corridorY }, obs)) {
              corridorY = Math.max(corridorY, obs.rawY + obs.rawH + 14);
            }
          });

          const path = [
            `M ${sourceX} ${sourceY}`,
            `L ${sourceX} ${corridorY}`,
            `L ${targetX} ${corridorY}`,
            `L ${targetX} ${targetY}`
          ].join(' ');

          return { path, labelX: (sourceX + targetX) / 2, labelY: corridorY };
        }

        // Cas vertical : une machine est au-dessus de l'autre (ex : ATEM -> SSD ou ATEM -> PC)
        const goingDown = sourceY < targetY;
        const goingRight = sourceX <= targetX;
        const lowerNode = goingDown ? targetNodeBox : sourceNodeBox;

        // Vérification si la descente directe depuis la source traverse un obstacle OU le boîtier cible lui-même
        const directLineIntersectsObstacle = obstacles.some((obs) =>
          segmentIntersectsBox({ x: sourceX, y: sourceY }, { x: sourceX, y: targetY + 16 }, obs)
        );

        const directLineEntersTargetBody = targetNodeBox &&
          sourceX >= targetNodeBox.rawX - 6 &&
          sourceX <= targetNodeBox.rawX + targetNodeBox.rawW + 6 &&
          sourceY < targetNodeBox.rawY;

        if (directLineIntersectsObstacle || directLineEntersTargetBody) {
          // Déterminer le boîtier qui bloque le passage direct
          const blockingBox = (directLineEntersTargetBody ? targetNodeBox : null) ||
            obstacles.find((obs) => segmentIntersectsBox({ x: sourceX, y: sourceY }, { x: sourceX, y: targetY + 20 }, obs)) ||
            lowerNode;

          // Choix du contournement le plus court
          const rightBypass = (blockingBox?.rawX || 0) + (blockingBox?.rawW || 220) + 18;
          const leftBypass = (blockingBox?.rawX || 0) - 18;

          let bypassX;
          if (goingRight) {
            bypassX = rightBypass;
          } else {
            bypassX = Math.abs(sourceX - rightBypass) < Math.abs(sourceX - leftBypass) ? rightBypass : leftBypass;
          }

          const corridorUnderLower = Math.max(sourceY, targetY) + 18;

          if (goingDown) {
            const stepY = sourceY + 14;
            const path = [
              `M ${sourceX} ${sourceY}`,
              `L ${sourceX} ${stepY}`,
              `L ${bypassX} ${stepY}`,
              `L ${bypassX} ${corridorUnderLower}`,
              `L ${targetX} ${corridorUnderLower}`,
              `L ${targetX} ${targetY}`
            ].join(' ');

            return { path, labelX: bypassX, labelY: (sourceY + corridorUnderLower) / 2 };
          } else {
            const corridorUnderSource = sourceY + 18;
            const stepY = targetY + 14;
            const path = [
              `M ${sourceX} ${sourceY}`,
              `L ${sourceX} ${corridorUnderSource}`,
              `L ${bypassX} ${corridorUnderSource}`,
              `L ${bypassX} ${stepY}`,
              `L ${targetX} ${stepY}`,
              `L ${targetX} ${targetY}`
            ].join(' ');

            return { path, labelX: bypassX, labelY: (sourceY + targetY) / 2 };
          }
        }

        // Descente directe libre
        const dropY = targetY + 18;
        const path = [
          `M ${sourceX} ${sourceY}`,
          `L ${sourceX} ${dropY}`,
          `L ${targetX} ${dropY}`,
          `L ${targetX} ${targetY}`
        ].join(' ');

        return { path, labelX: (sourceX + targetX) / 2, labelY: dropY };
      }

      // Sortie basse vers entrée latérale
      if (isSourceBottom && !isTargetBottom) {
        const exitY = sourceY + 16;
        const approachX = targetX - (sourceX < targetX ? 24 : -24);
        const path = [
          `M ${sourceX} ${sourceY}`,
          `L ${sourceX} ${exitY}`,
          `L ${approachX} ${exitY}`,
          `L ${approachX} ${targetY}`,
          `L ${targetX} ${targetY}`
        ].join(' ');
        return { path, labelX: sourceX, labelY: exitY };
      }

      // Sortie latérale vers entrée basse
      if (!isSourceBottom && isTargetBottom) {
        const entryY = targetY + 18;
        const exitX = sourceX + (sourceX < targetX ? 24 : -24);
        const path = [
          `M ${sourceX} ${sourceY}`,
          `L ${exitX} ${sourceY}`,
          `L ${exitX} ${entryY}`,
          `L ${targetX} ${entryY}`,
          `L ${targetX} ${targetY}`
        ].join(' ');
        return { path, labelX: targetX, labelY: entryY };
      }
    }

    // 2. LIAISONS LATÉRALES (In / Out) AVEC ÉCHELONNEMENT ET DÉGAGEMENT D'OBSTACLE
    const deltaY = targetY - sourceY;
    const isComingFromAbove = deltaY > 6;
    const isComingFromBelow = deltaY < -6;

    const targetNode = nodes.find((n) => n.id === target);
    const cleanHandle = (targetHandleId || '').replace('_src', '').replace('_tgt', '');
    const sideInputs = (targetNode?.data?.inputs || []).filter(
      (p) => p && p.visible !== false && p.type !== 'RJ45' && p.type !== 'USB' && p.type !== 'USB-C' && !p.isBiDirectional
    );

    let portIndex = sideInputs.findIndex((p) => p.id === cleanHandle);
    if (portIndex === -1) {
      portIndex = Math.max(0, Math.round((targetY - (targetNode?.position?.y || 0) - 45) / 24));
    }

    const totalSideInputs = Math.max(sideInputs.length, 8);
    const laneSpacing = 18;
    const baseEntryClearance = 26;

    let laneIndex = 0;
    if (isComingFromBelow) {
      laneIndex = Math.max(0, (totalSideInputs - 1) - portIndex);
    } else if (isComingFromAbove) {
      laneIndex = Math.max(0, portIndex);
    }

    let verticalLaneX;
    if (sourceX < targetX) {
      verticalLaneX = targetX - baseEntryClearance - (laneIndex * laneSpacing);
      verticalLaneX = Math.max(sourceX + 28, verticalLaneX);
    } else {
      verticalLaneX = targetX + baseEntryClearance + (laneIndex * laneSpacing);
      verticalLaneX = Math.min(sourceX - 28, verticalLaneX);
    }

    // Si un obstacle (ex: le SSD) est posé sur ce couloir vertical ou sur la zone d'approche
    const minY = Math.min(sourceY, targetY);
    const maxY = Math.max(sourceY, targetY);
    const blockingObstacleOnLane = obstacles.find((obs) => {
      const inYRange = !(obs.rawY + obs.rawH < minY || obs.rawY > maxY);
      const inXRange = verticalLaneX >= obs.rawX - 10 && verticalLaneX <= obs.rawX + obs.rawW + 10;
      return inYRange && inXRange;
    });

    if (blockingObstacleOnLane && sourceX < targetX) {
      // Décaler le couloir vertical à gauche de l'obstacle pour éviter tout écrasement sous la boîte
      verticalLaneX = Math.min(verticalLaneX, blockingObstacleOnLane.rawX - 16 - (laneIndex * 10));
    }

    // Détection d'intersection directe sur les segments
    const segH1 = [{ x: sourceX, y: sourceY }, { x: verticalLaneX, y: sourceY }];
    const segV  = [{ x: verticalLaneX, y: sourceY }, { x: verticalLaneX, y: targetY }];
    const segH2 = [{ x: verticalLaneX, y: targetY }, { x: targetX, y: targetY }];

    let hitObs = null;
    for (const obs of obstacles) {
      if (
        segmentIntersectsBox(segH1[0], segH1[1], obs) ||
        segmentIntersectsBox(segV[0], segV[1], obs) ||
        segmentIntersectsBox(segH2[0], segH2[1], obs)
      ) {
        hitObs = obs;
        break;
      }
    }

    if (hitObs) {
      const goBelow = Math.max(sourceY, targetY) >= hitObs.rawY + hitObs.rawH / 2;
      const tightMarginY = 10;
      const detourY = goBelow
        ? hitObs.rawY + hitObs.rawH + tightMarginY + ((laneIndex % 3) * 8)
        : hitObs.rawY - tightMarginY - ((laneIndex % 3) * 8);

      const tightMarginX = 14;
      const bypassX = sourceX < targetX
        ? Math.min(verticalLaneX, hitObs.rawX - tightMarginX - (laneIndex * 8))
        : Math.max(verticalLaneX, hitObs.rawX + hitObs.rawW + tightMarginX + (laneIndex * 8));

      const rCorner = 4;
      const dirX_approach = bypassX >= sourceX ? 1 : -1;
      const dirY_step = detourY >= sourceY ? 1 : -1;

      const path = [
        `M ${sourceX} ${sourceY}`,
        `L ${bypassX - dirX_approach * rCorner} ${sourceY}`,
        `Q ${bypassX} ${sourceY} ${bypassX} ${sourceY + dirY_step * rCorner}`,
        `L ${bypassX} ${detourY - dirY_step * rCorner}`,
        `Q ${bypassX} ${detourY} ${bypassX + dirX_approach * rCorner} ${detourY}`,
        `L ${targetX - (sourceX < targetX ? 20 : -20)} ${detourY}`,
        `L ${targetX - (sourceX < targetX ? 20 : -20)} ${targetY}`,
        `L ${targetX} ${targetY}`
      ].join(' ');

      return { path, labelX: bypassX, labelY: detourY };
    }

    if (Math.abs(deltaY) < 1.5) {
      return {
        path: `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`,
        labelX: (sourceX + targetX) / 2,
        labelY: sourceY
      };
    }

    // Arches de croisement
    const otherVerticalXs = allEdges
      .filter((e) => e.id !== id && e.source !== source && e.target !== target)
      .map((e) => {
        const otherTargetNode = nodes.find((n) => n.id === e.target);
        const otherInputs = (otherTargetNode?.data?.inputs || []).filter(
          (p) => p && p.visible !== false && p.type !== 'RJ45' && p.type !== 'USB' && p.type !== 'USB-C' && !p.isBiDirectional
        );
        const oCleanHandle = (e.targetHandle || '').replace('_src', '').replace('_tgt', '');
        let oIdx = otherInputs.findIndex((p) => p.id === oCleanHandle);
        if (oIdx === -1) oIdx = 0;
        return e.targetX ? e.targetX - baseEntryClearance - (oIdx * laneSpacing) : null;
      })
      .filter((x) => x !== null);

    const r = Math.min(6, Math.abs(deltaY) / 2, Math.abs(verticalLaneX - sourceX) / 2);
    const dirY = deltaY >= 0 ? 1 : -1;
    const dirX1 = (verticalLaneX - sourceX) >= 0 ? 1 : -1;
    const dirX2 = (targetX - verticalLaneX) >= 0 ? 1 : -1;

    const seg1Path = buildHorizontalSegmentWithHops(sourceX, sourceY, verticalLaneX - dirX1 * r, otherVerticalXs);
    const seg2Path = buildHorizontalSegmentWithHops(verticalLaneX + dirX2 * r, targetY, targetX, otherVerticalXs);

    const path = [
      `M ${sourceX} ${sourceY}`,
      seg1Path,
      `Q ${verticalLaneX} ${sourceY} ${verticalLaneX} ${sourceY + dirY * r}`,
      `L ${verticalLaneX} ${targetY - dirY * r}`,
      `Q ${verticalLaneX} ${targetY} ${verticalLaneX + dirX2 * r} ${targetY}`,
      seg2Path
    ].join(' ');

    return {
      path,
      labelX: verticalLaneX,
      labelY: sourceY + deltaY / 2
    };
  };

  const { path: edgePath, labelX, labelY } = computePath();

  const sourceType = data.sourceType || 'Inconnu';
  const targetType = data.targetType || 'Inconnu';
  const isMismatch = data.isMismatch || (sourceType !== 'Inconnu' && targetType !== 'Inconnu' && sourceType !== targetType);

  const baseColor = SIGNAL_COLORS[sourceType] || (sourceType === 'USB-C' ? '#f97316' : '#38bdf8');
  const cableColor = isMismatch ? '#ef4444' : baseColor;

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke="#121214"
        strokeWidth={selected ? 5.5 : 4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        fill="none"
        stroke={selected ? '#38bdf8' : cableColor}
        strokeWidth={selected ? 3.2 : 2.2}
        strokeDasharray={isMismatch ? '5,3' : 'none'}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          ...style,
          fill: 'none',
          stroke: selected ? '#38bdf8' : cableColor,
          filter: selected ? 'drop-shadow(0 0 3px rgba(56, 189, 248, 0.5))' : 'none'
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 20,
          }}
        >
          {isMismatch ? (
            <div
              title={`Signal incompatible : ${sourceType} ➔ ${targetType}`}
              style={{
                background: '#450a0a',
                border: '1px solid #ef4444',
                borderRadius: '4px',
                padding: '2px 5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={11} color="#f87171" />
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#fca5a5' }}>
                {sourceType} ➔ {targetType}
              </span>
              {selected && data.onDeleteEdge && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onDeleteEdge(id);
                  }}
                  title="Supprimer câble"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ) : (data.label || (data.length && data.length !== 'Non spécifié')) ? (
            <div style={{
              background: '#18191e',
              border: `1px solid ${cableColor}80`,
              borderRadius: '3px',
              padding: '2px 5px',
              fontSize: '9px',
              fontWeight: 600,
              color: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
            }}>
              <span>{data.label || sourceType}</span>
              {data.length && data.length !== 'Non spécifié' && (
                <span style={{ color: '#9ca3af' }}>({data.length})</span>
              )}

              {selected && data.onDeleteEdge && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onDeleteEdge(id);
                  }}
                  title="Supprimer câble"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}