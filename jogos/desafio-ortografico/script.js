// Configuração do jogo
const FALLBACK_WORDS = {
    easy: [
        {
            word: "abrupto",
            phonetic: "/aˈbɾup.tu/",
            options: ["abrupto", "avrupto", "abruptu", "abrupta"],
            correct: 0,
            explanation: "A grafia correta é 'abrupto' (com 'b').",
            hint: "Palavras com 'b' antes de 'r' geralmente mantêm o 'b' (ex: abrir, abraço)."
        },
        {
            word: "advogado",
            phonetic: "/ad.voˈɡa.du/",
            options: ["advogado", "avogado", "adivogado", "advogadu"],
            correct: 0,
            explanation: "A grafia correta é 'advogado' (com 'd').",
            hint: "Palavras com prefixo 'ad-' mantêm o 'd' antes de consoantes (ex: adjetivo, advérbio)."
        }
    ],
    medium: [
        {
            word: "exceção",
            phonetic: "/e.seˈsɐ̃w̃/",
            options: ["exceção", "esseção", "eceção", "excessão"],
            correct: 0,
            explanation: "A grafia correta é 'exceção' (com 'x' e 'ç').",
            hint: "Palavras com prefixo 'ex-' seguido de 'c' mantêm o 'x' (ex: excesso, exceto)."
        },
        {
            word: "obscuro",
            phonetic: "/obsˈku.ɾu/",
            options: ["obscuro", "oscuro", "obscuru", "obscuro"],
            correct: 0,
            explanation: "A grafia correta é 'obscuro' (com 'b').",
            hint: "Palavras com 'b' antes de 'sc' mantêm o 'b' (ex: obsceno, obscuridade)."
        }
    ],
    hard: [
        {
            word: "pneumonia",
            phonetic: "/pnew.mo.ˈni.a/",
            options: ["pneumonia", "neumonia", "pneumônia", "pneumonia"],
            correct: 0,
            explanation: "A grafia correta é 'pneumonia' (com 'pn' mudo no início).",
            hint: "Palavras de origem grega com 'pn' no início mantêm essa grafia (ex: pneumático, pneu)."
        },
        {
            word: "psicólogo",
            phonetic: "/psi.ˈkɔ.lo.gu/",
            options: ["psicólogo", "sicólogo", "psicológo", "psicologo"],
            correct: 0,
            explanation: "A grafia correta é 'psicólogo' (com 'ps' mudo no início).",
            hint: "Palavras de origem grega com 'ps' no início mantêm essa grafia (ex: psiquiatra, pseudônimo)."
        }
    ]
};

// Estado do jogo
const gameState = {
    words: { ...FALLBACK_WORDS },
    currentWord: null,
    currentQuestionIndex: 0,
    score: 0,
    timeLeft: 60,
    timer: null,
    isActive: true,
    totalQuestions: 10,
    currentDifficulty: 'easy',
    difficultySettings: {
        easy: {
            name: "Fácil",
            time: 60,
            rules: "Regras básicas (b/v, s/z, c/ç)",
            color: "var(--easy)"
        },
        medium: {
            name: "Médio",
            time: 45,
            rules: "Regras intermediárias (x/ch, ss/s, g/j)",
            color: "var(--medium)"
        },
        hard: {
            name: "Difícil",
            time: 30,
            rules: "Regras avançadas (pn, ps, mn, etc)",
            color: "var(--hard)"
        }
    },
    stats: loadStats(),
    soundEnabled: true
};

// Elementos DOM
const DOM = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    startButton: document.getElementById('start-button'),
    difficultySelector: document.getElementById('difficulty-selector'),
    difficultyButtons: document.querySelectorAll('.difficulty-btn'),
    word: document.getElementById('word'),
    phonetic: document.getElementById('phonetic'),
    options: document.getElementById('options'),
    timer: document.getElementById('timer'),
    timerText: document.querySelector('#timer span'),
    score: document.querySelector('#score span'),
    questionCounter: document.querySelector('#question-counter span'),
    feedback: document.getElementById('feedback'),
    animationContainer: document.getElementById('animation-container'),
    backButton: document.getElementById('back-to-menu'),
    backToMainButton: document.getElementById('back-to-main'),
    difficultyIndicator: document.getElementById('difficulty-indicator'),
    timePerQuestion: document.getElementById('time-per-question'),
    currentLevel: document.getElementById('current-level'),
    currentRules: document.getElementById('current-rules'),
    gameContainer: document.getElementById('game-container'),
    hintButton: document.getElementById('hint-button'),
    hintContent: document.getElementById('hint-content')
};

