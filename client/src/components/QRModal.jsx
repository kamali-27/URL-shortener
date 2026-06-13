import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const QRModal = ({ isOpen, onClose, shortUrl }) => {
  if (!isOpen) return null;

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-element');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Add padding around QR Code
      const padding = 20;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;
      
      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR image
      ctx.drawImage(img, padding, padding);

      try {
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qrcode-${shortUrl.split('/').pop()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success('QR Code downloaded!');
      } catch (err) {
        console.error('Error exporting QR to PNG:', err);
        toast.error('Failed to download QR Code');
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition duration-150 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-2">QR Code Link</h3>
        <p className="text-gray-400 text-sm mb-6 truncate px-4">{shortUrl}</p>

        {/* QR Canvas Wrap */}
        <div className="flex items-center justify-center p-4 bg-white rounded-xl shadow-inner mb-6 mx-auto w-fit border border-gray-200">
          <QRCodeSVG
            id="qr-code-element"
            value={shortUrl}
            size={200}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={copyLink}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white font-medium rounded-xl border border-gray-700 transition duration-200 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Link</span>
          </button>
          
          <button
            onClick={downloadQR}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/10 transition duration-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
