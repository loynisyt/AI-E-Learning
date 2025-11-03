import React, { useState } from 'react';
import './MagicBento.css';

const MagicBento = ({
  items = [],
  className,
  onItemClick,
  gridCols = 3,
  gridRows = 2
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleItemClick = (item, index) => {
    onItemClick?.(item, index);
  };

  return (
    <div
      className={`magic-bento ${className || ''}`}
      style={{
        '--grid-cols': gridCols,
        '--grid-rows': gridRows
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={`magic-bento-item ${hoveredIndex === index ? 'hovered' : ''}`}
          style={{
            gridColumn: item.colSpan ? `span ${item.colSpan}` : 'span 1',
            gridRow: item.rowSpan ? `span ${item.rowSpan}` : 'span 1',
            background: item.background || '#f0f0f0'
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => handleItemClick(item, index)}
        >
          <div className="magic-bento-content">
            {item.icon && (
              <div className="magic-bento-icon">
                {item.icon}
              </div>
            )}
            <div className="magic-bento-text">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
          {item.glow && (
            <div className="magic-bento-glow"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MagicBento;