// Função para carregar estatísticas do localStorage
function loadStats() {
    const savedStats = localStorage.getItem('orthographyGameStats');
    if (savedStats) {
        return JSON.parse(savedStats);
    }
    return {
        totalGames: 0,
        totalScore: 0,
        bestScore: 0,
        byDifficulty: {
            easy: { games: 0, best: 0, total: 0 },
            medium: { games: 0, best: 0, total: 0 },
            hard: { games: 0, best: 0, total: 0 }
        }
    };
}

// Função para salvar estatísticas no localStorage
function saveStats() {
    localStorage.setItem('orthographyGameStats', JSON.stringify(gameState.stats));
}

// Função para atualizar estatísticas ao final do jogo
function updateStats(finalScore) {
    const stats = gameState.stats;
    const difficulty = gameState.currentDifficulty;
    
    stats.totalGames += 1;
    stats.totalScore += finalScore;
    if (finalScore > stats.bestScore) {
        stats.bestScore = finalScore;
    }
    
    stats.byDifficulty[difficulty].games += 1;
    stats.byDifficulty[difficulty].total += finalScore;
    if (finalScore > stats.byDifficulty[difficulty].best) {
        stats.byDifficulty[difficulty].best = finalScore;
    }
    
    saveStats();
}

// Função para mostrar estatísticas na tela final
function displayStats() {
    const stats = gameState.stats;
    const difficulty = gameState.currentDifficulty;
    const difficultyStats = stats.byDifficulty[difficulty];
    
    const averageScore = stats.totalGames > 0 ? Math.round(stats.totalScore / stats.totalGames) : 0;
    const difficultyAverage = difficultyStats.games > 0 ? Math.round(difficultyStats.total / difficultyStats.games) : 0;
    
    return `
        <div class="stats-container">
            <h3>Estatísticas</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-trophy"></i>
                    <p>Melhor Pontuação: <strong>${stats.bestScore}</strong></p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-gamepad"></i>
                    <p>Jogos Totais: <strong>${stats.totalGames}</strong></p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-star"></i>
                    <p>Média Geral: <strong>${averageScore}</strong></p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-chart-line"></i>
                    <p>Melhor (${gameState.difficultySettings[difficulty].name}): <strong>${difficultyStats.best}</strong></p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-flag"></i>
                    <p>Jogos (${gameState.difficultySettings[difficulty].name}): <strong>${difficultyStats.games}</strong></p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calculator"></i>
                    <p>Média (${gameState.difficultySettings[difficulty].name}): <strong>${difficultyAverage}</strong></p>
                </div>
            </div>
        </div>
    `;
}

// Inicialização
function init() {
    // Configura os botões
    DOM.backButton.classList.add('hidden');
    DOM.backToMainButton.classList.remove('hidden');

    DOM.startButton.addEventListener('click', () => {
        startGame();
    });
    DOM.backButton.addEventListener('click', () => {
        returnToMenu();
    });
    DOM.backToMainButton.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    // Configuração dos botões de dificuldade
    DOM.difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            setDifficulty(button.dataset.level);
        });
    });

    // Configura o botão de dica
    DOM.hintButton.addEventListener('click', () => {
        toggleHint();
    });

    // Define a dificuldade padrão
    setDifficulty('easy');
}

// Mostra/oculta a dica
function toggleHint() {
    if (!gameState.currentWord || !gameState.currentWord.hint) return;
    
    DOM.hintContent.textContent = gameState.currentWord.hint;
    DOM.hintContent.classList.toggle('hidden');
}

// Retorna ao menu do jogo
function returnToMenu() {
    if (gameState.isActive) {
        clearInterval(gameState.timer);
        gameState.isActive = false;

        DOM.gameScreen.style.animation = 'fadeOut 0.5s forwards';

        setTimeout(() => {
            DOM.gameScreen.style.display = 'none';
            DOM.startScreen.style.display = 'flex';
            DOM.startScreen.style.animation = 'fadeIn 0.5s forwards';
            resetGame();
            DOM.backToMainButton.classList.remove('hidden');
            DOM.backButton.classList.add('hidden');
        }, 500);
    } else {
        DOM.gameScreen.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => {
            DOM.gameScreen.style.display = 'none';
            DOM.startScreen.style.display = 'flex';
            DOM.startScreen.style.animation = 'fadeIn 0.5s forwards';
            resetGame();
        }, 500);
    }
}

// Configura a dificuldade do jogo
function setDifficulty(level) {
    gameState.currentDifficulty = level;
    const settings = gameState.difficultySettings[level];

    // Atualiza a interface
    DOM.difficultyButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.level === level);
    });

    DOM.timePerQuestion.textContent = `${settings.time}s`;
    DOM.currentLevel.textContent = settings.name;
    DOM.currentRules.textContent = settings.rules;

    gameState.timeLeft = settings.time;
}

