/**
 * Performance monitoring utilities
 */

const isDev = import.meta.env.MODE === 'development';
const SLOW_RENDER_THRESHOLD = 16; // ~60fps

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * Mark the start of a measurement
   */
  start(label) {
    if (!isDev) return;
    this.metrics.set(label, performance.now());
  }

  /**
   * Mark the end and log if slow
   */
  end(label) {
    if (!isDev) return;
    
    const startTime = this.metrics.get(label);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    this.metrics.delete(label);

    if (duration > SLOW_RENDER_THRESHOLD) {
      console.warn(`⚠️  Slow render detected: ${label} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measure a function execution
   */
  measure(label, fn) {
    if (!isDev) return fn();
    
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  /**
   * Log component render times
   */
  logRender(componentName, actualDuration) {
    if (!isDev) return;
    
    if (actualDuration > SLOW_RENDER_THRESHOLD) {
      console.warn(`⚠️  ${componentName} rendered in ${actualDuration.toFixed(2)}ms`);
    }
  }

  /**
   * Measure async operations
   */
  async measureAsync(label, asyncFn) {
    if (!isDev) return asyncFn();
    
    this.start(label);
    const result = await asyncFn();
    this.end(label);
    return result;
  }
}

export const perfMonitor = new PerformanceMonitor();

/**
 * React Profiler onRender callback
 */
export function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  if (!isDev) return;

  if (actualDuration > SLOW_RENDER_THRESHOLD) {
    console.log('Profiler:', {
      component: id,
      phase,
      actualDuration: `${actualDuration.toFixed(2)}ms`,
      baseDuration: `${baseDuration.toFixed(2)}ms`,
    });
  }
}

/**
 * HOC to wrap components with performance profiling
 */
export function withPerformanceMonitoring(Component, componentName) {
  if (!isDev) return Component;

  return function ProfiledComponent(props) {
    perfMonitor.start(componentName);
    const result = Component(props);
    perfMonitor.end(componentName);
    return result;
  };
}
