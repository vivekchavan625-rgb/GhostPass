import React, { useRef, useEffect } from 'react';

// Pool of synthetic fake tokens that turn into block characters
const SYNTHETIC_TOKENS = [
  'user@example.com',
  '98XXXXXX10',
  '192.168.1.1',
  'ABCPV1234K',
  '4532-XXXX-9010',
  'CARD_01',
  'USER_02',
  '255.255.0.0',
  '7890-1234-5678',
  'PHONE_01',
  'admin@corp.internal',
  '10.0.4.15',
  'PAN_01',
  'SECURE_HASH',
];

const BLOCK_CHARS = '█▓▒░■□▪▫▲▼';

interface Column {
  x: number;
  y: number;
  speed: number;
  text: string;
  isRedacted: boolean;
  charIndex: number;
}

export const RedactionRain: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 30; // Cap at ~30 fps for low CPU usage

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const fontSize = Math.floor(12 * dpr);
    const colSpacing = Math.floor(60 * dpr);
    const colCount = Math.floor(canvas.width / colSpacing) + 2;

    const columns: Column[] = [];
    for (let i = 0; i < colCount; i++) {
      columns.push({
        x: i * colSpacing,
        y: Math.random() * -canvas.height,
        speed: (Math.random() * 1.2 + 0.8) * dpr,
        text: SYNTHETIC_TOKENS[Math.floor(Math.random() * SYNTHETIC_TOKENS.length)],
        isRedacted: Math.random() > 0.4,
        charIndex: 0,
      });
    }

    const draw = (currentTime: number) => {
      animId = requestAnimationFrame(draw);

      if (document.hidden) return; // Pause when tab is hidden

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      // Soft clear with trailing fade
      ctx.fillStyle = 'rgba(7, 10, 20, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];

        // Draw character sequence vertically
        for (let j = 0; j < col.text.length; j++) {
          const charY = col.y + j * fontSize * 1.3;
          if (charY < -fontSize || charY > canvas.height + fontSize) continue;

          // If near the head, it's cyan/violet, then redacted into block chars
          if (col.isRedacted && j > 4) {
            ctx.fillStyle = 'rgba(124, 92, 255, 0.16)';
            const blockChar = BLOCK_CHARS[(j + Math.floor(col.y * 0.1)) % BLOCK_CHARS.length];
            ctx.fillText(blockChar, col.x, charY);
          } else {
            ctx.fillStyle = j === 0 ? 'rgba(34, 227, 255, 0.45)' : 'rgba(124, 92, 255, 0.22)';
            ctx.fillText(col.text[j], col.x, charY);
          }
        }

        col.y += col.speed;

        // Reset column when it goes past bottom
        if (col.y > canvas.height + col.text.length * fontSize * 1.3) {
          col.y = Math.random() * -200 * dpr;
          col.text = SYNTHETIC_TOKENS[Math.floor(Math.random() * SYNTHETIC_TOKENS.length)];
          col.isRedacted = Math.random() > 0.4;
          col.speed = (Math.random() * 1.2 + 0.8) * dpr;
        }
      }
    };

    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none select-none ${className}`}
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
};
