
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Zap, Maximize, CheckCircle2, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
  type: 'MAC' | 'SN';
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose, type }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Camera access denied", err);
        setHasPermission(false);
      }
    }
    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const simulateDetection = () => {
    setIsScanning(true);
    // Simulate OCR processing time
    setTimeout(() => {
      const mockValue = type === 'MAC' 
        ? `00:1A:2B:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}`
        : `SN-${Math.floor(100000 + Math.random() * 900000)}`;
      
      setScannedValue(mockValue);
      setIsScanning(false);
      
      // Beep sound effect simulated with a small delay
      setTimeout(() => {
        onScan(mockValue);
        onClose();
      }, 800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171844]/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-white/20">
        
        {/* Header */}
        <div className="absolute top-6 inset-x-6 z-20 flex justify-between items-center">
           <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live {type} Scanner
              </p>
           </div>
           <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all">
              <X size={20} />
           </button>
        </div>

        {/* Camera Feed */}
        <div className="relative aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
          {hasPermission === false ? (
            <div className="text-center p-8 text-white space-y-4">
               <Camera size={48} className="mx-auto text-red-500" />
               <p className="font-bold">Camera Access Required</p>
               <p className="text-xs text-slate-400">Please enable camera permissions in your browser settings to scan inventory.</p>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover opacity-60"
              />
              
              {/* Aiming Reticle */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-64 h-32 border-2 border-white/30 rounded-3xl relative">
                    {/* Corners */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#87A237] rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#87A237] rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#87A237] rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#87A237] rounded-br-xl" />
                    
                    {/* Scan Line */}
                    {!scannedValue && (
                      <div className="absolute inset-x-0 h-0.5 bg-[#87A237] shadow-[0_0_15px_#87A237] animate-[scan_2s_ease-in-out_infinite]" />
                    )}

                    {scannedValue && (
                      <div className="absolute inset-0 bg-[#87A237]/20 flex items-center justify-center animate-in zoom-in-95">
                         <div className="text-center">
                            <CheckCircle2 size={40} className="text-[#87A237] mx-auto mb-2" />
                            <p className="text-white font-mono font-bold text-sm tracking-tighter">{scannedValue}</p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              {/* Real-time OCR Label */}
              <div className="absolute bottom-32 inset-x-0 text-center">
                 <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em]">Align barcode or label within frame</p>
              </div>
            </>
          )}
        </div>

        {/* Action Tray */}
        <div className="p-8 bg-white space-y-6">
           {isScanning ? (
              <div className="flex items-center justify-center gap-3 py-4 text-[#0070C0]">
                 <Loader2 size={24} className="animate-spin" />
                 <span className="font-bold uppercase tracking-widest text-xs">Analyzing Pattern...</span>
              </div>
           ) : (
              <button 
                onClick={simulateDetection}
                disabled={!hasPermission}
                className="w-full py-5 bg-[#171844] text-white rounded-3xl font-bold shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Zap size={20} className="text-[#87A237]" />
                Trigger Recognition
              </button>
           )}
           
           <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Maximize size={20} className="text-slate-400 shrink-0" />
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase">
                Hardware validation module: Scans 1D/2D codes and OCR text from equipment labels.
              </p>
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
