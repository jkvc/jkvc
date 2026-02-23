"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Segment,
  STATE_WIDTH,
  STATE_HEIGHT,
  VIEWPORT_WIDTH,
  createStateSegment,
  createTransitionSegment,
  getNextCycleState,
  STATES,
} from "./state-machine";

const SCALE = VIEWPORT_WIDTH / STATE_HEIGHT;
const SOURCE_VIEWPORT_WIDTH = VIEWPORT_WIDTH / SCALE;
const IDLE_SPEED = 50; // px/s
const FAST_SPEED = 300; // px/s
const SPEED_LERP = 0.05;
const APPEND_THRESHOLD = 400; // px before end of strip to trigger append

interface EngineState {
  segments: Segment[];
  scrollOffset: number;
  currentStateId: string;
  speed: number;
}

export interface CrankieEngine {
  segments: Segment[];
  scrollOffset: number;
  currentStateId: string;
  requestState: (stateId: string) => void;
}

export function useCrankieEngine(): CrankieEngine {
  const [viewState, setViewState] = useState<{
    segments: Segment[];
    scrollOffset: number;
    currentStateId: string;
  }>({
    segments: [],
    scrollOffset: 0,
    currentStateId: STATES[0].id,
  });

  const stateRef = useRef<EngineState>({
    segments: [],
    scrollOffset: 0,
    currentStateId: STATES[0].id,
    speed: IDLE_SPEED,
  });

  const targetSpeedRef = useRef(IDLE_SPEED);
  const pendingGroupRef = useRef<{ transitionId: number; stateId: number } | null>(null);
  const rushTargetSegmentIdRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const mountedRef = useRef(true);

  const getTotalWidth = useCallback(() => {
    return stateRef.current.segments.reduce((sum, s) => sum + s.width, 0);
  }, []);

  const appendGroup = useCallback(
    (nextStateId: string, isPending: boolean) => {
      const s = stateRef.current;
      const currentId = s.currentStateId;

      const trans = createTransitionSegment(currentId, nextStateId);
      const state = createStateSegment(nextStateId);

      s.segments.push(trans, state);
      s.currentStateId = nextStateId;

      if (isPending) {
        pendingGroupRef.current = {
          transitionId: trans.id,
          stateId: state.id,
        };
      } else {
        pendingGroupRef.current = null;
      }

      return state.id;
    },
    [],
  );

  const replacePendingGroup = useCallback(
    (nextStateId: string) => {
      const s = stateRef.current;
      const pending = pendingGroupRef.current;
      if (!pending) return null;

      const transIdx = s.segments.findIndex((seg) => seg.id === pending.transitionId);
      if (transIdx === -1) return null;

      // Revert currentStateId to the state before the pending group
      const prevStateSegment = s.segments[transIdx - 1];
      if (prevStateSegment?.type === "state" && prevStateSegment.stateId) {
        s.currentStateId = prevStateSegment.stateId;
      }

      s.segments.splice(transIdx);
      pendingGroupRef.current = null;

      return appendGroup(nextStateId, false);
    },
    [appendGroup],
  );

  const garbageCollect = useCallback(() => {
    const s = stateRef.current;
    let removed = 0;

    while (s.segments.length > 4) {
      const first = s.segments[0];
      if (first.width < s.scrollOffset - SOURCE_VIEWPORT_WIDTH) {
        s.segments.shift();
        s.scrollOffset -= first.width;
        removed += first.width;
      } else {
        break;
      }
    }

    return removed;
  }, []);

  const requestState = useCallback(
    (stateId: string) => {
      const s = stateRef.current;
      const pending = pendingGroupRef.current;

      let targetSegId: number | null = null;

      if (pending) {
        const pendingTransIdx = s.segments.findIndex(
          (seg) => seg.id === pending.transitionId,
        );
        if (pendingTransIdx !== -1) {
          const pendingTransLeft = s.segments
            .slice(0, pendingTransIdx)
            .reduce((sum, seg) => sum + seg.width, 0);

          if (pendingTransLeft > s.scrollOffset + SOURCE_VIEWPORT_WIDTH) {
            targetSegId = replacePendingGroup(stateId);
          } else {
            targetSegId = appendGroup(stateId, false);
          }
        } else {
          targetSegId = appendGroup(stateId, false);
        }
      } else {
        targetSegId = appendGroup(stateId, false);
      }

      if (targetSegId !== null) {
        rushTargetSegmentIdRef.current = targetSegId;
        targetSpeedRef.current = FAST_SPEED;
      }
    },
    [appendGroup, replacePendingGroup],
  );

  // Initialize with first state + one auto-appended cycle group
  useEffect(() => {
    const s = stateRef.current;
    if (s.segments.length === 0) {
      const firstState = createStateSegment(STATES[0].id);
      s.segments.push(firstState);
      s.currentStateId = STATES[0].id;
      appendGroup(getNextCycleState(STATES[0].id), true);
    }
  }, [appendGroup]);

  // rAF loop
  useEffect(() => {
    mountedRef.current = true;

    const tick = (time: number) => {
      if (!mountedRef.current) return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      const s = stateRef.current;

      // Speed interpolation
      s.speed += (targetSpeedRef.current - s.speed) * SPEED_LERP;

      // Scroll
      s.scrollOffset += s.speed * dt;

      const totalWidth = getTotalWidth();

      // Check if rush target is visible -> slow down
      if (rushTargetSegmentIdRef.current !== null) {
        const targetIdx = s.segments.findIndex(
          (seg) => seg.id === rushTargetSegmentIdRef.current,
        );
        if (targetIdx !== -1) {
          const targetLeft = s.segments
            .slice(0, targetIdx)
            .reduce((sum, seg) => sum + seg.width, 0);
          const targetSeg = s.segments[targetIdx];
          const targetCenter = targetLeft + targetSeg.width / 2;
          const viewportCenter = s.scrollOffset + SOURCE_VIEWPORT_WIDTH / 2;

          if (viewportCenter >= targetCenter - STATE_WIDTH * 0.3) {
            targetSpeedRef.current = IDLE_SPEED;
            rushTargetSegmentIdRef.current = null;
          }
        } else {
          rushTargetSegmentIdRef.current = null;
          targetSpeedRef.current = IDLE_SPEED;
        }
      }

      // Auto-append when running low
      if (s.scrollOffset + SOURCE_VIEWPORT_WIDTH > totalWidth - APPEND_THRESHOLD) {
        const next = getNextCycleState(s.currentStateId);
        appendGroup(next, true);
      }

      // GC
      garbageCollect();

      setViewState({
        segments: [...s.segments],
        scrollOffset: s.scrollOffset,
        currentStateId: s.currentStateId,
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [getTotalWidth, appendGroup, garbageCollect]);

  return {
    segments: viewState.segments,
    scrollOffset: viewState.scrollOffset,
    currentStateId: viewState.currentStateId,
    requestState,
  };
}
