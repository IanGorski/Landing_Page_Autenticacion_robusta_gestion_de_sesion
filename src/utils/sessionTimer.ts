export interface SessionTimerOptions {
  getSession: () => { expiresAt: number } | null;
  now: () => number;
  warnThresholdMs?: number;
  intervalMs?: number;
  onTick: (remaining: number, warn: boolean) => void;
  onExpire: () => void;
}

export function startSessionTimer(opts: SessionTimerOptions): () => void {
  const warnThreshold = opts.warnThresholdMs ?? 30_000;
  const interval = opts.intervalMs ?? 1000;
  let handle: any = null;
  let stopped = false;

  function step() {
    if (stopped) return;
    const sess = opts.getSession();
    if (!sess) { opts.onTick(0, false); return; }
    const diff = sess.expiresAt - opts.now();
    if (diff <= 0) {
      opts.onTick(0, false);
      opts.onExpire();
      stop();
      return;
    }
    opts.onTick(diff, diff <= warnThreshold);
  }

  function loop() {
    step();
    if (!stopped) handle = setTimeout(loop, interval);
  }

  function stop() {
    stopped = true;
    if (handle) clearTimeout(handle);
  }

  loop();
  return stop;
}
