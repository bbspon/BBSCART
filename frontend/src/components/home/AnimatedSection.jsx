import React, { useRef, useState, useEffect } from 'react';

const AnimatedSection = ({ children, direction = 'up', delay = 0 }) => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [delay]);

  const getTransform = () => {
    if (direction === 'down') return isVisible ? 'translateY(0)' : 'translateY(-50px)';
    if (direction === 'left') return isVisible ? 'translateX(0)' : 'translateX(50px)';
    if (direction === 'right') return isVisible ? 'translateX(0)' : 'translateX(-50px)';
    return isVisible ? 'translateY(0)' : 'translateY(50px)';
  };

  return (
    <div
      ref={sectionRef}
      className="transition-all duration-1000 ease-out"
      style={{
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;