import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
}

/**
 * React Bits - ShinyText
 * Efecto de brillo metálico sutil que recorre el texto continuamente.
 */
export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 3.5,
  className = '',
  color = '#F7F5F8',
  shineColor = '#FF2E93',
}) => {
  return (
    <>
      <style>{`
        @keyframes reactBitsShine {
          0% {
            background-position: 150% 0;
          }
          100% {
            background-position: -150% 0;
          }
        }
        .animate-reactbits-shine {
          background-size: 200% 100%;
          animation: reactBitsShine linear infinite;
        }
      `}</style>
      <span
        className={`inline-block bg-clip-text text-transparent ${
          disabled ? '' : 'animate-reactbits-shine'
        } ${className}`}
        style={{
          backgroundImage: `linear-gradient(120deg, ${color} 40%, ${shineColor} 50%, ${color} 60%)`,
          animationDuration: `${speed}s`,
        }}
      >
        {text}
      </span>
    </>
  );
};

