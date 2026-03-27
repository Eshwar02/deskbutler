import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for Intersection Observer API
 * Lazy load elements as they enter the viewport
 * @param {Object} options - Intersection Observer options
 * @returns {Array} [ref, isIntersecting] - Ref to attach and intersection state
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return [ref, isIntersecting];
}
