import React from 'react';
import sdaLogoImg from '../sda.png';

interface SDALogoProps {
  className?: string;
}

const SDALogo: React.FC<SDALogoProps> = ({ className = 'w-24 h-24' }) => {
  return (
    <img 
      src={sdaLogoImg} 
      alt="Seventh-day Adventist Church Logo" 
      className={`${className} object-contain`} 
    />
  );
};

export default SDALogo;
