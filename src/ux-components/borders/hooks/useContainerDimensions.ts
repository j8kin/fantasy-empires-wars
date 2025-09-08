import { useRef, useEffect, useState } from 'react';

export interface ContainerDimensions {
  width: number;
  height: number;
}

export const useContainerDimensions = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ContainerDimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const parentElement = containerRef.current.parentElement;
        if (parentElement) {
          setDimensions({
            width: parentElement.clientWidth,
            height: parentElement.clientHeight,
          });
        }
      }
    };

    updateDimensions();

    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { containerRef, dimensions };
};
