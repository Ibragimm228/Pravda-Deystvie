import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { gameData } from "@/data/game-data";
import confetti from 'canvas-confetti';

const Index = () => {
  const [result, setResult] = useState<string | null>(null);
  const [task, setTask] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const playGame = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setResult(null);
    setTask(null);
    
    setTimeout(() => {
      const random = Math.random();
      const newResult = random < 0.8 ? "ПРАВДА" : "ДЕЙСТВИЕ";
      const tasks = newResult === "ПРАВДА" ? gameData.truths : gameData.actions;
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
      
      setResult(newResult);
      setTask(randomTask);
      setIsAnimating(false);
      triggerConfetti();
      
      toast({
        title: "Результат",
        description: `Вам выпало: ${newResult}`,
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent to-primary p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Правда или Действие
          </h1>
          <p className="text-foreground/60">
            Нажмите кнопку, чтобы начать игру
          </p>
        </motion.div>

        <motion.div
          className="bg-card backdrop-blur-lg rounded-2xl p-8 shadow-lg mb-8 border border-white/20"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {result ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-6xl font-bold mb-6">
                {result}
              </h2>
              <p className="text-foreground/80 text-lg">
                {task}
              </p>
            </motion.div>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <motion.p 
                className="text-lg text-foreground/60"
                animate={{ 
                  opacity: isAnimating ? [0.4, 1, 0.4] : 1,
                  scale: isAnimating ? [0.98, 1.02, 0.98] : 1
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: isAnimating ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                {isAnimating ? "Выбираем..." : "Нажмите кнопку, чтобы начать"}
              </motion.p>
            </div>
          )}
        </motion.div>

        <motion.button
          onClick={playGame}
          className="w-full bg-foreground text-primary rounded-xl py-4 px-8 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-foreground/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isAnimating}
        >
          {isAnimating ? "Выбираем..." : result ? "Играть снова" : "Начать игру"}
        </motion.button>
      </div>
    </div>
  );
};

export default Index;
