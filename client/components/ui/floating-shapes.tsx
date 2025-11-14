interface FloatingShapesProps {
  variant?: 'hero' | 'section' | 'card';
  colors?: 'primary' | 'accent' | 'rainbow' | 'warm' | 'cool';
}

export function FloatingShapes({ variant = 'section', colors = 'rainbow' }: FloatingShapesProps) {
  const colorClasses = {
    primary: [
      'bg-primary/20',
      'bg-primary/30',
      'bg-primary/15',
    ],
    accent: [
      'bg-accent/20',
      'bg-accent/30',
      'bg-accent/15',
    ],
    rainbow: [
      'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      'bg-gradient-to-br from-orange-500/20 to-red-500/20',
      'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
    ],
    warm: [
      'bg-gradient-to-br from-orange-500/20 to-red-500/20',
      'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
      'bg-gradient-to-br from-pink-500/20 to-red-500/20',
    ],
    cool: [
      'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      'bg-gradient-to-br from-purple-500/20 to-blue-500/20',
      'bg-gradient-to-br from-cyan-500/20 to-teal-500/20',
    ],
  };

  const shapes = colorClasses[colors];

  if (variant === 'hero') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating circles */}
        <div className={`absolute top-20 left-10 w-64 h-64 ${shapes[0]} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '4s' }}></div>
        <div className={`absolute top-40 right-20 w-80 h-80 ${shapes[1]} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className={`absolute bottom-20 left-1/3 w-96 h-96 ${shapes[2]} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
        <div className={`absolute top-1/2 right-1/4 w-72 h-72 ${shapes[3] || shapes[0]} rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '7s', animationDelay: '0.5s' }}></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-32 right-1/3 w-20 h-20 bg-primary/10 rotate-45 animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-accent/10 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 left-1/2 w-24 h-24 bg-purple-500/10 rotate-12 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-48 h-48 ${shapes[0]} rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-0 right-0 w-56 h-56 ${shapes[1]} rounded-full blur-3xl`}></div>
        {shapes[2] && (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${shapes[2]} rounded-full blur-3xl`}></div>
        )}
      </div>
    );
  }

  // card variant
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-inherit">
      <div className={`absolute -top-8 -right-8 w-32 h-32 ${shapes[0]} rounded-full blur-2xl`}></div>
      <div className={`absolute -bottom-8 -left-8 w-24 h-24 ${shapes[1]} rounded-full blur-2xl`}></div>
    </div>
  );
}

export function FloatingIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Shopping cart */}
      <div className="absolute top-20 left-[10%] animate-bounce" style={{ animationDuration: '3s' }}>
        <div className="text-4xl opacity-20">🛒</div>
      </div>
      
      {/* Package */}
      <div className="absolute top-40 right-[15%] animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <div className="text-5xl opacity-20">📦</div>
      </div>
      
      {/* Money */}
      <div className="absolute bottom-32 left-[20%] animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}>
        <div className="text-4xl opacity-20">💰</div>
      </div>
      
      {/* Rocket */}
      <div className="absolute top-1/3 right-[25%] animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
        <div className="text-6xl opacity-20">🚀</div>
      </div>
      
      {/* Star */}
      <div className="absolute bottom-40 right-[30%] animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>
        <div className="text-3xl opacity-20">⭐</div>
      </div>
      
      {/* Lightning */}
      <div className="absolute top-1/2 left-[15%] animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.8s' }}>
        <div className="text-4xl opacity-20">⚡</div>
      </div>
    </div>
  );
}
