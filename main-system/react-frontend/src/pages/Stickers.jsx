import { useEffect, useRef, useState } from 'react';

const STICKER_URL = import.meta.env.VITE_STICKER_URL || 'http://localhost:5176';

const Stickers = () => {
  const [iframeHeight, setIframeHeight] = useState('calc(100vh - 64px)');
  const iframeRef = useRef(null);

  useEffect(() => {
    // Adjust iframe height based on viewport
    const updateHeight = () => {
      const navHeight = 64; // Height of the staff navigation header
      setIframeHeight(`${window.innerHeight - navHeight}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    const sendToken = () => {
      const token = localStorage.getItem('auth_token');
      iframeRef.current?.contentWindow?.postMessage({ type: 'AUTH_TOKEN', token }, STICKER_URL);
    };

    const handleMessage = (event) => {
      if (event.origin === STICKER_URL && event.data?.type === 'REQUEST_AUTH_TOKEN') sendToken();
    };

    const iframe = iframeRef.current;
    window.addEventListener('message', handleMessage);
    iframe?.addEventListener('load', sendToken);
    return () => {
      window.removeEventListener('message', handleMessage);
      iframe?.removeEventListener('load', sendToken);
    };
  }, []);

  return (
    <div className="w-full h-full">
      <iframe
        ref={iframeRef}
        src={STICKER_URL}
        title="Staff Sticker Management"
        className="w-full border-0"
        style={{ height: iframeHeight }}
        allow="fullscreen"
      />
    </div>
  );
};

export default Stickers;
