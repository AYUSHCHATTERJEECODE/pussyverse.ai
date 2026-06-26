import { useState, useEffect } from "react";
import { Sparkles, Quote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CAT_QUOTES = [
  "\"In ancient times cats were worshipped as gods; they have not forgotten this.\" — Terry Pratchett",
  "\"Dogs have owners, cats have staff.\" — Unknown",
  "\"Cats do what they want. They don't care about your Zoom meetings, your keyboard, or your personal space.\" — Feline Law",
  "\"A cat's rule of physics: If it is on a elevated surface, it belongs on the floor. Gravity is merely a suggestion.\" — Sir Isaac Meowton",
  "\"I had to clean my room because my cat was staring at me with deep judgement... and frankly, she had excellent points.\" — Unknown",
  "\"Sleeping 18 hours a day is a highly demanding full-time career. Please do not disturb the professional.\" — Feline Union",
  "\"Meow means woof in a significantly higher social class.\" — Unknown",
  "\"If cats could talk, they wouldn't.\" — Milt Herth",
  "\"I would like to apologize to my royal companion for breathing too loudly in her presence today.\" — Humble Cat Staff",
  "\"My cat is not spoiled. I have simply been thoroughly trained to cater to his highness's standards.\" — Unknown",
  "\"There are two means of refuge from the miseries of life: music and cats.\" — Albert Schweitzer"
];

export default function FunnyCatQuotes() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % CAT_QUOTES.length);
    }, 10000); // 10 seconds refresh rate

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 mt-8 sm:mt-12 text-center">
      <div className="relative p-6 rounded-2xl bg-neutral-950/40 border border-brand-gold/10 overflow-hidden shadow-xl">
        <div className="absolute top-2 right-3 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-gold/40 animate-pulse" />
          <span className="text-[8px] font-mono tracking-widest text-neutral-600 uppercase">Feline Wisdom Ticker</span>
        </div>
        
        <Quote className="w-5 h-5 text-brand-gold/20 mx-auto mb-2" />
        
        <div className="min-h-[48px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-xs sm:text-sm font-sans italic text-neutral-400 max-w-xl mx-auto leading-relaxed"
            >
              {CAT_QUOTES[index]}
            </motion.p>
          </AnimatePresence>
        </div>
        
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {CAT_QUOTES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === index ? "w-4 bg-brand-gold" : "w-1.5 bg-neutral-800"
              }`}
              aria-label={`Show quote ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
