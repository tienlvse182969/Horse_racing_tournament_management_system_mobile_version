import { useSyncExternalStore } from 'react';

export interface ResourceSnapshot<TData> {
  data: TData;
  loading: boolean;
  error: string | null;
}

export interface PolledResource<TData> {
  getSnapshot: () => ResourceSnapshot<TData>;
  subscribe: (onChange: () => void) => () => void;
  reload: (showLoading?: boolean) => Promise<void>;
  mutate: (updater: TData | ((prev: TData) => TData)) => void;
}

/**
 * A module-level singleton resource shared by every component/hook instance that
 * reads it, so N screens mounted at once (e.g. kept-alive tab screens) share one
 * fetch + one poll timer instead of each running its own.
 */
export function createPolledResource<TData>(
  initialData: TData,
  fetcher: () => Promise<TData>,
  intervalMs?: number,
): PolledResource<TData> {
  let snapshot: ResourceSnapshot<TData> = { data: initialData, loading: true, error: null };
  const listeners = new Set<() => void>();
  let subscriberCount = 0;
  let intervalHandle: ReturnType<typeof setInterval> | null = null;

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function patch(next: Partial<ResourceSnapshot<TData>>) {
    snapshot = { ...snapshot, ...next };
    emit();
  }

  async function reload(showLoading = false): Promise<void> {
    if (showLoading) patch({ loading: true });
    try {
      const data = await fetcher();
      patch({ data, error: null, loading: false });
    } catch (e) {
      patch({ error: e instanceof Error ? e.message : 'Error', loading: false });
    }
  }

  function mutate(updater: TData | ((prev: TData) => TData)) {
    const next = typeof updater === 'function'
      ? (updater as (prev: TData) => TData)(snapshot.data)
      : updater;
    patch({ data: next });
  }

  function subscribe(onChange: () => void) {
    listeners.add(onChange);
    subscriberCount += 1;
    if (subscriberCount === 1) {
      reload(snapshot.loading);
      if (intervalMs) intervalHandle = setInterval(() => reload(false), intervalMs);
    }
    return () => {
      listeners.delete(onChange);
      subscriberCount -= 1;
      if (subscriberCount === 0 && intervalHandle) {
        clearInterval(intervalHandle);
        intervalHandle = null;
      }
    };
  }

  return { getSnapshot: () => snapshot, subscribe, reload, mutate };
}

export function usePolledResource<TData>(resource: PolledResource<TData>) {
  const snapshot = useSyncExternalStore(resource.subscribe, resource.getSnapshot, resource.getSnapshot);
  return {
    data: snapshot.data,
    loading: snapshot.loading,
    error: snapshot.error,
    reload: resource.reload,
    mutate: resource.mutate,
  };
}
