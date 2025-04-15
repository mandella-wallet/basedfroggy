'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function WhackAFrog() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFrog, setActiveFrog] = useState(-1);
  const holes = Array(9).fill(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  const whackFrog = useCallback((index: number) => {
    if (index === activeFrog) {
      setScore(prev => prev + 1);
      setActiveFrog(-1);
    }
  }, [activeFrog]);

  useEffect(() => {
    let timeInterval: NodeJS.Timeout;
    let frogInterval: NodeJS.Timeout;

    if (isPlaying && timeLeft > 0) {
      timeInterval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      frogInterval = setInterval(() => {
        setActiveFrog(Math.floor(Math.random() * 9));
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }

    return () => {
      clearInterval(timeInterval);
      clearInterval(frogInterval);
    };
  }, [isPlaying, timeLeft]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-green-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Pukul Kodok!</h1>
        <p className="text-xl mb-2">Skor: {score}</p>
        <p className="text-xl mb-4">Waktu: {timeLeft}s</p>
        {!isPlaying && (
          <button
            onClick={startGame}
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
          >
            {timeLeft === 30 ? 'Mulai Game' : 'Main Lagi'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-md">
        {holes.map((_, index) => (
          <div
            key={index}
            onClick={() => isPlaying && whackFrog(index)}
            className={`
              h-24 w-24 bg-green-700 rounded-full relative cursor-pointer
              transition-all duration-100 
              ${isPlaying ? 'hover:bg-green-800' : ''}
            `}
          >
            {activeFrog === index && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🐸</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}