import React, { useEffect, useRef, useState } from 'react';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  onAnimationComplete?: () => void;
}

/**
 * React Bits - BlurText
 * Animación de aparición palabra por palabra desde desenfoque cinematográfico.
 */
export const BlurText: React.FC<BlurTextProps> = ({
  text = '',
  delay = 120,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  onAnimationComplete,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {elements.map((segment, index) => {
        return (
          <span
            key={index}
            className="inline-block transition-all duration-700 ease-out"
            style={{
              transitionDelay: `${index * delay}ms`,
              filter: inView ? 'blur(0px)' : 'blur(10px)',
              opacity: inView ? 1 : 0,
              transform: inView
                ? 'translate3d(0, 0, 0)'
                : direction === 'top'
                ? 'translate3d(0, -18px, 0)'
                : 'translate3d(0, 18px, 0)',
            }}
            onTransitionEnd={() => {
              if (index === elements.length - 1 && onAnimationComplete) {
                onAnimationComplete();
              }
            }}
          >
            {segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </span>
        );
      })}
    </span>
  );
};
