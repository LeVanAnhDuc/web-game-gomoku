'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameStatus, Move, Point } from '@/game/core/types';
import {
  CELL_DEFAULT_DESKTOP,
  CELL_DEFAULT_MOBILE,
  clampCell,
  fitToMoves,
  panBy,
  screenToCell,
  zoomAt,
  type Camera,
} from '@/game/render/camera';
import { readPalette, type Palette } from '@/game/render/palette';
import { drawFrame } from '@/game/render/renderer';
import { advanceGesture, beginGesture, isDrag, type Gesture } from './pointerGesture';

const MOBILE_MAX_WIDTH = 640;
const WHEEL_STEP_PX = 2;

export type BoardCanvas = {
  readonly canvasRef: React.RefObject<HTMLCanvasElement | null>;
  readonly cam: Camera;
  readonly preview: Point | null;
  onPointerDown(e: React.PointerEvent<HTMLCanvasElement>): void;
  onPointerMove(e: React.PointerEvent<HTMLCanvasElement>): void;
  onPointerUp(e: React.PointerEvent<HTMLCanvasElement>): void;
  onWheel(e: React.WheelEvent<HTMLCanvasElement>): void;
  recenter(): void;
  confirmPreview(): void;
  clearPreview(): void;
};

export function useBoardCanvas(args: {
  moves: readonly Move[];
  status: GameStatus;
  onPlace(at: Point): void;
}): BoardCanvas {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const centred = useRef(false);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [cam, setCam] = useState<Camera>({ cell: CELL_DEFAULT_DESKTOP, ox: 0, oy: 0 });
  const [preview, setPreview] = useState<Point | null>(null);

  const localPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  };

  // Khớp canvas với kích thước thật và devicePixelRatio. Lần đầu thì đưa ô (0,0)
  // vào giữa; các lần sau KHÔNG giật khung nhìn của người chơi.
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (canvas == null || parent == null) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      if (!centred.current) {
        centred.current = true;
        const cell = w <= MOBILE_MAX_WIDTH ? CELL_DEFAULT_MOBILE : CELL_DEFAULT_DESKTOP;
        setCam({ cell, ox: w / 2 - cell / 2, oy: h / 2 - cell / 2 });
      } else {
        setCam((current) => ({ ...current }));
      }
    };

    setPalette(readPalette(canvas));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // Đổi chế độ sáng/tối thì đọc lại palette. Nhờ vậy chế độ tối là việc của
  // `globals.css` và canvas tự đi theo, không phải sửa code (MASTER.md §1–2).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const reread = () => setPalette(readPalette(canvas));
    query.addEventListener('change', reread);
    return () => query.removeEventListener('change', reread);
  }, []);

  // Một khung một lần, khi có gì đổi. Không có vòng rAF chạy không tải: bàn chỉ đổi
  // khi có thao tác, nên giữa hai thao tác không có gì để vẽ lại.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null || palette == null) return;
    const ctx = canvas.getContext('2d');
    if (ctx == null) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(ctx, {
      cam,
      moves: args.moves,
      status: args.status,
      preview,
      previewSide: 'human',
      w: canvas.width / dpr,
      h: canvas.height / dpr,
      palette,
    });
  }, [cam, args.moves, args.status, preview, palette]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = localPoint(e);
    gesture.current = beginGesture(p.x, p.y);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const current = gesture.current;
    if (current === null) return;
    const p = localPoint(e);
    const dx = p.x - current.lastX;
    const dy = p.y - current.lastY;
    gesture.current = advanceGesture(current, p.x, p.y);
    setCam((cameraNow) => panBy(cameraNow, dx, dy));
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const current = gesture.current;
      gesture.current = null;
      if (current === null || isDrag(current)) return;
      if (args.status.kind !== 'playing') return;

      const p = localPoint(e);
      const at = screenToCell(cam, p.x, p.y);

      // ADR-0007: quyết theo con trỏ CỦA SỰ KIỆN, không theo khả năng thiết bị —
      // laptop màn cảm ứng là cả hai.
      if (e.pointerType === 'mouse') {
        setPreview(null);
        args.onPlace(at);
        return;
      }

      if (preview !== null && preview.x === at.x && preview.y === at.y) {
        setPreview(null);
        args.onPlace(at);
        return;
      }
      setPreview(at);
    },
    [args, cam, preview],
  );

  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - box.left;
    const sy = e.clientY - box.top;
    const delta = e.deltaY < 0 ? WHEEL_STEP_PX : -WHEEL_STEP_PX;
    setCam((current) => zoomAt(current, sx, sy, clampCell(current.cell + delta)));
  }, []);

  const recenter = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas == null) return;
    const dpr = window.devicePixelRatio || 1;
    setCam(fitToMoves(args.moves, canvas.width / dpr, canvas.height / dpr));
    setPreview(null);
  }, [args.moves]);

  const confirmPreview = useCallback(() => {
    if (preview === null) return;
    const at = preview;
    setPreview(null);
    args.onPlace(at);
  }, [args, preview]);

  const clearPreview = useCallback(() => setPreview(null), []);

  return {
    canvasRef,
    cam,
    preview,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
    recenter,
    confirmPreview,
    clearPreview,
  };
}
