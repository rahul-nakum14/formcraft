import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check } from 'lucide-react';

interface CaptchaProps {
  onVerify: (verified: boolean) => void;
}

const Captcha: React.FC<CaptchaProps> = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate a random string for the CAPTCHA
  const generateCaptchaText = (): string => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    const length = 6;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Draw the CAPTCHA on the canvas
  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill with light background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise (dots)
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200}, 0.3)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Add lines for more confusion
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200}, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw text
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw each character with slight rotation
    const charWidth = canvas.width / (text.length + 1);
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      ctx.translate(charWidth * (i + 1), canvas.height / 2);
      ctx.rotate((Math.random() - 0.5) * 0.3);
      ctx.fillText(text[i], 0, Math.random() * 8 - 4);
      ctx.restore();
    }
  };

  // Generate a new CAPTCHA
  const refreshCaptcha = () => {
    const newCaptchaText = generateCaptchaText();
    setCaptchaText(newCaptchaText);
    setUserInput('');
    setIsVerified(false);
    
    // Allow a slight delay for state to update before drawing
    setTimeout(() => {
      drawCaptcha(newCaptchaText);
    }, 10);
  };

  // Verify the user input
  const verifyCaptcha = () => {
    const isValid = userInput.trim().toLowerCase() === captchaText.toLowerCase();
    
    if (isValid) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setAttempts(prev => prev + 1);
      refreshCaptcha();
      
      // If too many failed attempts, notify parent
      if (attempts >= 3) {
        onVerify(false);
      }
    }
  };

  // Initialize CAPTCHA on component mount
  useEffect(() => {
    refreshCaptcha();
  }, []);

  return (
    <div className="space-y-3 p-3 border rounded-md">
      <div className="text-sm font-medium mb-2">Please complete the CAPTCHA to continue</div>
      
      <div className="flex justify-center mb-4">
        <canvas
          ref={canvasRef}
          width={200}
          height={60}
          className="border rounded bg-gray-50"
        />
      </div>
      
      {isVerified ? (
        <div className="flex items-center justify-center text-green-600">
          <Check className="h-4 w-4 mr-2" />
          <span>Verified</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter the text shown above"
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              disabled={isVerified}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={refreshCaptcha}
              title="Get a new CAPTCHA"
              disabled={isVerified}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            type="button" 
            onClick={verifyCaptcha}
            className="w-full"
            disabled={!userInput || isVerified}
          >
            Verify
          </Button>
        </div>
      )}
    </div>
  );
};

export default Captcha;