'use client';
import { useState, useEffect, useCallback } from 'react';
// import Image from "next/image";

export default function Home() {
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFrogs, setActiveFrogs] = useState<number[]>([]); // Changed from single activeFrog
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [missedFrogs, setMissedFrogs] = useState(0);
  const holes = Array(9).fill(null);

  // Calculate number of frogs based on level
  const getNumberOfFrogs = useCallback(() => {
    // Add 1 frog every 5 levels, max 4 frogs
    return Math.min(1 + Math.floor((level - 1) / 5), 4);
  }, [level]);

  // Calculate frog spawn speed based on level
  const getFrogSpeed = useCallback(() => {
    // Level 1: 1000ms
    // Speed increases by 5% per level (50ms per level)
    // Minimum speed: 100ms
    return Math.max(1000 - (level - 1) * 50, 100);
  }, [level]);

  const startGame = () => {
    setScore(0);
    setIsPlaying(true);
    setLevel(1);
    setIsGameOver(false);
    setMissedFrogs(0);
    setActiveFrogs([]);
  };

  const whackFrog = useCallback((index: number) => {
    if (activeFrogs.includes(index) && isPlaying) {
      setScore(prev => prev + 1);
      setActiveFrogs(prev => prev.filter(frogIndex => frogIndex !== index));
      // Level up every 10 points
      if ((score + 1) % 10 === 0 && level < 1000) {  // Changed from 100 to 1000
        setLevel(prev => prev + 1);
      }
    }
  }, [activeFrogs, isPlaying, score, level]);

  useEffect(() => {
    let frogInterval: NodeJS.Timeout;

    if (isPlaying && !isGameOver) {
      frogInterval = setInterval(() => {
        setActiveFrogs(prevFrogs => {
          // Count missed frogs
          if (prevFrogs.length > 0) {
            setMissedFrogs(prev => {
              const newMissed = prev + prevFrogs.length;
              if (newMissed >= 3) {
                setIsGameOver(true);
              }
              return newMissed;
            });
          }

          // Generate new frog positions
          const numFrogs = getNumberOfFrogs();
          const newFrogs: number[] = [];
          const availableHoles = Array.from({length: 9}, (_, i) => i);

          for (let i = 0; i < numFrogs; i++) {
            if (availableHoles.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableHoles.length);
            newFrogs.push(availableHoles[randomIndex]);
            availableHoles.splice(randomIndex, 1);
          }

          return newFrogs;
        });
      }, getFrogSpeed());
    } else if (isGameOver) {
      setIsPlaying(false);
      setHighScore(prev => Math.max(prev, score));
    }

    return () => {
      clearInterval(frogInterval);
    };
  }, [isPlaying, isGameOver, getFrogSpeed, score, getNumberOfFrogs]);

  // Convert speed to a percentage for display
  const getSpeedPercentage = () => {
    // Level 1: 0%, Level 19+: 100%
    return Math.min(((level - 1) * 5), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 text-green-800 dark:text-green-100">🐸 Whack-a-Frog! 🐸</h1>
          <p className="text-lg text-green-700 dark:text-green-200">Whack the frogs as fast as you can! Don't let 3 frogs escape!</p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
            <div className="flex justify-between mb-6">
              <div className="stats space-y-2">
                <p className="text-2xl font-semibold text-green-700 dark:text-green-300">
                  Score: {score}
                </p>
                {/* <p className="text-xl text-green-600 dark:text-green-400">
                  High Score This Session: {highScore}
                </p> */}
                <p className="text-xl text-purple-600 dark:text-purple-400">
                  Level: {level}
                </p>
                <p className="text-xl text-yellow-600 dark:text-yellow-400">
                  Active Frogs: {getNumberOfFrogs()}
                </p>
                <p className="text-xl text-red-600 dark:text-red-400">
                  Missed Frogs: {missedFrogs}/3
                </p>
              </div>
              {(!isPlaying || isGameOver) && (
                <button
                  onClick={startGame}
                  className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold px-8 py-4 rounded-full transform transition hover:scale-105 active:scale-95 shadow-lg"
                >
                  {isGameOver ? '🔄 Play Again' : '▶️ Start Game'}
                </button>
              )}
            </div>

            {isGameOver && (
              <div className="text-center mb-6 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Game Over!</h2>
                <p className="text-red-500 dark:text-red-300">Too many frogs escaped!</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              {holes.map((_, index) => (
                <div
                  key={index}
                  onClick={() => whackFrog(index)}
                  className={`
                    aspect-square bg-green-700 dark:bg-green-600 rounded-full relative cursor-pointer
                    transform transition-all duration-100 
                    ${isPlaying && !isGameOver ? 'hover:bg-green-800 dark:hover:bg-green-700 active:scale-95' : ''}
                    shadow-inner
                  `}
                >
                  {activeFrogs.includes(index) && !isGameOver && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center animate-bounce"
                      style={{ 
                        animation: `bounce ${getFrogSpeed()}ms infinite`,
                        animationTimingFunction: 'ease-in-out'
                      }}
                    >
                      <div className="w-3/4 h-3/4 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-4xl transform hover:scale-110 transition-transform">🐸</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-green-700 dark:text-green-300">
              BuildOnBase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