// Fluxo do jogo
function startGame() {
    DOM.startScreen.style.animation = 'fadeOut 0.5s forwards';
    DOM.backButton.classList.remove('hidden');
    DOM.backToMainButton.classList.add('hidden');

    setTimeout(() => {
        DOM.startScreen.style.display = 'none';
        DOM.gameScreen.style.display = 'block';
        DOM.gameScreen.style.animation = 'fadeIn 0.5s forwards';
        resetGame();
        loadRandomWord();
    }, 500);
}

function resetGame() {
    gameState.score = 0;
    gameState.timeLeft = gameState.difficultySettings[gameState.currentDifficulty].time;
    gameState.isActive = true;
    gameState.currentQuestionIndex = 0;
    updateScore();
    updateTimerDisplay();
    clearFeedback();
    DOM.hintContent.classList.add('hidden');

    const settings = gameState.difficultySettings[gameState.currentDifficulty];
    DOM.difficultyIndicator.textContent = settings.name;
    DOM.difficultyIndicator.className = `game-difficulty ${gameState.currentDifficulty}`;
    DOM.difficultyIndicator.style.color = settings.color;
}

// Carregar palavra aleatória
async function loadRandomWord() {
    gameState.isActive = true;
    
    try {
        const response = await fetch('https://api.dicionario-aberto.net/random');
        if (!response.ok) throw new Error("Falha na requisição");
        
        const data = await response.json();
        if (!data.word) throw new Error("Palavra inválida da API");

        const options = generateOptions(data.word, gameState.currentDifficulty);
        const correctIndex = options.indexOf(data.word);
        const hint = generateHint(data.word, gameState.currentDifficulty);

        gameState.currentWord = {
            word: data.word,
            phonetic: data.phonetic || "",
            options: options,
            correct: correctIndex,
            explanation: `A grafia correta é '${data.word}'.`,
            hint: hint
        };
    } catch (error) {
        console.error("Erro ao buscar palavra:", error);
        const words = gameState.words[gameState.currentDifficulty];
        const randomIndex = Math.floor(Math.random() * words.length);
        gameState.currentWord = words[randomIndex];
    }

    displayWord();
    startTimer();
}

// Mostra a palavra atual na tela
function displayWord() {
    DOM.word.textContent = gameState.currentWord.word;
    DOM.phonetic.textContent = gameState.currentWord.phonetic || "";
    DOM.questionCounter.textContent = `${gameState.currentQuestionIndex + 1}/${gameState.totalQuestions}`;
    
    // Limpa opções anteriores
    DOM.options.innerHTML = '';
    
    // Adiciona novas opções
    gameState.currentWord.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = option;
        button.dataset.index = index;
        button.addEventListener('click', () => selectOption(index));
        DOM.options.appendChild(button);
    });
}

// Inicia o temporizador
function startTimer() {
    clearInterval(gameState.timer);
    updateTimerDisplay();
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            timeOut();
        }
    }, 1000);
}

// Atualiza a exibição do temporizador
function updateTimerDisplay() {
    DOM.timerText.textContent = `${gameState.timeLeft}s`;
    
    // Altera a cor conforme o tempo diminui
    DOM.timer.className = 'game-timer';
    if (gameState.timeLeft <= 15) {
        DOM.timer.classList.add('warning');
    }
    if (gameState.timeLeft <= 5) {
        DOM.timer.classList.remove('warning');
        DOM.timer.classList.add('critical');
    }
}

