
const getLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else { line = testLine; }
  }
  lines.push(line.trim());
  return lines;
};

const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(0, 0, size, 0);
  ctx.quadraticCurveTo(0, 0, 0, size);
  ctx.quadraticCurveTo(0, 0, -size, 0);
  ctx.quadraticCurveTo(0, 0, 0, -size);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.restore();
};

export const generateManifestationCard = async (desire: string, affirmation: string): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;
  const centerX = width / 2;
  const centerY = height / 2;

  // Background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#0f0c29');
  grad.addColorStop(0.5, '#302b63');
  grad.addColorStop(1, '#24243e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Decorative Circles
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 420, 0, Math.PI * 2);
  ctx.stroke();

  // Draw Branding Logo at the top center
  drawLogo(ctx, centerX, centerY);

  // Text Configuration
  ctx.textAlign = 'center';
  
  // Desire Text (Middle)
  ctx.fillStyle = '#fffbeb';
  ctx.font = 'italic 72px Cormorant Garamond, serif';
  const lines = getLines(ctx, `"${desire}"`, 800);
  let ty = centerY - ((lines.length - 1) * 45); // Approximate vertical centering
  lines.forEach(l => { 
    ctx.fillText(l, centerX, ty); 
    ty += 90; 
  });

  // Affirmation Text (Bottom)
  ctx.font = '300 40px Montserrat, sans-serif';
  ctx.fillStyle = 'rgba(224, 231, 255, 0.8)';
  const affLines = getLines(ctx, affirmation, 900);
  let ay = height - 250;
  affLines.reverse().forEach(l => { 
    ctx.fillText(l, centerX, ay); 
    ay -= 60; 
  });

  // Branding Footer
  ctx.font = 'italic 24px Cormorant Garamond, serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText('WISH THEORY • TRUST THE PROCESS', centerX, height - 80);

  return canvas.toDataURL('image/png');
};

const drawLogo = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
  const y = cy - 300;
  const g = ctx.createLinearGradient(cx-50, y-50, cx+50, y+50);
  g.addColorStop(0, '#6366f1'); 
  g.addColorStop(1, '#fcd34d');
  
  ctx.save();
  ctx.beginPath(); 
  ctx.arc(cx, y, 50, 0, Math.PI * 2);
  ctx.fillStyle = g; 
  ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.restore();
  
  drawSparkle(ctx, cx, y, 25);
};
