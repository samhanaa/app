import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const DoorEntrance = ({ onOpen }) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const audioRef = useRef(null);
  const { scrollY } = useScroll();
  
  const leftDoorX = useTransform(scrollY, [0, 300], [0, -100]);
  const rightDoorX = useTransform(scrollY, [0, 300], [0, 100]);
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

  return (
    <>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" preload="auto" />
      
      <motion.div
        style={{ opacity }}
        className="fixed top-0 left-0 w-1/2 h-screen z-50 pointer-events-none"
      >
        <motion.div
          style={{ x: leftDoorX }}
          className="w-full h-full relative"
        >
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1721059736449-a240cc8036d6?crop=entropy&cs=srgb&fm=jpg&q=85)',
              backgroundPosition: 'left center'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-cream/90 px-8 py-4 rounded-lg shadow-2xl border-2 border-warm-brown">
              <p className="text-warm-brown text-2xl md:text-3xl font-bold tracking-wider">OPEN</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="fixed top-0 right-0 w-1/2 h-screen z-50 pointer-events-none"
      >
        <motion.div
          style={{ x: rightDoorX }}
          className="w-full h-full relative"
        >
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1721059736449-a240cc8036d6?crop=entropy&cs=srgb&fm=jpg&q=85)',
              backgroundPosition: 'right center'
            }}
          />
        </motion.div>
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
