import React, { useState, useEffect } from 'react';
import './IllustrationPanel.css';

const images: string[] = [
  '/mascot/mascot-moon.jpg',
  '/mascot/mascot-cloud-stars.jpg',
  '/mascot/mascot-walk-1.jpg',
  '/mascot/mascot-walk-2.jpg',
  '/mascot/mascot-sit.jpg',
  '/mascot/mascot-wave.jpg',
  '/mascot/mascot-pose.jpg',
  '/mascot/mascot-cloud.jpg',
  '/mascot/mascot-happy.jpg'
];

const bgList: string[] = [
  'linear-gradient(135deg,#f5f7fb 0%,#d9d2ff 100%)',
  'linear-gradient(135deg,#e0f7fa 0%,#b2ebf2 100%)',
  'linear-gradient(135deg,#ffe0e0 0%,#ffd6e0 100%)',
  'linear-gradient(135deg,#e0ffe0 0%,#d6ffd6 100%)',
  'linear-gradient(135deg,#fffde0 0%,#fff6d6 100%)',
  'linear-gradient(135deg,#e0e0ff 0%,#d6d6ff 100%)',
  'linear-gradient(135deg,#f0e0ff 0%,#e6d6ff 100%)',
  'linear-gradient(135deg,#e0fff7 0%,#d6fff6 100%)',
  'linear-gradient(135deg,#f7e0ff 0%,#f6d6ff 100%)'
];

const IllustrationPanel: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % images.length);
        setFade(true);
      }, 350);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="illustration-panel">
      <div
        className="illustration-surface dynamic-bg"
        data-bg-index={idx % bgList.length}
        data-bg={bgList[idx % bgList.length]}
      >
        <div className="illustration-frame">
          <img
            src={images[idx]}
            alt={`Mascota ilustración ${idx + 1}`}
            className={`illustration-img${fade ? ' fade-in' : ' fade-out'}`}
            data-fade={fade ? 'in' : 'out'}
            onError={(e) => { (e.currentTarget as HTMLImageElement).classList.add('img-error'); e.currentTarget.alt = 'Añade las imágenes a /public/mascot'; }}
          />
        </div>
      </div>
    </div>
  );
};

export default IllustrationPanel;
