import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const DoorEntrance = ({ onOpen }) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const audioRef = useRef(null);
  const { scrollY } = useScroll();
  
  const leftDoorX = useTransform(scrollY, [0, 300], ['0%', '-100%']);
  const rightDoorX = useTransform(scrollY, [0, 300], ['0%', '100%']);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      if (latest > 50 && !hasScrolled) {
        setHasScrolled(true);
        if (audioRef.current) {
          audioRef.current.play().catch(err => console.log('Audio play prevented:', err));
        }
        if (onOpen) {
          setTimeout(onOpen, 1000);
        }
      }
    });

    return () => unsubscribe();
  }, [scrollY, hasScrolled, onOpen]);

  const doorImageUrl = 'https://images.unsplash.com/photo-1721059736449-a240cc8036d6?crop=entropy&cs=srgb&fm=jpg&q=85';

  return (
    <>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" preload="auto" />
      
      {/* Left half of door */}
      <motion.div
        style={{ x: leftDoorX, opacity }}
        className="fixed top-0 left-0 w-1/2 h-screen z-50 pointer-events-none overflow-hidden"
      >
        <div 
          className="w-[200%] h-full bg-cover bg-left bg-no-repeat"
          style={{
            backgroundImage: `url(${doorImageUrl})`,
            backgroundSize: '200% 100%',
            backgroundPosition: 'left center'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-cream/90 px-8 py-4 rounded-lg shadow-2xl border-2 border-warm-brown ml-[50%]">
              <p className="text-warm-brown text-2xl md:text-3xl font-bold tracking-wider">OPEN</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right half of door */}
      <motion.div
        style={{ x: rightDoorX, opacity }}
        className="fixed top-0 right-0 w-1/2 h-screen z-50 pointer-events-none overflow-hidden"
      >
        <div 
          className="w-[200%] h-full bg-cover bg-right bg-no-repeat"
          style={{
            backgroundImage: `url(${doorImageUrl})`,
            backgroundSize: '200% 100%',
            backgroundPosition: 'right center',
            marginLeft: '-100%'
          }}
        />
      </motion.div>

      {!hasScrolled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-cream text-sm tracking-widest"
          >
            SCROLL TO ENTER
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
