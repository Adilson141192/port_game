document.addEventListener('DOMContentLoaded', function() {
    // Configuração do jogo
    const FALLBACK_TEXTS = [
        {
            id: 1,
            title: "A Cigarra e a Formiga",
            content: "Num belo dia de verão, a cigarra cantava alegremente enquanto a formiga trabalhava duro, armazenando comida para o inverno. A cigarra zombava da formiga, dizendo que ela deveria aproveitar o sol. Quando o inverno chegou, a cigarra, sem ter o que comer, pediu ajuda à formiga. A formiga respondeu: 'Enquanto eu trabalhava, você cantava. Agora dance!'",
            questions: [
                {
                    question: "Qual era a atitude da cigarra durante o verão?",
                    options: [
                        "Trabalhava muito armazenando comida",
                        "Cantava alegremente sem se preocupar",
                        "Ajudava a formiga no trabalho",
                        "Fazia planos para o inverno"
                    ],
                    correct: 1,
                    explanation: "O texto diz que a cigarra 'cantava alegremente' enquanto a formiga trabalhava."
                },
                {
                    question: "Qual foi a resposta da formiga quando a cigarra pediu ajuda?",
                    options: [
                        "Deu metade de sua comida para a cigarra",
                        "Disse que agora era a vez da cigarra dançar",
                        "Ensinou a cigarra a armazenar comida",
                        "Ignorou completamente a cigarra"
                    ],
                    correct: 1,
                    explanation: "A formiga respondeu: 'Enquanto eu trabalhava, você cantava. Agora dance!'"
                },
                {
                    question: "Qual é a moral desta fábula?",
                    options: [
                        "Devemos sempre ajudar os outros",
                        "É importante se preparar para o futuro",
                        "Cantar é tão importante quanto trabalhar",
                        "O inverno é uma estação difícil"
                    ],
                    correct: 1,
                    explanation: "A fábula ensina sobre a importância de se preparar para o futuro."
                }
            ],
            difficulty: "easy"
        }
    ];

    // Estado do jogo
    const gameState = {
        texts: [...FALLBACK_TEXTS],
        currentText: null,
        currentQuestionIndex: 0,
        score: 0,
        timeLeft: 60,
        timer: null,
        isActive: false,
        totalQuestions: 0
    };

    // Elementos DOM
    const DOM = {
        startScreen: document.getElementById('start-screen'),
        gameScreen: document.getElementById('game-screen'),
        startButton: document.getElementById('start-button'),
        textContent: document.getElementById('text-content'),
        question: document.getElementById('question'),
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
            window.location.href = '../../index.html';
        });
    }

    // Fluxo do jogo
    function startGame() {
        DOM.startScreen.style.display = 'none';
        DOM.gameScreen.style.display = 'block';
        resetGame();
        loadRandomText();
    }

    function resetGame() {
        gameState.score = 0;
        gameState.timeLeft = 60;
        gameState.isActive = true;
        gameState.currentQuestionIndex = 0;
        updateScore();
        updateTimerDisplay();
        clearFeedback();
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
        
        if (gameState.timeLeft <= 10) {
            DOM.timer.classList.add('warning');
        } else {
            DOM.timer.classList.remove('warning');
        }
    }

    function handleTimeOut() {
        clearInterval(gameState.timer);
        showFeedback("⏰ Tempo esgotado! Vamos para a próxima pergunta.", 'incorrect');
        prepareNextQuestion();
    }

    // Gerenciamento de textos e perguntas
    function loadRandomText() {
        const randomIndex = Math.floor(Math.random() * gameState.texts.length);
        gameState.currentText = gameState.texts[randomIndex];
        gameState.totalQuestions = gameState.currentText.questions.length;
        
        displayText();
        loadQuestion();
        startTimer();
    }

    function displayText() {
        DOM.textContent.textContent = gameState.currentText.content;
        DOM.textContent.style.animation = 'fadeIn 0.5s';
        updateQuestionCounter();
    }

    function loadQuestion() {
        if (!gameState.isActive || gameState.currentQuestionIndex >= gameState.totalQuestions) {
            endGame();
            return;
        }
        
        clearFeedback();
        const currentQuestion = gameState.currentText.questions[gameState.currentQuestionIndex];
        displayQuestion(currentQuestion);
        createOptions(currentQuestion);
    }

    function displayQuestion(question) {
        DOM.question.textContent = question.question;
        DOM.question.style.animation = 'fadeIn 0.5s';
    }

    function createOptions(question) {
        DOM.options.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const isCorrect = index === question.correct;
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            button.addEventListener('click', () => handleAnswer(isCorrect, question.explanation));
            DOM.options.appendChild(button);
        });
    }

    // Manipulação de respostas
    function handleAnswer(isCorrect, explanation) {
        if (!gameState.isActive) return;
        
        clearInterval(gameState.timer);
        
        if (isCorrect) {
            handleCorrect(explanation);
        } else {
            handleIncorrect(explanation);
        }
        
        prepareNextQuestion();
    }

    function handleCorrect(explanation) {
        gameState.score++;
        updateScore();
        showFeedback(`✅ Correto! ${explanation}`, 'correct');
        createAnimation('🎉', '#4CAF50');
    }

    function handleIncorrect(explanation) {
        showFeedback(`❌ Incorreto! ${explanation}`, 'incorrect');
        createAnimation('💥', '#f44336');
    }

    function prepareNextQuestion() {
        setTimeout(() => {
            gameState.currentQuestionIndex++;
            gameState.timeLeft = 60;
            updateTimerDisplay();
            
            if (gameState.currentQuestionIndex < gameState.totalQuestions) {
                loadQuestion();
                startTimer();
            } else {
                endGame();
            }
        }, 2000);
    }

    // Animação e feedback
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

    // Finalização
    function endGame() {
        gameState.isActive = false;
        clearInterval(gameState.timer);
        showFinalResults();
    }

    function showFinalResults() {
        DOM.textContent.textContent = `Fim do texto: ${gameState.currentText.title}`;
        DOM.question.textContent = `Pontuação final: ${gameState.score}/${gameState.totalQuestions}`;
        DOM.options.innerHTML = '';
        
        const percentage = (gameState.score / gameState.totalQuestions) * 100;
        let message, className;
        
        if (percentage >= 90) {
            message = '🎉 Excelente! Compreensão textual perfeita!';
            className = 'correct';
        } else if (percentage >= 60) {
            message = '👍 Bom trabalho! Continue praticando!';
            className = 'correct';
        } else {
            message = '📚 Leia com mais atenção e tente novamente!';
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