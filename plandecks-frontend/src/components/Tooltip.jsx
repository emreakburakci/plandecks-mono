import React, { useState, useRef } from 'react';

export default function Tooltip({ children, text, position = "top" }) {
    if (!text) return children;

    const containerRef = useRef(null);
    const [style, setStyle] = useState({}); // Dinamik stil (pozisyon)
    const [isVisible, setIsVisible] = useState(false); // Görünürlük durumu

    const verticalClasses = {
        top: "bottom-full mb-2",
        bottom: "top-full mt-2",
        left: "right-full mr-2 top-1/2 -translate-y-1/2",
        right: "left-full ml-2 top-1/2 -translate-y-1/2",
    };

    const handleMouseEnter = () => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        let newStyle = {};

        // --- AKILLI HİZALAMA ---
        if (position === 'left' || position === 'right') {
            // Yanlar için özel bir yatay kaydırma yapmıyoruz
        } else if (rect.right > screenWidth * 0.85) {
            // Sağa çok yakınsa
            newStyle = { right: 0, left: 'auto', transform: 'none' };
        } else if (rect.left < screenWidth * 0.15) {
            // Sola çok yakınsa
            newStyle = { left: 0, right: 'auto', transform: 'none' };
        } else {
            // Ortala
            newStyle = { left: '50%', transform: 'translateX(-50%)' };
        }

        setStyle(newStyle);
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <div
            className="relative flex items-center justify-center w-max"
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {/* Tooltip Baloncuğu */}
            <div
                className={`absolute ${verticalClasses[position]} z-[9999] w-max max-w-[200px] sm:max-w-xs 
                            transition-all duration-200 origin-center pointer-events-none
                            ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
                style={style}
            >
                <div className="bg-gray-800 text-white text-xs rounded py-1.5 px-3 shadow-xl text-center leading-relaxed">
                    {text}

                    {/* Küçük Ok İşareti (Sadece ortalıysa göster) */}
                    {(!style.right && !style.left && position !== 'left' && position !== 'right') && (
                        <div className={`absolute w-2 h-2 bg-gray-800 rotate-45 
                            ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                            ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                        `}></div>
                    )}
                </div>
            </div>
        </div>
    );
}