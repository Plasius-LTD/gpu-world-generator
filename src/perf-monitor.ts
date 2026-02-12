export interface PerfMonitorOptions {
  targetFps?: number;
  tolerance?: number;
  sampleSize?: number;
  minSampleFraction?: number;
  cooldownMs?: number;
  qualitySlew?: number;
  initialBudget?: number;
  auto?: boolean;
}

export interface PerfMonitorUpdate {
  budget: number;
  medianFps: number | null;
  miss: number | null;
  adjusted: boolean;
  stable: boolean;
}

export interface PerfMonitor {
  sampleFrame: (dtSeconds: number) => void;
  sampleFps: (fps: number) => void;
  update: (nowMs: number) => PerfMonitorUpdate;
  resetSamples: () => void;
  setBudget: (budget: number) => void;
  getBudget: () => number;
  setAuto: (enabled: boolean) => void;
  getConfig: () => Required<PerfMonitorOptions>;
}

const defaultOptions: Required<PerfMonitorOptions> = {
  targetFps: 120,
  tolerance: 6,
  sampleSize: 90,
  minSampleFraction: 0.6,
  cooldownMs: 1200,
  qualitySlew: 0.05,
  initialBudget: 0.5,
  auto: true,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) * 0.5;
  }
  return sorted[mid];
}

export function createPerfMonitor(options: PerfMonitorOptions = {}): PerfMonitor {
  const config: Required<PerfMonitorOptions> = { ...defaultOptions, ...options };
  let budget = clamp01(config.initialBudget);
  let lastAdjust = 0;
  const samples: number[] = [];

  const sampleFps = (fps: number) => {
    if (!Number.isFinite(fps) || fps <= 0) return;
    samples.push(fps);
    if (samples.length > config.sampleSize) {
      samples.shift();
    }
  };

  const sampleFrame = (dtSeconds: number) => {
    if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return;
    sampleFps(1 / dtSeconds);
  };

  const update = (nowMs: number): PerfMonitorUpdate => {
    if (!config.auto) {
      return { budget, medianFps: null, miss: null, adjusted: false, stable: true };
    }
    if (nowMs - lastAdjust < config.cooldownMs) {
      return { budget, medianFps: null, miss: null, adjusted: false, stable: false };
    }
    if (samples.length < Math.floor(config.sampleSize * config.minSampleFraction)) {
      return { budget, medianFps: null, miss: null, adjusted: false, stable: false };
    }

    const med = median(samples);
    const miss = config.targetFps - med;
    const tol = config.tolerance;
    if (Math.abs(miss) <= tol) {
      lastAdjust = nowMs;
      return { budget, medianFps: med, miss, adjusted: false, stable: true };
    }

    const magnitude = Math.min(1, (Math.abs(miss) - tol) / tol);
    const direction = miss > 0 ? -1 : 1;
    const next = clamp01(budget + direction * magnitude * config.qualitySlew);
    const adjusted = next !== budget;
    budget = next;
    lastAdjust = nowMs;
    return { budget, medianFps: med, miss, adjusted, stable: false };
  };

  const resetSamples = () => {
    samples.length = 0;
  };

  const setBudget = (next: number) => {
    budget = clamp01(next);
  };

  const getBudget = () => budget;

  const setAuto = (enabled: boolean) => {
    config.auto = enabled;
  };

  const getConfig = () => ({ ...config });

  return {
    sampleFrame,
    sampleFps,
    update,
    resetSamples,
    setBudget,
    getBudget,
    setAuto,
    getConfig,
  };
}
