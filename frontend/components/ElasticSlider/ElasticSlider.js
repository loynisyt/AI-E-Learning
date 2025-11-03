import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './ElasticSlider.css';

const ElasticSlider = ({
  items = [],
  className,
  onSlideChange,
  autoPlay = false,
  autoPlayInterval = 3000,
  showDots = true,
  showArrows = true,
  loop = true,
  transitionDuration = 0.8,
  ease = 'power2.out'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const sliderRef = useRef(null);
  const slidesRef = useRef([]);
  const dotsRef = useRef([]);
  const autoPlayRef = useRef(null);

  const totalSlides = items.length;

  useEffect(() => {
    if (autoPlay && totalSlides > 1) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
      return () => clearInterval(autoPlayRef.current);
    }
  }, [autoPlay, autoPlayInterval, totalSlides]);

  const animateSlide = (newIndex) => {
    if (isAnimating || newIndex === currentIndex) return;

    setIsAnimating(true);
    const direction = newIndex > currentIndex ? 1 : -1;

    gsap.to(slidesRef.current[currentIndex], {
      xPercent: -100 * direction,
      scale: 0.8,
      opacity: 0,
      duration: transitionDuration,
      ease,
      onComplete: () => {
        gsap.set(slidesRef.current[currentIndex], { xPercent: 0, scale: 1, opacity: 1 });
      }
    });

    gsap.fromTo(
      slidesRef.current[newIndex],
      { xPercent: 100 * direction, scale: 0.8, opacity: 0 },
      {
        xPercent: 0,
        scale: 1,
        opacity: 1,
        duration: transitionDuration,
        ease,
        onComplete: () => {
          setIsAnimating(false);
          setCurrentIndex(newIndex);
          onSlideChange?.(newIndex);
        }
      }
    );

    // Update dots
    dotsRef.current.forEach((dot, index) => {
      gsap.to(dot, {
        scale: index === newIndex ? 1.2 : 1,
        opacity: index === newIndex ? 1 : 0.5,
        duration: 0.3
      });
    });
  };

  const nextSlide = () => {
    const newIndex = loop ? (currentIndex + 1) % totalSlides : Math.min(currentIndex + 1, totalSlides - 1);
    animateSlide(newIndex);
  };

  const prevSlide = () => {
    const newIndex = loop ? (currentIndex - 1 + totalSlides) % totalSlides : Math.max(currentIndex - 1, 0);
    animateSlide(newIndex);
  };

  const goToSlide = (index) => {
    animateSlide(index);
  };

  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlay && totalSlides > 1) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
    }
  };

  return (
    <div
      className={`elastic-slider ${className || ''}`}
      ref={sliderRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="elastic-slider-container">
        {items.map((item, index) => (
          <div
            key={index}
            className="elastic-slide"
            ref={(el) => (slidesRef.current[index] = el)}
            style={{
              backgroundImage: `url(${item.image})`,
              opacity: index === currentIndex ? 1 : 0,
              zIndex: index === currentIndex ? 1 : 0
            }}
          >
            <div className="elastic-slide-content">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {showArrows && totalSlides > 1 && (
        <>
          <button className="elastic-arrow elastic-arrow-prev" onClick={prevSlide}>
            ‹
          </button>
          <button className="elastic-arrow elastic-arrow-next" onClick={nextSlide}>
            ›
          </button>
        </>
      )}

      {showDots && totalSlides > 1 && (
        <div className="elastic-dots">
          {items.map((_, index) => (
            <button
              key={index}
              className={`elastic-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              ref={(el) => (dotsRef.current[index] = el)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ElasticSlider;
