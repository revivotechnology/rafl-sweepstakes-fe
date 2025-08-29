interface RaflLogoProps {
  className?: string;
}

export function RaflLogo({ className = "w-8 h-8" }: RaflLogoProps) {
  console.log("RaflLogo component rendering...");
  return (
    <div className={`${className} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Sunburst background */}
        <defs>
          <radialGradient id="sunburst" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(24 100% 50%)" />
            <stop offset="100%" stopColor="hsl(0 84% 55%)" />
          </radialGradient>
        </defs>
        
        {/* Sunburst rays */}
        <g className="fill-current">
          {Array.from({ length: 16 }, (_, i) => {
            const angle = (i * 22.5) * Math.PI / 180;
            const x1 = 50 + Math.cos(angle) * 25;
            const y1 = 50 + Math.sin(angle) * 25;
            const x2 = 50 + Math.cos(angle) * 45;
            const y2 = 50 + Math.sin(angle) * 45;
            const x3 = 50 + Math.cos(angle + 0.3) * 35;
            const y3 = 50 + Math.sin(angle + 0.3) * 35;
            const x4 = 50 + Math.cos(angle - 0.3) * 35;
            const y4 = 50 + Math.sin(angle - 0.3) * 35;
            
            return (
              <polygon
                key={i}
                points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
                fill="url(#sunburst)"
              />
            );
          })}
        </g>
        
        {/* Center circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="20" 
          fill="url(#sunburst)"
        />
        
        {/* R letter */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          className="fill-white font-bold text-2xl"
          style={{ fontSize: '24px' }}
        >
          R
        </text>
      </svg>
    </div>
  );
}