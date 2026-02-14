import { useState, useEffect, useCallback } from 'react';

const ImageSlider = ({ slides, autoPlayInterval = 2000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev === slides.length - 1) {
        return prev + 1; // Go to clone of first slide
      }
      return prev + 1;
    });
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev === 0) {
        // When on first slide, go to clone of last slide for seamless backward loop
        return -1;
      }
      return prev - 1;
    });
  }, [slides.length]);

  // Handle forward loop transition
  useEffect(() => {
    if (currentSlide === slides.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
        setTimeout(() => setIsTransitioning(true), 50);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, slides.length]);

  // Handle backward loop transition
  useEffect(() => {
    if (currentSlide === -1) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(slides.length - 1);
        setTimeout(() => setIsTransitioning(true), 50);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, slides.length]);

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [nextSlide, autoPlayInterval]);

  // Create extended slides array for seamless looping in both directions
  const extendedSlides = [slides[slides.length - 1], ...slides, slides[0]];

  // Calculate the actual display index for navigation dots
  const displayIndex = currentSlide === -1 ? slides.length - 1 : 
                      currentSlide === slides.length ? 0 : 
                      currentSlide;

  return (
    <div className="relative w-full h-[500px] overflow-hidden group">
      {/* Slides container */}
      <div 
        className={`flex h-full ${
          isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''
        }`}
        style={{ transform: `translateX(-${(currentSlide + 1) * 100}%)` }}
      >
        {extendedSlides.map((slide, index) => (
          <div 
            key={index}
            className="w-full h-full flex-shrink-0 relative"
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Content */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="text-center text-white max-w-2xl px-4">
                <h2 className="text-4xl md:text-6xl font-bold mb-4">
                  {slide.title}
                </h2>
                <p className="text-xl md:text-2xl mb-8">
                  {slide.description}
                </p>
                <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-300">
                  {slide.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Previous Button */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === displayIndex 
                ? 'bg-white scale-125' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentSlide(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
        {displayIndex + 1} / {slides.length}
      </div>
    </div>
  );
};

// Sample usage with demo data
const App = () => {
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Summer Collection",
      description: "Discover the latest trends for this season",
      buttonText: "Shop Now",
      alt: "Headphones on a table"
    },
    {
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1999&q=80",
      title: "New Arrivals",
      description: "Fresh styles just landed in store",
      buttonText: "Explore",
      alt: "Smart watch"
    },
    {
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Limited Edition",
      description: "Exclusive items for fashion enthusiasts",
      buttonText: "View Collection",
      alt: "Running shoes"
    },
    {
      image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
      title: "Accessories",
      description: "Complete your look with our accessories",
      buttonText: "Discover More",
      alt: "Fashion accessories"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <ImageSlider slides={slides} autoPlayInterval={2000} />
    </div>
  );
};

export default App;