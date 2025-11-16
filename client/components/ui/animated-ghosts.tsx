// Ghost image animation component for admin panel
import { useEffect, useRef, useState } from "react";

const ghostImages = [
  "/admin/ghost1.png",
  "/admin/ghost2.png",
  "/admin/ghost3.png"
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function AnimatedGhosts() {
  const [ghosts, setGhosts] = useState<Array<{id:number, top:number, img:string, speed:number}>>([]);
  const ghostId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly decide to spawn a ghost (30% chance every 2s)
      if (Math.random() < 0.3) {
        setGhosts((prev) => [
          ...prev,
          {
            id: ghostId.current++,
            top: getRandomInt(10, 70),
            img: ghostImages[getRandomInt(0, ghostImages.length - 1)],
            speed: getRandomInt(5, 9) // seconds
          }
        ]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Remove ghosts after animation
  useEffect(() => {
    if (!ghosts.length) return;
    const timeout = setTimeout(() => {
      setGhosts((prev) => prev.slice(1));
    }, ghosts[0].speed * 1000 + 500);
    return () => clearTimeout(timeout);
  }, [ghosts]);

  return (
    <>
      {ghosts.map((ghost) => (
        <img
          key={ghost.id}
          src={ghost.img}
          alt="ghost"
          className="pointer-events-none select-none ghost-float"
          style={{
            position: "fixed",
            left: 0,
            top: `${ghost.top}%`,
            height: "80px",
            zIndex: 30,
            animation: `ghost-move ${ghost.speed}s linear forwards`
          }}
        />
      ))}
    </>
  );
}
