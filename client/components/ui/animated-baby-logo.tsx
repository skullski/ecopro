import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedBabyLogoProps {
  className?: string;
}

export function AnimatedBabyLogo({ className }: AnimatedBabyLogoProps) {
  const [position, setPosition] = useState(0);
  const [action, setAction] = useState<"walking" | "standing" | "waving" | "thinking">("walking");
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [legStep, setLegStep] = useState<"left" | "right">("left");

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        if (direction === "right") {
          if (prev >= 85) {
            setDirection("left");
            setAction(getRandomAction());
            return 85;
          }
          return prev + 0.25;
        } else {
          if (prev <= 0) {
            setDirection("right");
            setAction(getRandomAction());
            return 0;
          }
          return prev - 0.25;
        }
      });

      if (action === "walking") {
        setLegStep((prev) => (prev === "left" ? "right" : "left"));
      }
    }, 120);

    const actionInterval = setInterval(() => {
      setAction(getRandomAction());
    }, Math.random() * 3000 + 5000);

    return () => {
      clearInterval(interval);
      clearInterval(actionInterval);
    };
  }, [direction, action]);

  const getRandomAction = (): "walking" | "standing" | "waving" | "thinking" => {
    const actions: ("walking" | "standing" | "waving" | "thinking")[] = ["walking", "standing", "waving", "thinking"];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  return (
    <div className={cn("relative w-full h-14 overflow-hidden", className)}>
      <div
        className="absolute bottom-0 transition-all duration-120 ease-linear scale-50 origin-bottom-left"
        style={{
          left: `${position}%`,
          transform: `scaleX(${direction === "left" ? -0.5 : 0.5}) scaleY(0.5)`,
        }}
      >
        {/* Baby Boss Character */}
        <div className="relative flex flex-col items-center">
          
          {/* Head */}
          <div className="relative mb-1">
            {/* Hair */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-0.5">
                <div className="w-2 h-3 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-full"></div>
                <div className="w-2 h-3 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-full"></div>
                <div className="w-2 h-3 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-full"></div>
              </div>
            </div>

            {/* Face */}
            <div className="w-12 h-12 bg-gradient-to-b from-orange-200 to-orange-300 rounded-full border-2 border-orange-400 shadow-lg relative">
              {/* Eyes */}
              <div className="absolute top-4 left-2 flex gap-3">
                <div className="relative">
                  <div className="w-2.5 h-3 bg-white rounded-full border border-gray-300"></div>
                  <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-white rounded-full"></div>
                </div>
                <div className="relative">
                  <div className="w-2.5 h-3 bg-white rounded-full border border-gray-300"></div>
                  <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Eyebrows */}
              {action === "thinking" && (
                <>
                  <div className="absolute top-3 left-2 w-2.5 h-0.5 bg-amber-800 rounded transform -rotate-12"></div>
                  <div className="absolute top-3 right-2 w-2.5 h-0.5 bg-amber-800 rounded transform rotate-12"></div>
                </>
              )}

              {/* Nose */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full"></div>

              {/* Mouth */}
              <div className={cn(
                "absolute top-8 left-1/2 transform -translate-x-1/2",
                action === "waving" && "animate-pulse"
              )}>
                <div className="w-4 h-1.5 border-b-2 border-gray-700 rounded-b-full"></div>
              </div>

              {/* Ears */}
              <div className="absolute top-5 -left-1 w-2 h-3 bg-gradient-to-r from-orange-300 to-orange-200 rounded-l-full border-l border-orange-400"></div>
              <div className="absolute top-5 -right-1 w-2 h-3 bg-gradient-to-l from-orange-300 to-orange-200 rounded-r-full border-r border-orange-400"></div>
            </div>
          </div>

          {/* Body - Business Suit */}
          <div className="relative">
            {/* Suit Jacket */}
            <div className="w-14 h-16 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 shadow-xl relative overflow-hidden">
              {/* White Shirt */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-12 bg-white rounded">
                {/* Tie */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-10 bg-gradient-to-b from-red-600 to-red-700 clip-path-polygon"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                  <div className="w-3 h-2 bg-red-600 transform rotate-45 origin-bottom-left -ml-1.5"></div>
                  <div className="w-3 h-2 bg-red-600 transform -rotate-45 origin-bottom-right ml-0.5 -mt-2"></div>
                </div>
              </div>

              {/* Suit Lapels */}
              <div className="absolute top-1 left-0 w-4 h-6 bg-gradient-to-br from-gray-700 to-gray-900 transform -skew-y-3"></div>
              <div className="absolute top-1 right-0 w-4 h-6 bg-gradient-to-bl from-gray-700 to-gray-900 transform skew-y-3"></div>

              {/* Suit Buttons */}
              <div className="absolute bottom-3 left-1 w-1.5 h-1.5 bg-gray-400 rounded-full border border-gray-500"></div>
              <div className="absolute bottom-6 left-1 w-1.5 h-1.5 bg-gray-400 rounded-full border border-gray-500"></div>

              {/* Arms */}
              <div className={cn(
                "absolute -left-2 top-2 w-4 h-12 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg border border-gray-600 transform -rotate-12",
                action === "standing" && "rotate-0"
              )}>
                {/* Hand */}
                <div className="absolute bottom-0 -left-1 w-3 h-3 bg-gradient-to-b from-orange-200 to-orange-300 rounded-full border border-orange-400"></div>
              </div>

              <div className={cn(
                "absolute -right-2 top-2 w-4 h-12 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg border border-gray-600 transform rotate-12 transition-transform duration-300",
                action === "waving" && "animate-waving",
                action === "standing" && "rotate-0",
                action === "thinking" && "-rotate-45"
              )}>
                {/* Hand */}
                <div className="absolute bottom-0 -right-1 w-3 h-3 bg-gradient-to-b from-orange-200 to-orange-300 rounded-full border border-orange-400"></div>
              </div>
            </div>

            {/* Pants */}
            <div className="w-14 h-8 bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-700 border-t-0 relative">
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-600"></div>
            </div>

            {/* Legs */}
            <div className="flex gap-2 justify-center">
              {/* Left Leg */}
              <div className={cn(
                "w-4 h-10 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-lg border-x border-b border-gray-700 transition-transform duration-120",
                action === "walking" && legStep === "left" && "translate-y-1"
              )}>
                {/* Shoe */}
                <div className="absolute bottom-0 -left-1 w-6 h-3 bg-black rounded-full border border-gray-800 shadow-md"></div>
              </div>

              {/* Right Leg */}
              <div className={cn(
                "w-4 h-10 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-lg border-x border-b border-gray-700 transition-transform duration-120",
                action === "walking" && legStep === "right" && "translate-y-1"
              )}>
                {/* Shoe */}
                <div className="absolute bottom-0 -left-1 w-6 h-3 bg-black rounded-full border border-gray-800 shadow-md"></div>
              </div>
            </div>
          </div>

          {/* Briefcase when standing */}
          {action === "standing" && (
            <div className="absolute left-16 top-20">
              <div className="w-8 h-6 bg-gradient-to-b from-amber-700 to-amber-900 rounded border-2 border-amber-800 shadow-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-1 bg-yellow-600 rounded"></div>
              </div>
            </div>
          )}

          {/* Thought bubble when thinking */}
          {action === "thinking" && (
            <div className="absolute -top-8 -right-12">
              <div className="relative">
                <div className="w-12 h-8 bg-white rounded-full border-2 border-gray-300 shadow-lg flex items-center justify-center">
                  <span className="text-lg">💡</span>
                </div>
                <div className="absolute -bottom-2 left-2 w-3 h-3 bg-white rounded-full border-2 border-gray-300"></div>
                <div className="absolute -bottom-4 left-0 w-2 h-2 bg-white rounded-full border-2 border-gray-300"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add custom animation for waving */}
      <style>{`
        @keyframes waving {
          0%, 100% { transform: rotate(12deg); }
          50% { transform: rotate(-30deg); }
        }
        .animate-waving {
          animation: waving 0.5s ease-in-out infinite;
          transform-origin: top;
        }
      `}</style>
    </div>
  );
}
