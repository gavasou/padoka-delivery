
import React from 'react';

const SplashScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-brand-primary text-brand-secondary">
      <div className="animate-bounce-in">
        <img
          src="https://lh3.googleusercontent.com/d/1z5vqJor8LBw4ApIgpe1Xroo7RnQXmymb" // new compact logo
          alt="Padoka Logo"
          className="w-40 h-40 mx-auto animate-pulse-heart"
        />
      </div>
      <p 
        className="font-semibold text-center mt-6 text-lg fade-in" 
        style={{ animationDelay: '1s', opacity: 0, animationFillMode: 'forwards' }}
      >
        Bom dia! O pão fresquinho está a caminho 🍞💛
      </p>
    </div>
  );
};

export default SplashScreen;