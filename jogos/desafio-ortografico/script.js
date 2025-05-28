document.addEventListener('DOMContentLoaded', function() {
    // Configuração do jogo
    const FALLBACK_WORDS = [
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
        },
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
    ];

    // Estado do jogo
    const gameState = {
        words: [...FALLBACK_WORDS],
        currentWord: null,
        currentQuestionIndex: 0,
        score: 0,
        timeLeft: 45,
        timer: null,
        isActive: false,
        totalQuestions: 4
    };

    // Elementos DOM
    const DOM = {
        startScreen: document.getElementById('start-screen'),
        gameScreen: document.getElementById('game-screen'),
        startButton: document.getElementById('start-button'),
        word: document.getElementById('word'),
        phonetic: document.getElementById('phonetic'),
        options: document.getElementById('options'),
        timer: document.getElementById('timer'),
        timerText: document.querySelector('#timer span'),
        score: document.querySelector('#score span'),
        questionCounter: document.querySelector('#question-counter span'),
        feedback: document.getElementById('feedback'),
        animationContainer: document.getElementById('animation-container'),
        backButton: document.getElementById('back-to-menu')
    };

    // Inicialização
    function init() {
        DOM.startButton.addEventListener('click', startGame);
        DOM.backButton.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }

    // Fluxo do jogo
    function startGame() {
        DOM.startScreen.style.display = 'none';
        DOM.gameScreen.style.display = 'block';
        resetGame();
        loadRandomWord();
    }

    function resetGame() {
        gameState.score = 0;
        gameState.timeLeft = 45;
        gameState.isActive = true;
        gameState.currentQuestionIndex = 0;
        updateScore();
        updateTimerDisplay();
        clearFeedback();
    }

    // Carregar palavra aleatória
    async function loadRandomWord() {
        try {
            // Tenta buscar da API
            const response = await fetch('https://api.dicionario-aberto.net/random');
            const data = await response.json();
            
            if (!data.word) throw new Error("Palavra inválida da API");
            
            const options = generateOptions(data.word);
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
            const randomIndex = Math.floor(Math.random() * gameState.words.length);
            gameState.currentWord = gameState.words[randomIndex];
        }
        
        displayWord();
        startTimer();
    }

    function generateOptions(correctWord) {
        // Gera variações ortográficas incorretas
        const variations = [
            correctWord.replace(/ss/g, 's').replace(/ç/g, 'c').replace(/x/g, 'ch'),
            correctWord.replace(/s/g, 'ss').replace(/c/g, 'ç').replace(/ch/g, 'x'),
            correctWord.replace(/b/g, 'p').replace(/d/g, 't').replace(/g/g, 'j'),
            correctWord.replace(/ão/g, 'am').replace(/ões/g, 'ons')
        ];
        
        // Remove duplicatas e mantém apenas variações diferentes da palavra original
        const uniqueVariations = [...new Set(variations.filter(v => v !== correctWord))];
        
        // Seleciona até 3 variações diferentes
        const selectedVariations = uniqueVariations.slice(0, 3);
        
        // Garante que temos pelo menos 1 variação (caso todas substituições resultem na mesma palavra)
        const finalOptions = selectedVariations.length > 0 
            ? [...selectedVariations, correctWord]
            : [correctWord, correctWord + "x", correctWord + "s", correctWord + "z"]; // Fallback
        
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
            gameState.timeLeft = 45;
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
        const button = document.createElement('button');
        button.className = 'restart';
        button.textContent = 'Jogar Novamente';
        button.addEventListener('click', () => {
            DOM.gameScreen.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => {
                DOM.gameScreen.style.display = 'none';
                DOM.startScreen.style.display = 'flex';
                DOM.startScreen.style.animation = 'fadeIn 0.5s forwards';
            }, 500);
        });
        
        DOM.options.appendChild(button);
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