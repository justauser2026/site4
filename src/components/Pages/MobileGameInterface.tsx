import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Play, Pause, RotateCcw, Save, Calendar, Trophy, Clock, User, Gamepad2, Zap, FileX2 as X2, AArrowDown as X4, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useGameAudio } from '../../hooks/useGameAudio';

interface MobileGameInterfaceProps {
  onBack: () => void;
}

interface GameState {
  day: number;
  hour: number;
  minute: number;
  energy: number;
  social: number;
  health: number;
  productivity: number;
  currentRoom: 'bedroom' | 'living' | 'kitchen' | 'gym' | 'bathroom';
  isPlaying: boolean;
  gameSpeed: number;
  completedActions: string[];
  character: {
    name: string;
    mood: 'happy' | 'tired' | 'energetic' | 'relaxed' | 'stressed';
    activity: 'idle' | 'sleep' | 'eat' | 'exercise' | 'relax' | 'drinkWater' | 'shower';
  };
  achievements: string[];
  totalScore: number;
}

const MobileGameInterface: React.FC<MobileGameInterfaceProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const { audioSettings, toggleMute, playButtonSound, playNavigationSound, playConsequenceSound } = useGameAudio();
  const [showWelcome, setShowWelcome] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    hour: 7,
    minute: 0,
    energy: 80,
    social: 70,
    health: 85,
    productivity: 75,
    currentRoom: 'bedroom',
    isPlaying: false,
    gameSpeed: 1,
    completedActions: [],
    character: {
      name: 'Alex',
      mood: 'happy',
      activity: 'idle'
    },
    achievements: [],
    totalScore: 0
  });

  // Função para formatar o tempo do jogo
  const formatGameTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Sistema de tempo: 1 segundo real = 15 minutos no jogo
  useEffect(() => {
    if (gameState.isPlaying) {
      gameLoopRef.current = setInterval(() => {
        setGameState(prev => {
          let newMinute = prev.minute + 15; // 15 minutos por segundo
          let newHour = prev.hour;
          let newDay = prev.day;

          // Ajustar minutos e horas
          if (newMinute >= 60) {
            newHour += Math.floor(newMinute / 60);
            newMinute = newMinute % 60;
          }

          // Ajustar dias
          if (newHour >= 24) {
            newDay += Math.floor(newHour / 24);
            newHour = newHour % 24;
          }

          // Efeitos baseados no tempo
          let energyChange = 0;
          let socialChange = 0;
          let healthChange = 0;
          let productivityChange = 0;

          // Ciclo natural de energia baseado na hora
          if (newHour >= 6 && newHour <= 12) {
            energyChange = 0.1; // Manhã - energia aumenta
          } else if (newHour >= 13 && newHour <= 18) {
            energyChange = -0.05; // Tarde - energia diminui lentamente
          } else if (newHour >= 19 && newHour <= 23) {
            energyChange = -0.2; // Noite - energia diminui mais
          } else {
            energyChange = -0.3; // Madrugada - energia diminui rapidamente
          }

          // Aplicar mudanças graduais
          const newEnergy = Math.max(0, Math.min(100, prev.energy + energyChange));
          const newSocial = Math.max(0, Math.min(100, prev.social + socialChange));
          const newHealth = Math.max(0, Math.min(100, prev.health + healthChange));
          const newProductivity = Math.max(0, Math.min(100, prev.productivity + productivityChange));

          return {
            ...prev,
            day: newDay,
            hour: newHour,
            minute: newMinute,
            energy: newEnergy,
            social: newSocial,
            health: newHealth,
            productivity: newProductivity
          };
        });
      }, 1000 / gameState.gameSpeed); // 1 segundo real

      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [gameState.isPlaying, gameState.gameSpeed]);

  const togglePlayPause = () => {
    playButtonSound();
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const changeGameSpeed = (speed: number) => {
    playButtonSound();
    setGameState(prev => ({ ...prev, gameSpeed: speed }));
  };

  const resetGame = () => {
    playButtonSound();
    setGameState({
      day: 1,
      hour: 7,
      minute: 0,
      energy: 80,
      happiness: 70,
      health: 85,
      sleepQuality: 60,
      currentRoom: 'bedroom',
      isPlaying: false,
      gameSpeed: 1,
      completedActions: [],
      character: {
        name: 'Alex',
        mood: 'happy',
        activity: 'idle'
      },
      achievements: [],
      totalScore: 0
    });
  };

  const saveGame = () => {
    playButtonSound();
    localStorage.setItem('dream-story-save', JSON.stringify(gameState));
    // Mostrar feedback visual de salvamento
    const button = document.querySelector('.save-button');
    if (button) {
      button.classList.add('animate-pulse');
      setTimeout(() => button.classList.remove('animate-pulse'), 1000);
    }
  };

  const changeRoom = (room: GameState['currentRoom']) => {
    playNavigationSound();
    setGameState(prev => ({ ...prev, currentRoom: room }));
  };

  const rooms: GameState['currentRoom'][] = ['bedroom', 'living', 'kitchen', 'gym', 'bathroom'];
  const currentRoomIndex = rooms.indexOf(gameState.currentRoom);
  
  const goToPreviousRoom = () => {
    const previousIndex = currentRoomIndex === 0 ? rooms.length - 1 : currentRoomIndex - 1;
    changeRoom(rooms[previousIndex]);
  };
  
  const goToNextRoom = () => {
    const nextIndex = currentRoomIndex === rooms.length - 1 ? 0 : currentRoomIndex + 1;
    changeRoom(rooms[nextIndex]);
  };

  const getRoomName = (room: GameState['currentRoom']): string => {
    const roomNames = {
      bedroom: 'Quarto',
      living: 'Sala',
      kitchen: 'Cozinha',
      gym: 'Academia',
      bathroom: 'Banheiro'
    };
    return roomNames[room];
  };

  const performAction = (action: string, object: string) => {
    playConsequenceSound('success');
    
    setGameState(prev => {
      let energyChange = 0;
      let socialChange = 0;
      let healthChange = 0;
      let productivityChange = 0;
      let newMood = prev.character.mood;
      let newActivity = prev.character.activity;
      let newAchievements = [...prev.achievements];
      let scoreIncrease = 10;

      // Definir efeitos baseados na ação
      switch (action) {
        case 'sleep':
          energyChange = 30;
          healthChange = 10;
          productivityChange = 25; // Dormir bem melhora muito a produtividade
          newMood = 'relaxed';
          newActivity = 'sleep';
          scoreIncrease = 20;
          break;
        case 'eat':
          energyChange = 15;
          socialChange = 5; // Comer pode ter um pequeno efeito social
          productivityChange = 10; // Alimentar-se bem melhora produtividade
          newMood = 'happy';
          newActivity = 'eat';
          break;
        case 'exercise':
          energyChange = -10;
          healthChange = 20;
          socialChange = 10; // Exercitar-se pode melhorar confiança social
          productivityChange = 15; // Exercício melhora foco e produtividade
          newMood = 'energetic';
          newActivity = 'exercise';
          scoreIncrease = 25;
          break;
        case 'relax':
          socialChange = 15; // Relaxar pode melhorar disposição social
          productivityChange = -5; // Relaxar demais pode diminuir produtividade
          newMood = 'relaxed';
          newActivity = 'relax';
          break;
        case 'drinkWater':
          healthChange = 5;
          energyChange = 5;
          productivityChange = 5; // Hidratação melhora concentração
          newActivity = 'drinkWater';
          break;
        case 'shower':
          socialChange = 15; // Tomar banho melhora apresentação social
          healthChange = 5;
          productivityChange = 10; // Higiene pessoal melhora disposição para trabalhar
          newMood = 'happy';
          newActivity = 'shower';
          break;
      }

      // Verificar conquistas
      const actionKey = `${action}-${object}`;
      if (!prev.completedActions.includes(actionKey)) {
        if (prev.completedActions.length === 0) {
          newAchievements.push('Primeira Ação');
        }
        if (prev.completedActions.filter(a => a.startsWith('exercise')).length === 2) {
          newAchievements.push('Atleta Iniciante');
        }
      }

      return {
        social: 70,
        energy: Math.max(0, Math.min(100, prev.energy + energyChange)),
        social: Math.max(0, Math.min(100, prev.social + socialChange)),
        health: Math.max(0, Math.min(100, prev.health + healthChange)),
        productivity: Math.max(0, Math.min(100, prev.productivity + productivityChange)),
        completedActions: prev.completedActions.includes(actionKey) 
          ? prev.completedActions 
          : [...prev.completedActions, actionKey],
        character: {
          ...prev.character,
          mood: newMood,
          activity: newActivity
        },
        achievements: newAchievements,
        totalScore: prev.totalScore + scoreIncrease
      };
    });

    // Resetar atividade após um tempo
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        character: { ...prev.character, activity: 'idle' }
      }));
    }, 3000);
  };

  const handleWelcomeStart = () => {
    playButtonSound();
    setShowWelcome(false);
    setGameState(prev => ({ ...prev, isPlaying: true }));
  };

  // Função para obter o dia da semana
  const getDayOfWeek = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[(day - 1) % 7];
  };
  // Tela de Boas-vindas
  if (showWelcome) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
      }`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-2xl p-8 border shadow-2xl transition-colors duration-300 ${
            isDark 
              ? 'bg-slate-900/95 border-slate-700' 
              : 'bg-white/95 border-emerald-200/50 shadow-emerald-500/10'
          }`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="w-10 h-10 text-purple-400" />
              </div>
              
              <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-emerald-900'
              }`}>
                🌙 Bem-vindo ao Dream Story!
              </h2>
              
              <p className={`text-sm mb-6 leading-relaxed transition-colors duration-300 ${
                isDark ? 'text-slate-300' : 'text-emerald-700'
              }`}>
                Ajude Alex a criar uma rotina de sono saudável! Tome as melhores decisões e cuide do bem-estar dele através de ações diárias inteligentes.
              </p>

              <div className={`text-center mb-6 transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-emerald-600'
              }`}>
                <p className="text-sm font-medium">✨ Boa sorte em sua jornada! ✨</p>
                <p className="text-xs mt-1">Faça escolhas inteligentes e divirta-se!</p>
              </div>
              
              <button
                onClick={handleWelcomeStart}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Gamepad2 className="w-5 h-5" />
                Vamos lá!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b-2 transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800' 
          : 'bg-white/95 border-emerald-200/50'
      }`}>
        <div className="px-4 py-2">
          {/* Primeira linha: Foto, Nome, Humor, Horário, Dia, Play/Pause, Mute, Save, Reset */}
          <div className="flex items-center justify-between mb-2">
            {/* Lado esquerdo: Foto de perfil + Nome + Humor */}
            <div className="flex items-center gap-2">
              {/* Foto de perfil do Alex */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-2 border-emerald-400/30 shadow-md">
                <span className="text-lg">👨‍💼</span>
              </div>
              
              {/* Nome Alex */}
              <span className={`text-xs font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-emerald-900'
              }`}>
                Alex
              </span>
              
              {/* Stat de humor */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors duration-300 ${
                isDark 
                  ? 'bg-slate-800/50 text-white' 
                  : 'bg-emerald-100/80 text-emerald-900'
              }`}>
                <span className="text-xs">
                  {gameState.character.mood === 'happy' && '😊'}
                  {gameState.character.mood === 'tired' && '😴'}
                  {gameState.character.mood === 'energetic' && '⚡'}
                  {gameState.character.mood === 'relaxed' && '😌'}
                  {gameState.character.mood === 'stressed' && '😰'}
                </span>
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-emerald-900'
                }`}>
                  {gameState.character.mood === 'happy' && 'Feliz'}
                  {gameState.character.mood === 'tired' && 'Cansado'}
                  {gameState.character.mood === 'energetic' && 'Energético'}
                  {gameState.character.mood === 'relaxed' && 'Relaxado'}
                  {gameState.character.mood === 'stressed' && 'Estressado'}
                </span>
              </div>
            </div>
            
            {/* Lado direito: Controles */}
            <div className="flex items-center gap-2">
              {/* Botão Play/Pause */}
              <button
                onClick={togglePlayPause}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                  gameState.isPlaying 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-gray-500/20 text-gray-400'
                } ${
                  isDark 
                    ? 'hover:bg-slate-800' 
                    : 'hover:bg-emerald-100'
                }`}
              >
                {gameState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              {/* Botão Mute */}
              <button
                onClick={toggleMute}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                  audioSettings.isMuted 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-blue-500/20 text-blue-400'
                } ${
                  isDark 
                    ? 'hover:bg-slate-800' 
                    : 'hover:bg-emerald-100'
                }`}
              >
                {audioSettings.isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              
              {/* Botão Save */}
              <button
                onClick={saveGame}
                className={`save-button p-2 rounded-full transition-all duration-200 hover:scale-110 bg-green-500/20 text-green-400 ${
                  isDark 
                    ? 'hover:bg-slate-800' 
                    : 'hover:bg-emerald-100'
                }`}
              >
                <Save className="w-4 h-4" />
              </button>
              
              {/* Botão Reset */}
              <button
                onClick={resetGame}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 bg-red-500/20 text-red-400 ${
                  isDark 
                    ? 'hover:bg-slate-800' 
                    : 'hover:bg-emerald-100'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Segunda linha: Horário, Dia da semana, Pontuação, Velocidade do tempo, Botão voltar */}
          <div className="flex items-center justify-between">
            {/* Lado esquerdo: Horário e Dia da semana */}
            <div className="flex items-center gap-2">
              {/* Horário do tempo do jogo */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors duration-300 ${
                isDark 
                  ? 'bg-slate-800/50 text-white' 
                  : 'bg-emerald-100/80 text-emerald-900'
              }`}>
                <Clock className="w-3 h-3 text-emerald-400" />
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-emerald-900'
                }`}>
                  {formatGameTime(gameState.hour, gameState.minute)}
                </span>
              </div>
              
              {/* Dia da semana */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors duration-300 ${
                isDark 
                  ? 'bg-slate-800/50 text-white' 
                  : 'bg-emerald-100/80 text-emerald-900'
              }`}>
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-emerald-900'
                }`}>
                  {getDayOfWeek(gameState.day)}
                </span>
              </div>
            </div>
            
            {/* Centro: Pontuação geral total */}
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors duration-300 ${
              isDark 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-emerald-500/20 text-emerald-600'
            }`}>
              <Trophy className="w-3 h-3 text-emerald-400" />
              <span className={`text-xs font-bold transition-colors duration-300 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {gameState.totalScore} pts
              </span>
            </div>
            
            {/* Lado direito: Controles de velocidade + Botão voltar */}
            <div className="flex items-center gap-2">
              {/* Controles de velocidade */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeGameSpeed(1)}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                    gameState.gameSpeed === 1
                      ? 'bg-emerald-500 text-white shadow-md'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
                  }`}
                >
                  1x
                </button>
                <button
                  onClick={() => changeGameSpeed(2)}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                    gameState.gameSpeed === 2
                      ? 'bg-emerald-500 text-white shadow-md'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
                  }`}
                >
                  2x
                </button>
                <button
                  onClick={() => changeGameSpeed(4)}
                  className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                    gameState.gameSpeed === 4
                      ? 'bg-emerald-500 text-white shadow-md'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
                  }`}
                >
                  4x
                </button>
              </div>
              
              {/* Botão de voltar */}
              <button
                onClick={onBack}
                className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                  isDark 
                    ? 'hover:bg-slate-800 text-white' 
                    : 'hover:bg-emerald-100 text-emerald-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Game Area */}
      <div className="relative h-[60vh] overflow-hidden pixel-game-container">
        {/* Room Name - Top Center */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className={`px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300 shadow-lg ${
            isDark 
              ? 'bg-slate-900/90 border-slate-700 text-white' 
              : 'bg-white/95 border-emerald-300/60 text-emerald-900 shadow-emerald-500/10'
          }`}>
            <span className="text-lg font-bold">{getRoomName(gameState.currentRoom)}</span>
          </div>
        </div>

        {/* Left Arrow - Previous Room */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30">
          <button
            onClick={goToPreviousRoom}
            className={`p-3 rounded-full backdrop-blur-sm border-2 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg ${
              isDark 
                ? 'bg-slate-800/80 border-slate-600 hover:bg-slate-700/90 text-white hover:border-slate-500' 
                : 'bg-white/90 border-emerald-300 hover:bg-emerald-50/90 text-emerald-700 hover:border-emerald-400'
            }`}
            title="Cômodo anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Right Arrow - Next Room */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30">
          <button
            onClick={goToNextRoom}
            className={`p-3 rounded-full backdrop-blur-sm border-2 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg ${
              isDark 
                ? 'bg-slate-800/80 border-slate-600 hover:bg-slate-700/90 text-white hover:border-slate-500' 
                : 'bg-white/90 border-emerald-300 hover:bg-emerald-50/90 text-emerald-700 hover:border-emerald-400'
            }`}
            title="Próximo cômodo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className={`pixel-room room-${gameState.currentRoom} h-full relative`}>
            <button
              onClick={onBack}
              className={`absolute left-0 p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                isDark 
                  ? 'hover:bg-slate-800 text-white' 
                  : 'hover:bg-emerald-100 text-emerald-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Título centralizado */}
            <h1 className={`text-lg font-bold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>
              Dream Story
            </h1>
          </div>
        </div>
      </header>


      {/* Stats Bar */}
      <div className={`px-4 py-3 border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/50 border-slate-800' 
          : 'bg-emerald-50/50 border-emerald-200/50'
      }`}>
        <div className="grid grid-cols-4 gap-1">
          {/* Energy */}
          <div className="text-center">
            <div className={`text-[13px] font-medium mb-0.5 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>⚡ Energia</div>
            <div className={`rounded-full h-1 transition-colors duration-300 ${
              isDark ? 'bg-slate-800' : 'bg-emerald-200/50'
            }`}>
              <div
                className="bg-yellow-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${gameState.energy}%` }}
              />
            </div>
            <div className={`text-[15px] mt-0.5 transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-emerald-700'
            }`}>{Math.round(gameState.energy)}%</div>
          </div>

          {/* Social */}
          <div className="text-center">
            <div className={`text-[13px] font-medium mb-0.5 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>👥 Social</div>
            <div className={`rounded-full h-1 transition-colors duration-300 ${
              isDark ? 'bg-slate-800' : 'bg-emerald-200/50'
            }`}>
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${gameState.social}%` }}
              />
            </div>
            <div className={`text-[15px] mt-0.5 transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-emerald-700'
            }`}>{Math.round(gameState.social)}%</div>
          </div>

          {/* Health */}
          <div className="text-center">
            <div className={`text-[13px] font-medium mb-0.5 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>❤️ Saúde</div>
            <div className={`rounded-full h-1 transition-colors duration-300 ${
              isDark ? 'bg-slate-800' : 'bg-emerald-200/50'
            }`}>
              <div
                className="bg-red-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${gameState.health}%` }}
              />
            </div>
            <div className={`text-[15px] mt-0.5 transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-emerald-700'
            }`}>{Math.round(gameState.health)}%</div>
          </div>

          {/* Productivity */}
          <div className="text-center">
            <div className={`text-[13px] font-medium mb-0.5 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>📈 Produção</div>
            <div className={`rounded-full h-1 transition-colors duration-300 ${
              isDark ? 'bg-slate-800' : 'bg-emerald-200/50'
            }`}>
              <div
                className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${gameState.productivity}%` }}
              />
            </div>
            <div className={`text-[15px] mt-0.5 transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-emerald-700'
            }`}>{Math.round(gameState.productivity)}%</div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative h-[75vh] overflow-hidden pixel-game-container">
        {/* Room Name - Top Center */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className={`px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300 shadow-lg ${
            isDark 
              ? 'bg-slate-900/90 border-slate-700 text-white' 
              : 'bg-white/95 border-emerald-300/60 text-emerald-900 shadow-emerald-500/10'
          }`}>
            <span className="text-lg font-bold">{getRoomName(gameState.currentRoom)}</span>
          </div>
        </div>

        {/* Left Arrow - Previous Room */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30">
          <button
            onClick={goToPreviousRoom}
            className={`p-3 rounded-full backdrop-blur-sm border-2 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg ${
              isDark 
                ? 'bg-slate-800/80 border-slate-600 hover:bg-slate-700/90 text-white hover:border-slate-500' 
                : 'bg-white/90 border-emerald-300 hover:bg-emerald-50/90 text-emerald-700 hover:border-emerald-400'
            }`}
            title="Cômodo anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Right Arrow - Next Room */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30">
          <button
            onClick={goToNextRoom}
            className={`p-3 rounded-full backdrop-blur-sm border-2 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg ${
              isDark 
                ? 'bg-slate-800/80 border-slate-600 hover:bg-slate-700/90 text-white hover:border-slate-500' 
                : 'bg-white/90 border-emerald-300 hover:bg-emerald-50/90 text-emerald-700 hover:border-emerald-400'
            }`}
            title="Próximo cômodo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className={`pixel-room room-${gameState.currentRoom} h-full relative`}>
          {/* Room Background */}
            <button
              onClick={onBack}
              className={`absolute left-0 p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                isDark 
                  ? 'hover:bg-slate-800 text-white' 
                  : 'hover:bg-emerald-100 text-emerald-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Título centralizado */}
            <h1 className={`text-lg font-bold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>
              Dream Story
            </h1>
          </div>
        </div>
      </header>

      {/* Game Area */}
      <div className="relative h-[60vh] overflow-hidden pixel-game-container">
    </div>
  );
};

export default MobileGameInterface;