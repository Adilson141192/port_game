document.addEventListener('DOMContentLoaded', function () {
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
        timeLeft: 30,
        timer: null,
        isActive: true,
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
        gameContainer: document.getElementById('game-container'),
        hintButton: document.getElementById('hint-button'),
        hintContent: document.getElementById('hint-content')
    };

    // Inicialização
    function init() {
        // Verifica se os elementos DOM existem antes de adicionar event listeners
        if (!DOM.startButton || !DOM.backButton || !DOM.backToMainButton) {
            console.error("Elementos do DOM não encontrados!");
            return;
        }

        // Configura os botões
        DOM.backButton.classList.add('hidden');
        DOM.backToMainButton.classList.remove('hidden');

        DOM.startButton.addEventListener('click', startGame);
        DOM.backButton.addEventListener('click', returnToMenu);
        DOM.backToMainButton.addEventListener('click', () => {
            window.location.href = '../../index.html';
        });

        // Configuração dos botões de dificuldade
        if (DOM.difficultyButtons) {
            DOM.difficultyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    setDifficulty(button.dataset.level);
                });
            });
        }

        // Configura o botão de dica
        if (DOM.hintButton) {
            DOM.hintButton.addEventListener('click', toggleHint);
        }

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
        if (DOM.difficultyButtons) {
            DOM.difficultyButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.level === level);
            });
        }

        if (DOM.timePerQuestion) DOM.timePerQuestion.textContent = `${settings.time}s`;
        if (DOM.currentLevel) DOM.currentLevel.textContent = settings.name;
        if (DOM.currentRules) DOM.currentRules.textContent = settings.rules;

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
        if (DOM.hintContent) DOM.hintContent.classList.add('hidden');

        const settings = gameState.difficultySettings[gameState.currentDifficulty];
        if (DOM.difficultyIndicator) {
            DOM.difficultyIndicator.textContent = settings.name;
            DOM.difficultyIndicator.className = `game-difficulty ${gameState.currentDifficulty}`;
            DOM.difficultyIndicator.style.color = settings.color;
        }
    }

    // Carregar palavra aleatória
    async function loadRandomWord() {
        gameState.isActive = true; // Garante que o jogo está ativo
        
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

    function generateHint(word, difficulty) {
        const hints = {
            easy: [
                `Palavras com 'b' antes de 'r' geralmente mantêm o 'b' (ex: abrir, abraço).`,
                `Palavras com 'v' no início geralmente mantêm essa letra (ex: vazio, vento).`,
                `Palavras terminadas em 'ês' indicam plural (ex: franceses, portugueses).`,
                `Palavras com 'ç' são seguidas de 'a', 'o' ou 'u' (ex: caça, açúcar).`
            ],
            medium: [
                `Palavras com 'x' entre vogais geralmente mantêm essa letra (ex: próximo, máximo).`,
                `Palavras com 'ch' no som de 'x' geralmente são de origem indígena (ex: abacaxi, cachimbo).`,
                `Palavras com 'g' antes de 'e' ou 'i' geralmente mantêm essa letra (ex: gengibre, gíria).`,
                `Palavras com 'j' antes de 'a', 'o' ou 'u' geralmente mantêm essa letra (ex: jantar, jogar).`
            ],
            hard: [
                `Palavras com 'pn', 'ps', 'mn' no início são de origem grega e mantêm essas letras (ex: pneumático, mnemônico).`,
                `Palavras com 'ct' geralmente mantêm essa grafia (ex: acto, contacto - em Portugal).`,
                `Palavras com 'bt' geralmente mantêm essa grafia (ex: obtuso, subtil).`,
                `Palavras com 'tm' geralmente mantêm essa grafia (ex: ritmo, atmósfera).`
            ]
        };

        if (word.startsWith('pn')) {
            return "Palavras com 'pn' no início são de origem grega e mantêm essa grafia.";
        }
        if (word.startsWith('ps')) {
            return "Palavras com 'ps' no início são de origem grega e mantêm essa grafia.";
        }
        if (word.includes('ç')) {
            return "O 'ç' é usado antes de 'a', 'o', 'u' e no final de palavras (ex: caça, açúcar).";
        }
        if (word.includes('x') && word.indexOf('x') > 0 && word.indexOf('x') < word.length - 1) {
            return "O 'x' entre vogais geralmente mantém essa letra (ex: próximo, máximo).";
        }
        if (word.includes('ch')) {
            return "O 'ch' com som de 'x' geralmente aparece em palavras de origem indígena.";
        }

        const randomHint = hints[difficulty][Math.floor(Math.random() * hints[difficulty].length)];
        return randomHint;
    }

    function generateOptions(correctWord, difficulty) {
        // Se a palavra for muito curta, usa apenas o fallback
        if (correctWord.length < 3) {
            const words = gameState.words[difficulty];
            const randomWord = words[Math.floor(Math.random() * words.length)];
            return [...randomWord.options];
        }

        let variations = [];
        const usedVariations = new Set();

        const rules = {
            easy: [
                () => correctWord.replace(/b/g, 'v').replace(/v/g, 'b'),
                () => correctWord.replace(/s([aou])/g, 'ss$1').replace(/ss([aou])/g, 's$1'),
                () => correctWord.replace(/c([ei])/g, 's$1').replace(/s([ei])/g, 'c$1'),
                () => correctWord.replace(/ç/g, 'c').replace(/c([aou])/g, 'ç$1'),
                () => correctWord.replace(/ão$/, 'am').replace(/ões$/, 'ons')
            ],
            medium: [
                () => correctWord.replace(/x/g, 'ch').replace(/ch/g, 'x'),
                () => correctWord.replace(/g([ei])/g, 'j$1').replace(/j([ei])/g, 'g$1'),
                () => correctWord.replace(/ss/g, 's').replace(/s([aou])/g, 'ss$1'),
                () => correctWord.replace(/z([aou])/g, 's$1').replace(/s([aou])/g, 'z$1'),
                () => correctWord + (correctWord.endsWith('m') ? 's' : 'm')
            ],
            hard: [
                () => correctWord.replace(/mn/g, 'n').replace(/n([^aeiou])/g, 'mn$1'),
                () => correctWord.replace(/ps/g, 's').replace(/s([^aeiou])/g, 'ps$1'),
                () => correctWord.replace(/pn/g, 'n').replace(/n([^aeiou])/g, 'pn$1'),
                () => correctWord.replace(/tm/g, 'm').replace(/m([^aeiou])/g, 'tm$1'),
                () => correctWord.replace(/bt/g, 't').replace(/t([^aeiou])/g, 'bt$1')
            ]
        };

        // Gera variações baseadas nas regras
        rules[difficulty].forEach(rule => {
            const variation = rule();
            if (variation !== correctWord && !usedVariations.has(variation)) {
                variations.push(variation);
                usedVariations.add(variation);
            }
        });

        // Completa com variações extras se necessário
        const commonErrors = ['s', 'z', 'x', 'ão', 'am', 'ões', 'ns'];
        while (variations.length < 3) {
            const randomSuffix = commonErrors[Math.floor(Math.random() * commonErrors.length)];
            const variation = correctWord + randomSuffix;
            if (!usedVariations.has(variation)) {
                variations.push(variation);
                usedVariations.add(variation);
            }
        }

        // Seleciona até 3 variações diferentes
        const selectedVariations = variations.slice(0, 3);
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
        if (DOM.timerText) DOM.timerText.textContent = `${gameState.timeLeft}s`;
        if (DOM.timer) DOM.timer.classList.toggle('warning', gameState.timeLeft <= 10);
    }

    function handleTimeOut() {
        clearInterval(gameState.timer);
        showFeedback("⏰ Tempo esgotado! Vamos para a próxima palavra.", 'incorrect');
        prepareNextQuestion();
    }

    // Exibir palavra e opções
    function displayWord() {
        if (!DOM.word || !DOM.phonetic || !DOM.options) return;
        
        DOM.word.textContent = gameState.currentWord.word;
        DOM.phonetic.textContent = gameState.currentWord.phonetic;
        DOM.word.style.animation = 'fadeIn 0.5s';
        updateQuestionCounter();
        createOptions();
        if (DOM.hintContent) DOM.hintContent.classList.add('hidden');
    }

    function createOptions() {
        if (!DOM.options) return;
        
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
            gameState.score += gameState.timeLeft;
            updateScore();
            showFeedback("✅ Correto! " + explanation, 'correct');
            createAnimation('🎉');
        } else {
            showFeedback("❌ Incorreto! " + explanation, 'incorrect');
            createAnimation('😢');
        }

        prepareNextQuestion();
    }

    function updateScore() {
        if (DOM.score) DOM.score.textContent = gameState.score;
    }

    function showFeedback(message, type) {
        if (!DOM.feedback) return;
        
        DOM.feedback.textContent = message;
        DOM.feedback.className = `feedback-card ${type}`;
        DOM.feedback.style.animation = 'fadeIn 0.5s';
    }

    function clearFeedback() {
        if (!DOM.feedback) return;
        
        DOM.feedback.textContent = '';
        DOM.feedback.className = 'feedback-card';
        DOM.feedback.style.animation = '';
    }

    function createAnimation(emoji) {
        if (!DOM.animationContainer) return;
        
        const anim = document.createElement('div');
        anim.className = 'emoji-animation';
        anim.textContent = emoji;
        DOM.animationContainer.appendChild(anim);

        setTimeout(() => {
            anim.remove();
        }, 1000);
    }

    function updateQuestionCounter() {
        if (DOM.questionCounter) {
            DOM.questionCounter.textContent = `${gameState.currentQuestionIndex + 1}/${gameState.totalQuestions}`;
        }
    }

    function prepareNextQuestion() {
        gameState.currentQuestionIndex++;
        gameState.isActive = false;

        if (gameState.currentQuestionIndex < gameState.totalQuestions) {
            setTimeout(() => {
                clearFeedback();
                loadRandomWord();
            }, 1500);
        } else {
            endGame();
        }
    }

    function endGame() {
        setTimeout(() => {
            if (!DOM.gameScreen) return;
            
            DOM.gameScreen.innerHTML = `
                <div class="card">
                    <h2>Jogo Concluído!</h2>
                    <p>Sua pontuação final: <strong>${gameState.score}</strong></p>
                    <p>Nível: ${gameState.difficultySettings[gameState.currentDifficulty].name}</p>
                    <div class="button-container">
                        <button class="restart" onclick="location.reload()">
                            <i class="fas fa-redo"></i> Jogar Novamente
                        </button>
                        <button class="restart" id="back-to-menu">
                            <i class="fas fa-home"></i> Voltar ao Menu
                        </button>
                    </div>
                </div>
            `;
            
            // Reatacha o evento do botão de voltar
            const backButton = document.getElementById('back-to-menu');
            if (backButton) {
                backButton.addEventListener('click', returnToMenu);
            }
        }, 1500);
    }

    // Inicia o jogo
    init();
});