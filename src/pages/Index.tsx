import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { gameData } from "@/data/game-data";
import confetti from 'canvas-confetti';
import { Share, Settings, ArrowRight, Send } from "lucide-react";

const Index = () => {
  const [result, setResult] = useState<string | null>(null);
  const [task, setTask] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<"default" | "dark" | "party">("default");
  const [history, setHistory] = useState<Array<{result: string, task: string}>>([]);
  const [sharedContent, setSharedContent] = useState<{result: string, task: string} | null>(null);
  const { toast } = useToast();
  
 
  useEffect(() => {
   
    const urlParams = new URLSearchParams(window.location.search);
    const sharedResult = urlParams.get('result');
    const sharedTask = urlParams.get('task');
    
    if (sharedResult && sharedTask) {
      setSharedContent({
        result: decodeURIComponent(sharedResult),
        task: decodeURIComponent(sharedTask)
      });
      return;
    }
    

    const storedSharedContent = localStorage.getItem('truthOrDareShared');
    if (storedSharedContent) {
      try {
        const parsed = JSON.parse(storedSharedContent);
        setSharedContent(parsed);
        localStorage.removeItem('truthOrDareShared');
      } catch (e) {
        console.error("Error parsing shared content", e);
        localStorage.removeItem('truthOrDareShared');
      }
    }
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: theme === "party" ? ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'] : undefined
    });
  };

  
  const getBackgroundClass = () => {
    switch(theme) {
      case "dark":
        return "bg-gradient-to-br from-gray-900 to-gray-800";
      case "party":
        return "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500";
      default:
        return "bg-gradient-to-br from-accent to-primary";
    }
  };


  const dismissSharedContent = () => {
    setSharedContent(null);
  };

  const playGame = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setResult(null);
    setTask(null);
    
 
    const timeoutId = setTimeout(() => {
      const random = Math.random();
      const newResult = random < 0.8 ? "ПРАВДА" : "ДЕЙСТВИЕ";
      const tasksPool = newResult === "ПРАВДА" ? gameData.truths : gameData.actions;
      const randomTask = tasksPool[Math.floor(Math.random() * tasksPool.length)];
      
      setResult(newResult);
      setTask(randomTask);
      setHistory(prev => [...prev, {result: newResult, task: randomTask}]);
      setIsAnimating(false);
      triggerConfetti();
      
      toast({
        title: "Результат",
        description: `Вам выпало: ${newResult}`,
      });
    }, 1500); 
    
    
    return () => clearTimeout(timeoutId);
  };

  const selectManually = (choice: "ПРАВДА" | "ДЕЙСТВИЕ") => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setResult(null);
    setTask(null);
    
   
    const timeoutId = setTimeout(() => {
     
      const tasksPool = choice === "ПРАВДА" ? gameData.truths : gameData.actions;
      const randomTask = tasksPool[Math.floor(Math.random() * tasksPool.length)];
      
      setResult(choice);
      setTask(randomTask);
      setHistory(prev => [...prev, {result: choice, task: randomTask}]);
      setIsAnimating(false);
      triggerConfetti();
      
      toast({
        title: "Результат",
        description: `Вы выбрали: ${choice}`,
      });
    }, 1500); 
    
   
    return () => clearTimeout(timeoutId);
  };

  const shareResult = () => {
    if (!result || !task) return;
    
    const shareText = `Правда или Действие: Мне выпало "${result}" - ${task}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Правда или Действие',
        text: shareText,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "Скопировано",
          description: "Текст скопирован в буфер обмена",
        });
      });
    }
  };

  const shareToTelegram = () => {
    if (!result || !task) return;
    
  
    const encodedResult = encodeURIComponent(result);
    const encodedTask = encodeURIComponent(task);
    const shareUrl = `${window.location.href.split('?')[0]}?result=${encodedResult}&task=${encodedTask}`;
    
    const shareText = encodeURIComponent(`Правда или Действие: Мне выпало "${result}" - ${task}. Нажми на ссылку, чтобы ответить на вопрос или выполнить действие вместе со мной!`);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`;
    
    
    window.open(telegramUrl, '_blank');
    
    toast({
      title: "Telegram",
      description: "Открываем Telegram для отправки",
    });
  };

  const shareHistoryItemToTelegram = (item: {result: string, task: string}) => {
   
    const encodedResult = encodeURIComponent(item.result);
    const encodedTask = encodeURIComponent(item.task);
    const shareUrl = `${window.location.href.split('?')[0]}?result=${encodedResult}&task=${encodedTask}`;
    
    const shareText = encodeURIComponent(`Правда или Действие: Мне выпало "${item.result}" - ${item.task}. Нажми на ссылку, чтобы ответить на вопрос или выполнить действие вместе со мной!`);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`;
    
    window.open(telegramUrl, '_blank');
  };

 
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${getBackgroundClass()} p-4 transition-colors duration-500`}>
      <div className="w-full max-w-md relative">
       
        <AnimatePresence>
  {sharedContent && (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }} // 
      exit={{ opacity: 0, y: -30, transition: { duration: 0.2 } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md" 
    >
      <div
        className="absolute inset-0"
        onClick={dismissSharedContent}
      ></div>
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-gray-800 w-full max-w-md mx-auto p-8 rounded-3xl shadow-2xl border border-gray-700 relative z-10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      >
        <h3 className="text-2xl font-semibold text-white mb-6 text-center">👋 Привет!</h3>
        <p className="text-gray-300 mb-6 text-center">Твоему другу/подруге выпало:</p>

        <div
          className={`px-6 py-4 rounded-xl mb-6 font-semibold text-lg flex items-center justify-center ${
            sharedContent.result === "ПРАВДА"
              ? "bg-blue-600/20 text-blue-300 border border-blue-600/30"
              : "bg-red-600/20 text-red-300 border border-red-600/30"
          }`}
        >
          <span className="mr-3">{sharedContent.result}</span>
          <span>{sharedContent.task}</span>
        </div>

        <p className="text-gray-300 mb-8 text-center">Ответьте на вопрос или выполните действие вдвоем!</p>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }} 
            whileTap={{ scale: 0.95 }}
            onClick={dismissSharedContent}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            Понятно, играем!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative"
        >
          <h1 className="text-4xl font-bold mb-2 text-foreground tracking-tight">
            Правда или Действие
          </h1>
          <p className="text-foreground/60">
            Веселая игра для компании друзей
          </p>
          <div className="absolute right-0 top-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSettings(!showSettings)}
              className="bg-foreground/20 p-2 rounded-full backdrop-blur-lg"
            >
              <Settings size={20} />
            </motion.button>
          </div>
        </motion.div>
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card/90 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-lg border border-white/20 overflow-hidden"
            >
              <h3 className="font-semibold mb-4">Настройки</h3>
              
              <div>
                <label className="block text-sm mb-2">Тема оформления</label>
                <div className="grid grid-cols-3 gap-2">
                  {["default", "dark", "party"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t as any)}
                      className={`py-2 px-3 rounded-lg text-sm transition ${
                        theme === t 
                          ? "bg-foreground text-primary" 
                          : "bg-foreground/20 hover:bg-foreground/30"
                      }`}
                    >
                      {t === "default" ? "Стандарт" : t === "dark" ? "Темная" : "Вечеринка"}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          layout
          className="bg-card/90 backdrop-blur-lg rounded-2xl p-8 shadow-lg mb-8 border border-white/20 relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-accent/10 blur-2xl"></div>
          <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-primary/10 blur-2xl"></div>
          
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center relative z-10"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  className="inline-block bg-gradient-to-br from-foreground to-foreground/80 text-primary px-6 py-3 rounded-xl mb-6"
                >
                  <h2 className="text-4xl md:text-5xl font-bold break-words">
                    {result}
                  </h2>
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-foreground/90 text-base md:text-lg font-medium leading-relaxed">
                    {task}
                  </p>
                  <div className="mt-6 flex justify-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={shareResult}
                      className="inline-flex items-center text-sm text-foreground/60 hover:text-foreground bg-foreground/10 hover:bg-foreground/20 rounded-full px-3 py-1"
                    >
                      <Share size={14} className="mr-1" />
                      Поделиться
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={shareToTelegram}
                      className="inline-flex items-center text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-full px-3 py-1"
                    >
                      <Send size={14} className="mr-1" />
                      Telegram
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-[180px] flex flex-col items-center justify-center"
              >
                {isAnimating ? (
                  <>
                    <motion.div
                      className="w-20 h-20 rounded-full border-4 border-t-transparent border-foreground/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.p 
                      className="text-base md:text-lg text-foreground/60 mt-4"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Выбираем...
                    </motion.p>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="bg-foreground/10 p-6 rounded-full mb-4"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <ArrowRight className="w-8 h-8 text-foreground/60" />
                    </motion.div>
                    <p className="text-base md:text-lg text-foreground/60">
                      Нажмите кнопку, чтобы начать
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <div className="space-y-4">
          <motion.button
            onClick={playGame}
            className="w-full bg-gradient-to-r from-foreground to-foreground/90 text-primary rounded-xl py-4 px-8 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={isAnimating}
          >
            {isAnimating ? (
              <span className="flex items-center justify-center">
                <motion.span 
                  className="w-5 h-5 bg-primary/80 rounded-full inline-block mr-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                Выбираем...
              </span>
            ) : result ? "Играть снова" : "Случайный выбор"}
          </motion.button>

          <div className="w-full grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => selectManually("ПРАВДА")}
              className="bg-foreground/80 text-primary rounded-xl py-4 px-8 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isAnimating}
            >
              Правда
            </motion.button>
            <motion.button
              onClick={() => selectManually("ДЕЙСТВИЕ")}
              className="bg-foreground/80 text-primary rounded-xl py-4 px-8 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isAnimating}
            >
              Действие
            </motion.button>
          </div>
        </div>
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <details className="group">
              <summary className="flex items-center cursor-pointer text-sm text-foreground/60 hover:text-foreground/80">
                <span>История ({history.length})</span>
                <motion.span 
                  animate={{ rotate: 0 }}
                  className="ml-2 transition-transform group-open:rotate-180"
                >▼</motion.span>
              </summary>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="mt-2 space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent"
              >
                {history.slice().reverse().map((item, i) => (
                  <div 
                    key={i} 
                    className="bg-card/50 backdrop-blur-sm p-3 rounded-lg border border-white/10 text-sm flex justify-between items-center"
                  >
                    <div>
                      <span className={`font-semibold ${item.result === "ПРАВДА" ? "text-blue-400" : "text-red-400"}`}>
                        {item.result}:
                      </span> {item.task}
                    </div>
                    <button 
                      onClick={() => shareHistoryItemToTelegram(item)}
                      className="ml-2 p-1 text-blue-400 hover:text-blue-600 rounded-full hover:bg-white/10"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                ))}
              </motion.div>
            </details>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;