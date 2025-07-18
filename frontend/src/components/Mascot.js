import React, { useState, useEffect } from 'react';
import './Mascot.css';

const Mascot = ({ 
  status = 'idle', 
  position = 'bottom-right',
  onInteraction,
  showOnHover = false,
  targetElement = null 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  // Mascot states and animations
  const mascotStates = {
    idle: {
      image: '/images/mascot/mascot-placeholder.svg',
      animation: 'mascot-idle'
    },
    peeking: {
      image: '/images/mascot/mascot-placeholder.svg',
      animation: 'mascot-peek'
    },
    excited: {
      image: '/images/mascot/mascot-placeholder.svg',
      animation: 'mascot-bounce'
    },
    thinking: {
      image: '/images/mascot/mascot-placeholder.svg',
      animation: 'mascot-think'
    },
    pointing: {
      image: '/images/mascot/mascot-placeholder.svg',
      animation: 'mascot-point'
    }
  };

  // Position classes
  const positionClasses = {
    'top-left': 'mascot-top-left',
    'top-right': 'mascot-top-right',
    'bottom-left': 'mascot-bottom-left',
    'bottom-right': 'mascot-bottom-right',
    'center': 'mascot-center'
  };

  // Handle hover interactions
  useEffect(() => {
    if (showOnHover && targetElement) {
      const element = document.querySelector(targetElement);
      if (element) {
        const handleMouseEnter = () => {
          setIsVisible(true);
          setCurrentStatus('peeking');
        };
        
        const handleMouseLeave = () => {
          setIsVisible(false);
          setCurrentStatus('idle');
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
        };
      }
    }
  }, [showOnHover, targetElement]);

  // Handle status changes
  useEffect(() => {
    setCurrentStatus(status);
    if (status !== 'idle') {
      setIsVisible(true);
    }
  }, [status]);

  // Handle mascot click
  const handleMascotClick = () => {
    if (onInteraction) {
      onInteraction(currentStatus);
    }
    
    // Cycle through states for fun interaction
    const states = Object.keys(mascotStates);
    const currentIndex = states.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % states.length;
    setCurrentStatus(states[nextIndex]);
  };

  if (!isVisible && !showOnHover) {
    return null;
  }

  return (
    <div 
      className={`mascot-container ${positionClasses[position]} ${isVisible ? 'mascot-visible' : ''}`}
      onClick={handleMascotClick}
    >
      <div className={`mascot ${mascotStates[currentStatus]?.animation || 'mascot-idle'}`}>
        <img 
          src={mascotStates[currentStatus]?.image || mascotStates.idle.image} 
          alt="SavakV2 Mascot"
          className="mascot-image"
        />
      </div>
      
      {/* Speech bubble for interactions */}
      {currentStatus !== 'idle' && (
        <div className="mascot-speech-bubble">
          {getMascotMessage(currentStatus)}
        </div>
      )}
    </div>
  );
};

// Helper function to get mascot messages
const getMascotMessage = (status) => {
  const messages = {
    peeking: "👋 Hi there! Need help?",
    excited: "🎉 Great job!",
    thinking: "🤔 Let me think...",
    pointing: "👉 Check this out!"
  };
  
  return messages[status] || "Hello!";
};

export default Mascot; 