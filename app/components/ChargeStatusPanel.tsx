"use client";

import { useEffect, useState, useCallback } from "react";
import LabeledDivider from "./editorial/LabeledDivider";
import Pill from "./editorial/Pill";

interface PoolState {
  id: string;
  label: string;
  group: string;
  current: number;
  max: number;
  rechargeIntervalHours: number;
  nextRechargeAt: number | null;
  fullAt: number | null;
}

interface Props {
  showTopOff?: boolean;
}

function formatCountdown(targetMs: number, now: number): string {
  const diff = Math.max(0, targetMs - now);
  const totalMin = Math.ceil(diff / 60_000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function ChargeCells({
  current,
  max,
}: {
  current: number;
  max: number;
}) {
  const critical = current <= 1 && current < max;
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < current;
        let bg: string;
        if (filled && critical) bg = "bg-hot";
        else if (filled) bg = "bg-ink";
        else bg = "bg-rule";
        return (
          <div
            key={i}
            className={`w-3 h-3 rounded-sm ${bg} transition-colors`}
          />
        );
      })}
    </div>
  );
}

function PoolRow({
  pool,
  now,
  showTopOff,
  onTopOff,
}: {
  pool: PoolState;
  now: number;
  showTopOff?: boolean;
  onTopOff?: (poolId: string) => void;
}) {
  const isFull = pool.current >= pool.max;
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-20 shrink-0">
        <span className="caption-mono text-ink-muted">{pool.label}</span>
      </div>

      <div className="flex-1 min-w-0">
        <ChargeCells current={pool.current} max={pool.max} />
      </div>

      <div className="w-24 shrink-0 text-right">
        {isFull ? (
          <span className="caption-mono text-ink-faint">full</span>
        ) : (
          <span className="caption-mono text-ink-faint">
            next {formatCountdown(pool.nextRechargeAt!, now)}
          </span>
        )}
      </div>

      {showTopOff && (
        <div className="shrink-0">
          <Pill
            onClick={() => onTopOff?.(pool.id)}
            icon="fa-bolt"
            size="xs"
          >
            top off
          </Pill>
        </div>
      )}
    </div>
  );
}

export default function ChargeStatusPanel({ showTopOff }: Props) {
  const [pools, setPools] = useState<PoolState[]>([]);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  const fetchPools = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      if (!res.ok) return;
      const data = await res.json();
      setPools(data.pools ?? []);
    } catch {
      // Silently handle — dashboard will show stale data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPools();
    const interval = setInterval(fetchPools, 30_000);
    return () => clearInterval(interval);
  }, [fetchPools]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, []);

  const handleTopOff = useCallback(
    async (poolId: string) => {
      try {
        const res = await fetch("/api/admin/usage/topoff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poolId }),
        });
        if (res.ok) {
          await fetchPools();
        }
      } catch {
        // Silently handle
      }
    },
    [fetchPools],
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <span className="caption-mono text-ink-faint">loading charges...</span>
      </div>
    );
  }

  const grouped = pools.reduce<Record<string, PoolState[]>>((acc, pool) => {
    (acc[pool.group] ??= []).push(pool);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([groupName, groupPools]) => (
        <div key={groupName}>
          <LabeledDivider variant="full">{groupName}</LabeledDivider>
          <div className="divide-y divide-rule">
            {groupPools.map((pool) => (
              <PoolRow
                key={pool.id}
                pool={pool}
                now={now}
                showTopOff={showTopOff}
                onTopOff={handleTopOff}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