// Tempo esgotado
function timeOut() {
    gameState.isActive = false;
    DOM.feedback.textContent = "Tempo esgotado!";
    DOM.feedback.className = "feedback-card incorrect";
    
    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

// Seleciona uma opção
function selectOption(selectedIndex) {
    if (!gameState.isActive) return;
    gameState.isActive = false;
    clearInterval(gameState.timer);
    
    const isCorrect = selectedIndex === gameState.currentWord.correct;
    
    if (isCorrect) {
        gameState.score += Math.max(1, Math.floor(gameState.timeLeft / 5));
        updateScore();
        DOM.feedback.textContent = "Correto! " + gameState.currentWord.explanation;
        DOM.feedback.className = "feedback-card correct";
    } else {
        DOM.feedback.textContent = `Incorreto! ${gameState.currentWord.explanation}`;
        DOM.feedback.className = "feedback-card incorrect";
    }
    
    // Destaca a opção correta
    const options = DOM.options.querySelectorAll('.option');
    options[gameState.currentWord.correct].style.backgroundColor = "var(--correct)";
    
    if (!isCorrect) {
        options[selectedIndex].style.backgroundColor = "var(--incorrect)";
    }
    
    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

// Atualiza a pontuação
function updateScore() {
    DOM.score.textContent = gameState.score;
}

// Limpa o feedback
function clearFeedback() {
    DOM.feedback.textContent = "";
    DOM.feedback.className = "feedback-card";
}

// Próxima pergunta ou fim do jogo
function nextQuestion() {
    gameState.currentQuestionIndex++;
    
    if (gameState.currentQuestionIndex < gameState.totalQuestions) {
        loadRandomWord();
    } else {
        endGame();
    }
}

// Finaliza o jogo
function endGame() {
    updateStats(gameState.score);
    
    DOM.word.textContent = "Fim do Jogo!";
    DOM.phonetic.textContent = "";
    DOM.options.innerHTML = `
        <div class="feedback-card">
            <p>Sua pontuação final: <strong>${gameState.score}</strong></p>
            ${displayStats()}
        </div>
        <button class="restart" onclick="startGame()">
            <i class="fas fa-redo"></i> Jogar Novamente
        </button>
    `;
}

// Gera opções incorretas com base na palavra correta
function generateOptions(correctWord, difficulty) {
    const options = [correctWord];
    const commonErrors = getCommonErrors(correctWord, difficulty);
    
    // Adiciona erros comuns até ter 4 opções
    while (options.length < 4 && commonErrors.length > 0) {
        const error = commonErrors.shift();
        if (!options.includes(error)) {
            options.push(error);
        }
    }
    
    // Preenche com variações aleatórias se necessário
    while (options.length < 4) {
        const variation = generateVariation(correctWord, difficulty);
        if (!options.includes(variation)) {
            options.push(variation);
        }
    }
    
    // Embaralha as opções
    return shuffleArray(options);
}

// Gera dica com base na palavra e dificuldade
function generateHint(word, difficulty) {
    const hints = {
        easy: [
            "Palavras com 'b' antes de 'r' geralmente mantêm o 'b' (ex: abrir, abraço).",
            "Palavras com prefixo 'ad-' mantêm o 'd' antes de consoantes (ex: adjetivo, advérbio)."
        ],
        medium: [
            "Palavras com prefixo 'ex-' seguido de 'c' mantêm o 'x' (ex: excesso, exceto).",
            "Palavras com 'b' antes de 'sc' mantêm o 'b' (ex: obsceno, obscuridade)."
        ],
        hard: [
            "Palavras de origem grega com 'pn' no início mantêm essa grafia (ex: pneumático, pneu).",
            "Palavras de origem grega com 'ps' no início mantêm essa grafia (ex: psiquiatra, pseudônimo)."
        ]
    };
    
    return hints[difficulty][Math.floor(Math.random() * hints[difficulty].length)];
}

// Retorna erros comuns para a palavra
function getCommonErrors(word, difficulty) {
    const commonErrors = {
        easy: {
            "abrupto": ["avrupto", "abruptu", "abrupta"],
            "advogado": ["avogado", "adivogado", "advogadu"]
        },
        medium: {
            "exceção": ["esseção", "eceção", "excessão"],
            "obscuro": ["oscuro", "obscuru", "obscuro"]
        },
        hard: {
            "pneumonia": ["neumonia", "pneumônia", "pneumonia"],
            "psicólogo": ["sicólogo", "psicológo", "psicologo"]
        }
    };
    
    return commonErrors[difficulty][word] || [];
}

// Gera variações ortográficas incorretas
function generateVariation(word, difficulty) {
    const variations = {
        easy: [
            word.replace(/b/g, 'v'),
            word.replace(/v/g, 'b'),
            word.replace(/s/g, 'z'),
            word.replace(/z/g, 's'),
            word.replace(/ç/g, 'c'),
            word.replace(/c/g, 'ç')
        ],
        medium: [
            word.replace(/x/g, 'ch'),
            word.replace(/ch/g, 'x'),
            word.replace(/ss/g, 's'),
            word.replace(/s/g, 'ss'),
            word.replace(/g/g, 'j'),
            word.replace(/j/g, 'g')
        ],
        hard: [
            word.replace(/pn/g, 'n'),
            word.replace(/ps/g, 's'),
            word.replace(/mn/g, 'n'),
            word.replace(/bt/g, 't'),
            word.replace(/gm/g, 'm')
        ]
    };
    
    const possibleVariations = variations[difficulty]
        .filter(v => v !== word) // Remove a palavra correta
        .filter(v => v.length === word.length); // Mantém apenas variações com mesmo tamanho
    
    return possibleVariations.length > 0 
        ? possibleVariations[Math.floor(Math.random() * possibleVariations.length)]
        : word + "x"; // Fallback simples se não encontrar variação
}

// Embaralha um array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Inicia o jogo
init();