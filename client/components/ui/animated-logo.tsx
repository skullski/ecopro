import { useState, useEffect } from "react";

type Emotion = "happy" | "sad" | "mad" | "excited" | "neutral";

interface AnimatedLogoProps {
  emotion?: Emotion;
  autoAnimate?: boolean;
  size?: number;
}

export function AnimatedLogo({ emotion = "happy", autoAnimate = true, size = 32 }: AnimatedLogoProps) {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(emotion);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (autoAnimate) {
      // Blink animation every 3-5 seconds
      const blinkInterval = setInterval(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      }, Math.random() * 2000 + 3000);

      return () => clearInterval(blinkInterval);
    }
  }, [autoAnimate]);

  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  // Face styles based on emotion
  const getFaceStyles = () => {
    const eyeY = isBlinking ? 16 : 14;
    
    switch (currentEmotion) {
      case "happy":
        return {
          leftEye: { cx: 10, cy: eyeY, r: isBlinking ? 1 : 2.5 },
          rightEye: { cx: 22, cy: eyeY, r: isBlinking ? 1 : 2.5 },
          mouth: "M 8 20 Q 16 26 24 20",
          eyebrows: {
            left: "M 7 10 Q 10 9 13 10",
            right: "M 19 10 Q 22 9 25 10"
          },
          color: "text-primary"
        };
      
      case "excited":
        return {
          leftEye: { cx: 10, cy: eyeY - 1, r: isBlinking ? 1 : 3 },
          rightEye: { cx: 22, cy: eyeY - 1, r: isBlinking ? 1 : 3 },
          mouth: "M 6 19 Q 16 28 26 19",
          eyebrows: {
            left: "M 7 8 Q 10 6 13 8",
            right: "M 19 8 Q 22 6 25 8"
          },
          color: "text-accent"
        };
      
      case "sad":
        return {
          leftEye: { cx: 10, cy: eyeY + 1, r: isBlinking ? 1 : 2 },
          rightEye: { cx: 22, cy: eyeY + 1, r: isBlinking ? 1 : 2 },
          mouth: "M 8 24 Q 16 21 24 24",
          eyebrows: {
            left: "M 7 12 Q 10 10 13 11",
            right: "M 19 11 Q 22 10 25 12"
          },
          color: "text-blue-500"
        };
      
      case "mad":
        return {
          leftEye: { cx: 10, cy: eyeY, r: isBlinking ? 1 : 2 },
          rightEye: { cx: 22, cy: eyeY, r: isBlinking ? 1 : 2 },
          mouth: "M 8 22 L 24 22",
          eyebrows: {
            left: "M 7 11 L 13 9",
            right: "M 25 11 L 19 9"
          },
          color: "text-red-500"
        };
      
      default: // neutral
        return {
          leftEye: { cx: 10, cy: eyeY, r: isBlinking ? 1 : 2.5 },
          rightEye: { cx: 22, cy: eyeY, r: isBlinking ? 1 : 2.5 },
          mouth: "M 10 22 L 22 22",
          eyebrows: {
            left: "M 7 11 Q 10 10 13 11",
            right: "M 19 11 Q 22 10 25 11"
          },
          color: "text-foreground"
        };
    }
  };

  const face = getFaceStyles();

  return (
    <div className="inline-flex items-center justify-center transition-transform hover:scale-110">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        className={`transition-all duration-300 ${face.color}`}
        fill="currentColor"
      >
        {/* Background circle */}
        <circle cx="16" cy="16" r="15" className="fill-current opacity-20" />
        
        {/* Letter W */}
        <path
          d="M 6 8 L 8 18 L 12 10 L 16 18 L 20 10 L 24 18 L 26 8"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-30"
        />
        
        {/* Left eyebrow */}
        <path
          d={face.eyebrows.left}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-200"
        />
        
        {/* Right eyebrow */}
        <path
          d={face.eyebrows.right}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-200"
        />
        
        {/* Left eye */}
        <circle
          cx={face.leftEye.cx}
          cy={face.leftEye.cy}
          r={face.leftEye.r}
          className="transition-all duration-100"
        />
        
        {/* Right eye */}
        <circle
          cx={face.rightEye.cx}
          cy={face.rightEye.cy}
          r={face.rightEye.r}
          className="transition-all duration-100"
        />
        
        {/* Mouth */}
        <path
          d={face.mouth}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
}
