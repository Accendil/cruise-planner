import type { FC } from 'react';

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

// Two subtle polaroids - right side only, faded, not competing with the hero content
const FRAMES = [
  { src: '/images/family-1.jpg', top: '8%',   right: '3%',  width: 76, rotate:  3.2, opacity: 0.55 },
  { src: '/images/family-3.jpg', top: '52%',  right: '2%',  width: 64, rotate: -2.1, opacity: 0.45 },
];

export const HeroHeader: FC = () => {
  const days = getDaysUntil('2026-05-24');
  const sailed = days <= 0;

  return (
    <header className="relative overflow-hidden" style={{ minHeight: '62vh' }}>

      {/* Background ship photo */}
      <img
        src="/images/ship.jpg"
        alt="Star of the Seas"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ objectPosition: '50% 60%' }}
      />

      {/* Gradient overlay - dark at bottom, subtle at top */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, #071828 0%, #071828cc 30%, #07182855 60%, transparent 100%)' }}
      />
      {/* Left edge fade for photos */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, #07182888 0%, transparent 25%, transparent 75%, #07182844 100%)' }}
      />

      {/* Scattered family polaroids */}
      {FRAMES.map((f, i) => (
        <div
          key={i}
          className="photo-frame hidden md:block"
          style={{
            top: f.top,
            ...(f.right ? { right: f.right } : { left: f.left }),
            width: f.width,
            height: Math.round(f.width * 0.85),
            transform: `rotate(${f.rotate}deg)`,
            zIndex: 10,
            opacity: f.opacity,
          }}
        >
          <img src={f.src} alt="" draggable={false} />
        </div>
      ))}

      {/* Main content */}
      <div
        className="relative flex flex-col justify-end px-8 pb-10 md:px-16 md:pb-12"
        style={{ minHeight: '62vh', zIndex: 5 }}
      >
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-2"
          style={{ color: '#06b6d4', letterSpacing: '0.2em' }}
        >
          Royal Caribbean · Eastern Caribbean · 7 Nights
        </p>

        <h1
          className="font-display italic font-medium leading-none mb-1"
          style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)', color: '#fff' }}
        >
          Star of the Seas
        </h1>

        <div className="flex items-end gap-8 mt-4 flex-wrap">
          {/* Big countdown */}
          <div className="flex items-end gap-2">
            <span
              className="font-display font-semibold leading-none"
              style={{ fontSize: 'clamp(5rem, 14vw, 10rem)', color: '#fff', lineHeight: 1 }}
            >
              {sailed ? '🌴' : days}
            </span>
            {!sailed && (
              <span className="pb-2 font-body text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
                days to go
              </span>
            )}
          </div>

          {/* Trip details */}
          <div className="pb-2 font-body text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <p className="mb-0.5">Departs <strong className="text-white">24 May 2026</strong> from Port Canaveral</p>
            <p className="mb-0.5">Stateroom 8610-D1 · Dining 17:00</p>
            <p>Reservation <span className="font-mono" style={{ color: '#06b6d4' }}>8332287</span></p>
          </div>
        </div>
      </div>
    </header>
  );
};
