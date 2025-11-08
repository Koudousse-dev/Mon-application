import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = 2000;
    const steps = 100;
    const interval = duration / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          }, 300);
          return 100;
        }
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center gap-8 px-6"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-10 h-10 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C10.8954 2 10 2.89543 10 4V6H14V4C14 2.89543 13.1046 2 12 2Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 20C13.1046 20 14 19.1046 14 18V16H10V18C10 19.1046 10.8954 20 12 20Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8 8C6.89543 8 6 8.89543 6 10V14C6 15.1046 6.89543 16 8 16C9.10457 16 10 15.1046 10 14V10C10 8.89543 9.10457 8 8 8Z"
                    fill="currentColor"
                    opacity="0.7"
                  />
                  <path
                    d="M16 8C14.8954 8 14 8.89543 14 10V14C14 15.1046 14.8954 16 16 16C17.1046 16 18 15.1046 18 14V10C18 8.89543 17.1046 8 16 8Z"
                    fill="currentColor"
                    opacity="0.7"
                  />
                </svg>
              </div>
            </motion.div>

            <div className="text-center">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2 drop-shadow-lg"
              >
                Dieu veille sur nos enfants
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/90 text-sm sm:text-base font-body drop-shadow"
              >
                Service de garde d'enfants au Gabon
              </motion.p>
            </div>

            <div className="w-64 sm:w-80">
              <div className="relative">
                <div className="h-2 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                    className="h-full bg-white rounded-full shadow-lg"
                  />
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 text-center"
                >
                  <span className="text-2xl font-bold text-white drop-shadow-lg font-mono">
                    {progress}%
                  </span>
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-1 mt-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-white/60 text-xs font-body"
          >
            Chargement en cours...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
