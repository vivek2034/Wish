
// Utility to split text into lines based on max width
const getLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
};

export const generateManifestationCard = async (desire: string, affirmation: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve('');
      return;
    }

    const width = 1080;
    const height = 1350; // 4:5 aspect ratio
    canvas.width = width;
    canvas.height = height;

    // 1. Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f0c29');     // Deep dark blue
    gradient.addColorStop(0.4, '#302b63');   // Rich purple
    gradient.addColorStop(1, '#24243e');     // Dark slate
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Mystical Grain/Noise Overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for(let i = 0; i < 5000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }

    // 3. Sacred Geometry / Decorative Circles
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)'; // Gold low opacity
    ctx.lineWidth = 2;
    
    // Center circle
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 400, 0, Math.PI * 2);
    ctx.stroke();

    // Inner glowing circle
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 100, centerX, centerY, 400);
    glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
    glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // 4. Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Corner Accents
    ctx.fillStyle = '#fbbf24'; // Amber
    const cornerSize = 10;
    ctx.fillRect(40 - cornerSize/2, 40 - cornerSize/2, cornerSize, cornerSize);
    ctx.fillRect(width - 40 - cornerSize/2, 40 - cornerSize/2, cornerSize, cornerSize);
    ctx.fillRect(40 - cornerSize/2, height - 40 - cornerSize/2, cornerSize, cornerSize);
    ctx.fillRect(width - 40 - cornerSize/2, height - 40 - cornerSize/2, cornerSize, cornerSize);

    // 5. Typography setup
    ctx.textAlign = 'center';

    // -- Header --
    ctx.font = '300 32px Montserrat, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('WISH THEORY MANIFESTATION', centerX, 120);

    // -- Date --
    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.font = '400 24px Montserrat, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(dateStr.toUpperCase(), centerX, 160);

    // -- The Desire (Centered in Circle) --
    // We want this perfectly centered vertically within the circle area.
    ctx.shadowColor = 'rgba(251, 191, 36, 0.3)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#fffbeb';
    ctx.font = 'italic 400 72px Cormorant Garamond, serif';
    
    const desireLineHeight = 90;
    const maxDesireWidth = width - 240; // Allow good padding inside the circle
    const desireLines = getLines(ctx, `"${desire}"`, maxDesireWidth);
    const totalDesireHeight = desireLines.length * desireLineHeight;
    
    // Calculate start Y to center the block of text around centerY
    // We subtract a small amount (20px) to visually balance it as fonts often have descenders
    let desireY = centerY - (totalDesireHeight / 2) + (desireLineHeight / 3); 

    desireLines.forEach((line) => {
      ctx.fillText(line, centerX, desireY);
      desireY += desireLineHeight;
    });


    // -- The Affirmation (Bottom Anchored) --
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(224, 231, 255, 0.9)';
    ctx.font = '300 42px Montserrat, sans-serif'; // Reduced from 42 if needed, but 42 is good
    
    const affLineHeight = 60;
    const maxAffWidth = width - 200;
    const affLines = getLines(ctx, affirmation, maxAffWidth);
    const totalAffHeight = affLines.length * affLineHeight;
    
    // Anchor to bottom: Start drawing so the last line lands just above the footer
    // Footer is at height - 80, give it some breathing room (e.g. 150px from bottom)
    const bottomMargin = 160; 
    let affY = (height - bottomMargin) - totalAffHeight + affLineHeight; 

    // Safety check: Don't let affirmation overlap desire area too much
    // If it's too high, we might need to clamp it or accept the overlap (or design limitation)
    
    affLines.forEach((line) => {
      ctx.fillText(line, centerX, affY);
      affY += affLineHeight;
    });

    // -- Brand Footer --
    ctx.font = 'italic 300 28px Cormorant Garamond, serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('Trust the process', centerX, height - 80);

    resolve(canvas.toDataURL('image/png'));
  });
};
