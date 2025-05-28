document.addEventListener('DOMContentLoaded', function () {
    // Configuração do jogo
    const FALLBACK_WORDS = {
        easy: [
            {
                word: "abrupto",
                phonetic: "/aˈbɾup.tu/",
                options: ["abrupto", "abrupto", "abrupto", "abrupto"],
                correct: 0,
                explanation: "A grafia correta é 'abrupto' (com 'b')."
            },
            {
                word: "advogado",
                phonetic: "/ad.voˈɡa.du/",
                options: ["advogado", "advogado", "advogado", "advogado"],
                correct: 1,
                explanation: "A grafia correta é 'advogado' (com 'd')."
            }
        ],
        medium: [
            {
                word: "exceção",
                phonetic: "/e.seˈsɐ̃w̃/",
                options: ["exceção", "exceção", "exceção", "exceção"],
                correct: 2,
                explanation: "A grafia correta é 'exceção' (com 'x' e 'ç')."
            },
            {
                word: "obscuro",
                phonetic: "/obsˈku.ɾu/",
                options: ["obscuro", "obscuro", "obscuro", "obscuro"],
                correct: 3,
                explanation: "A grafia correta é 'obscuro' (com 'b')."
            }
        ],
        hard: [
            {
                word: "pneumonia",
                phonetic: "/pnew.mo.ˈni.a/",
                options: ["pneumonia", "pneumonia", "pneumonia", "pneumonia"],
                correct: 0,
                explanation: "A grafia correta é 'pneumonia' (com 'pn' mudo no início)."
            },
            {
                word: "psicólogo",
                phonetic: "/psi.ˈkɔ.lo.gu/",
                options: ["psicólogo", "psicólogo", "psicólogo", "psicólogo"],
                correct: 1,
                explanation: "A grafia correta é 'psicólogo' (com 'ps' mudo no início)."
            }
        ]
    };

    // Estado do jogo
    const gameState = {
        words: { ...FALLBACK_WORDS },
        currentWord: null,
        currentQuestionIndex: 0,
        score: 0,
        timeLeft: 30,
        timer: null,
        isActive: false,
        totalQuestions: 5,
        currentDifficulty: 'easy',
        difficultySettings: {
            easy: {
                name: "Fácil",
                time: 30,
                rules: "Regras básicas (b/v, s/z, c/ç)",
                color: "var(--easy)"
            },
            medium: {
                name: "Médio",
                time: 25,
                rules: "Regras intermediárias (x/ch, ss/s, g/j)",
                color: "var(--medium)"
            },
            hard: {
                name: "Difícil",
                time: 20,
                rules: "Regras avançadas (pn, ps, mn, etc)",
                color: "var(--hard)"
            }
        }
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
        gameContainer: document.getElementById('game-container')
    };

    // Inicialização
    function init() {
        // Configura os botões
        DOM.backButton.classList.add('hidden');
        DOM.backToMainButton.classList.remove('hidden');

        DOM.startButton.addEventListener('click', startGame);
        DOM.backButton.addEventListener('click', returnToMenu);
        DOM.backToMainButton.addEventListener('click', () => {
            window.location.href = '../../index.html';
        });

        // Configuração dos botões de dificuldade
        DOM.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                setDifficulty(button.dataset.level);
            });
        });

        // Define a dificuldade padrão
        setDifficulty('easy');
    }

    // Retorna ao menu do jogo
    function returnToMenu() {
        if (gameState.isActive) {
            // Se estiver no meio do jogo, volta para o menu principal
            clearInterval(gameState.timer);
            gameState.isActive = false;

            DOM.gameScreen.style.animation = 'fadeOut 0.5s forwards';

            setTimeout(() => {
                DOM.gameScreen.style.display = 'none';
                DOM.startScreen.style.display = 'flex';
                DOM.startScreen.style.animation = 'fadeIn 0.5s forwards';
                resetGame();
                // Mostra o botão de voltar para o menu principal
                DOM.backToMainButton.classList.remove('hidden');
                // Esconde o botão de voltar normal
                DOM.backButton.classList.add('hidden');
            }, 500);
        } else {
            // Se estiver na tela de resultados, reinicia o jogo
            DOM.gameScreen.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => {
                DOM.gameScreen.style.display = 'none';
                DOM.gameScreen.style.display = 'block';
                DOM.gameScreen.style.animation = 'fadeIn 0.5s forwards';
                resetGame();
                loadRandomWord();
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

        // Atualiza o tempo padrão
        gameState.timeLeft = settings.time;
    }

    // Fluxo do jogo
    function startGame() {
        DOM.startScreen.style.animation = 'fadeOut 0.5s forwards';
        // Mostra o botão de voltar normal e esconde o de menu principal
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

        // Atualiza o indicador de dificuldade
        const settings = gameState.difficultySettings[gameState.currentDifficulty];
        DOM.difficultyIndicator.textContent = settings.name;
        DOM.difficultyIndicator.className = `game-difficulty ${gameState.currentDifficulty}`;
        DOM.difficultyIndicator.style.color = settings.color;
    }

    // Carregar palavra aleatória
    async function loadRandomWord() {
        try {
            // Tenta buscar da API
            const response = await fetch('https://api.dicionario-aberto.net/random');
            const data = await response.json();

            if (!data.word) throw new Error("Palavra inválida da API");

            const options = generateOptions(data.word, gameState.currentDifficulty);
            const correctIndex = options.indexOf(data.word);

            gameState.currentWord = {
                word: data.word,
                phonetic: data.phonetic || "",
                options: options,
                correct: correctIndex,
                explanation: `A grafia correta é '${data.word}'.`
            };
        } catch (error) {
            console.error("Erro ao buscar palavra:", error);
            // Usar fallback se a API falhar
            const words = gameState.words[gameState.currentDifficulty];
            const randomIndex = Math.floor(Math.random() * words.length);
            gameState.currentWord = words[randomIndex];
        }

        displayWord();
        startTimer();
    }

    function generateOptions(correctWord, difficulty) {
        // Gera variações ortográficas incorretas baseadas na dificuldade
        let variations = [];

        // Regras para cada nível de dificuldade
        const rules = {
            easy: [
                () => correctWord.replace(/b/g, 'v').replace(/v/g, 'b'),
                () => correctWord.replace(/s/g, 'z').replace(/z/g, 's'),
                () => correctWord.replace(/c([ei])/g, 's$1').replace(/s([ei])/g, 'c$1'),
                () => correctWord.replace(/ç/g, 'c').replace(/c([aou])/g, 'ç$1')
            ],
            medium: [
                () => correctWord.replace(/x/g, 'ch').replace(/ch/g, 'x'),
                () => correctWord.replace(/ss/g, 's').replace(/s([aou])/g, 'ss$1'),
                () => correctWord.replace(/g([ei])/g, 'j$1').replace(/j([ei])/g, 'g$1'),
                () => correctWord.replace(/ão/g, 'am').replace(/ões/g, 'ons')
            ],
            hard: [
                () => correctWord.replace(/mn/g, 'n').replace(/n([^aeiou])/g, 'mn$1'),
                () => correctWord.replace(/ps/g, 's').replace(/s([^aeiou])/g, 'ps$1'),
                () => correctWord.replace(/pn/g, 'n').replace(/n([^aeiou])/g, 'pn$1'),
                () => correctWord.replace(/tm/g, 'm').replace(/m([^aeiou])/g, 'tm$1'),
                () => correctWord.replace(/bt/g, 't').replace(/t([^aeiou])/g, 'bt$1')
            ]
        };

        // Aplica as regras de acordo com a dificuldade
        rules[difficulty].forEach(rule => {
            const variation = rule();
            if (variation !== correctWord) {
                variations.push(variation);
            }
        });

        // Remove duplicatas
        variations = [...new Set(variations)];

        // Completa com variações extras se necessário
        while (variations.length < 3) {
            const randomSuffix = ['x', 's', 'z', 'ão', 'ês'][Math.floor(Math.random() * 5)];
            variations.push(correctWord + randomSuffix);
        }

        // Seleciona até 3 variações diferentes
        const selectedVariations = variations.slice(0, 3);

        // Mistura as opções e inclui a correta
        const finalOptions = [...selectedVariations, correctWord];
        return shuffleArray(finalOptions);
    }

    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Temporizador
    function startTimer() {
        clearInterval(gameState.timer);
        gameState.timeLeft = gameState.difficultySettings[gameState.currentDifficulty].time;
        updateTimerDisplay();

        gameState.timer = setInterval(() => {
            gameState.timeLeft--;
            updateTimerDisplay();

            if (gameState.timeLeft <= 0) {
                handleTimeOut();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        DOM.timerText.textContent = `${gameState.timeLeft}s`;
        DOM.timer.classList.toggle('warning', gameState.timeLeft <= 10);
    }

    function handleTimeOut() {
        clearInterval(gameState.timer);
        showFeedback("⏰ Tempo esgotado! Vamos para a próxima palavra.", 'incorrect');
        prepareNextQuestion();
    }

    // Exibir palavra e opções
    function displayWord() {
        DOM.word.textContent = gameState.currentWord.word;
        DOM.phonetic.textContent = gameState.currentWord.phonetic;
        DOM.word.style.animation = 'fadeIn 0.5s';
        updateQuestionCounter();
        createOptions();
    }

    function createOptions() {
        DOM.options.innerHTML = '';

        gameState.currentWord.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            button.addEventListener('click', () =>
                handleAnswer(index === gameState.currentWord.correct, gameState.currentWord.explanation)
            );
            DOM.options.appendChild(button);
        });
    }

    // Manipulação de respostas
    function handleAnswer(isCorrect, explanation) {
        if (!gameState.isActive) return;

        clearInterval(gameState.timer);

        if (isCorrect) {
            gameState.score++;
            updateScore();
            showFeedback(`✅ Correto! ${explanation}`, 'correct');
            createAnimation('🎉', '#4CAF50');
        } else {
            showFeedback(`❌ Incorreto! ${explanation}`, 'incorrect');
            createAnimation('💥', '#f44336');
        }

        prepareNextQuestion();
    }

    function prepareNextQuestion() {
        setTimeout(() => {
            gameState.currentQuestionIndex++;
            updateTimerDisplay();

            if (gameState.currentQuestionIndex < gameState.totalQuestions) {
                loadRandomWord();
            } else {
                endGame();
            }
        }, 2000);
    }

    // Feedback e animações
    function createAnimation(emoji, color) {
        const anim = document.createElement('div');
        anim.className = 'emoji-animation';
        anim.textContent = emoji;
        anim.style.color = color;
        anim.style.left = `${Math.random() * 70 + 15}%`;
        DOM.animationContainer.appendChild(anim);

        setTimeout(() => anim.remove(), 1000);
    }

    function showFeedback(message, type) {
        DOM.feedback.textContent = message;
        DOM.feedback.className = `feedback-card ${type}`;
    }

    function clearFeedback() {
        DOM.feedback.textContent = '';
        DOM.feedback.className = 'feedback-card';
    }

    // Finalização do jogo
    function endGame() {
        gameState.isActive = false;
        clearInterval(gameState.timer);
        showFinalResults();
    }

    function showFinalResults() {
        gameState.isActive = false;
        DOM.word.textContent = `Fim do jogo!`;
        DOM.phonetic.textContent = '';
        DOM.options.innerHTML = '';

        const percentage = (gameState.score / gameState.totalQuestions) * 100;
        let message, className;

        if (percentage >= 90) {
            message = '🎉 Excelente! Você domina a ortografia!';
            className = 'correct';
        } else if (percentage >= 60) {
            message = '👍 Bom trabalho! Continue praticando!';
            className = 'correct';
        } else {
            message = '📚 Estude mais as regras ortográficas!';
            className = 'incorrect';
        }

        showFeedback(message, className);
        createRestartButton();
    }

    function createRestartButton() {
        DOM.options.innerHTML = ''; // Limpa opções anteriores

        const restartButton = document.createElement('button');
        restartButton.className = 'restart';
        restartButton.textContent = 'Jogar Novamente';
        restartButton.addEventListener('click', () => {
            resetGame();
            loadRandomWord();
        });

        const menuButton = document.createElement('button');
        menuButton.className = 'restart';
        menuButton.textContent = 'Voltar ao Menu';
        menuButton.addEventListener('click', () => {
            DOM.gameScreen.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => {
                DOM.gameScreen.style.display = 'none';
                DOM.startScreen.style.display = 'flex';
                DOM.startScreen.style.animation = 'fadeIn 0.5s forwards';
                // Mostra o botão de voltar para o menu principal
                DOM.backToMainButton.classList.remove('hidden');
                // Esconde o botão de voltar normal
                DOM.backButton.classList.add('hidden');
            }, 500);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.appendChild(restartButton);
        buttonContainer.appendChild(menuButton);

        DOM.options.appendChild(buttonContainer);
    }

    // Utilitários
    function updateScore() {
        DOM.score.textContent = gameState.score;
    }

    function updateQuestionCounter() {
        DOM.questionCounter.textContent = `${gameState.currentQuestionIndex + 1}/${gameState.totalQuestions}`;
    }

    // Iniciar o jogo
    init();
});