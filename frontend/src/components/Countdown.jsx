import { useState, useEffect } from 'react';

export const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 md:gap-8 justify-center flex-wrap">
      <div className="flex flex-col items-center">
        <div className="bg-warm-brown text-cream text-3xl md:text-5xl font-bold px-6 py-4 rounded-lg shadow-xl min-w-[80px] md:min-w-[100px] text-center">
          {timeLeft.days}
        </div>
        <p className="text-dark-brown text-sm md:text-base mt-2 uppercase tracking-wide">Days</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-warm-brown text-cream text-3xl md:text-5xl font-bold px-6 py-4 rounded-lg shadow-xl min-w-[80px] md:min-w-[100px] text-center">
          {timeLeft.hours}
        </div>
        <p className="text-dark-brown text-sm md:text-base mt-2 uppercase tracking-wide">Hours</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-warm-brown text-cream text-3xl md:text-5xl font-bold px-6 py-4 rounded-lg shadow-xl min-w-[80px] md:min-w-[100px] text-center">
          {timeLeft.minutes}
        </div>
        <p className="text-dark-brown text-sm md:text-base mt-2 uppercase tracking-wide">Minutes</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-warm-brown text-cream text-3xl md:text-5xl font-bold px-6 py-4 rounded-lg shadow-xl min-w-[80px] md:min-w-[100px] text-center">
          {timeLeft.seconds}
        </div>
        <p className="text-dark-brown text-sm md:text-base mt-2 uppercase tracking-wide">Seconds</p>
      </div>
    </div>
  );
};
