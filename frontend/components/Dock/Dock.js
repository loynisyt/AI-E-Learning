import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Dock.css';

const Dock = ({
  items = [],
  className,
  position = 'bottom',
  magnification = 1.2,
  baseSize = 50,
  magnificationSize = 60,
  animationDuration = 0.3,
  onItemClick
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const dockRef = useRef(null);
  const router = useRouter();

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleItemClick = (item, index) => {
    if (onItemClick) {
      onItemClick(item, index);
    } else {
      // Default navigation behavior
      router.push(item.path);
    }
  };

  const getItemSize = (index) => {
    if (hoveredIndex === null) return baseSize;

    const distance = Math.abs(index - hoveredIndex);
    const maxDistance = 2; // How many items away to affect

    if (distance === 0) return magnificationSize;
    if (distance <= maxDistance) {
      const factor = 1 + (maxDistance - distance) / maxDistance * (magnification - 1);
      return baseSize * factor;
    }

    return baseSize;
  };

  const getItemTransform = (index) => {
    if (hoveredIndex === null) return 'translateY(0)';

    const distance = Math.abs(index - hoveredIndex);
    const maxDistance = 2;

    if (distance <= maxDistance) {
      const liftAmount = (maxDistance - distance) / maxDistance * 10;
      return `translateY(-${liftAmount}px)`;
    }

    return 'translateY(0)';
  };

  return (
    <div
      className={`dock ${className || ''} dock-${position}`}
      ref={dockRef}
      onMouseLeave={handleMouseLeave}
    >
      <div className="dock-inner">
        {items.map((item, index) => (
          <div
            key={index}
            className="dock-item"
            onMouseEnter={() => handleMouseEnter(index)}
            onClick={() => handleItemClick(item, index)}
            role="button"
            tabIndex={0}
            aria-label={`Navigate to ${item.label}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleItemClick(item, index);
              }
            }}
            style={{
              width: getItemSize(index),
              height: getItemSize(index),
              transform: getItemTransform(index),
              transition: `all ${animationDuration}s ease`
            }}
          >
            <div className="dock-item-icon">
              {item.icon}
            </div>
            {item.label && (
              <div className="dock-item-label">
                {item.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dock;
