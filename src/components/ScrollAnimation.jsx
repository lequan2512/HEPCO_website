import { useEffect, useRef, useState } from 'react';

const ScrollAnimation = ({
  children,
  animation = 'fade-up', // 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in'
  duration = 700,
  delay = 0,
  className = ''
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const getAnimationClass = () => {
    if (!isVisible) {
      switch (animation) {
        case 'fade-up':
          return 'opacity-0 translate-y-12';
        case 'fade-down':
          return 'opacity-0 -translate-y-12';
        case 'fade-left':
          return 'opacity-0 translate-x-12';
        case 'fade-right':
          return 'opacity-0 -translate-x-12';
        case 'zoom-in':
          return 'opacity-0 scale-95';
        default:
          return 'opacity-0 translate-y-12';
      }
    }
    return 'opacity-100 translate-y-0 translate-x-0 scale-100';
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
      className={`transition-all ease-out transform will-change-transform ${getAnimationClass()} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation;
