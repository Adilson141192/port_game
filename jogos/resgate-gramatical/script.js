// Configuração do jogo
const FALLBACK_SENTENCES = [
    {
        sentence: "Houveram muitos problemas na festa.",
        correct: "Houve muitos problemas na festa.",
        explanation: "Verbo 'haver' (existir) é impessoal - use apenas 3ª pessoa do singular.",
        difficulty: "medium"
    },
    {
        sentence: "Ele assistiu o jogo na TV.",
        correct: "Ele assistiu ao jogo na TV.",
        explanation: "Regência verbal: 'assistir a' é obrigatório.",
        difficulty: "easy"
    },
    {
        sentence: "A maioria dos alunos faltaram à prova.",
        correct: "A maioria dos alunos faltou à prova.",
        explanation: "Concordância: verbo concorda com 'maioria' (singular).",
        difficulty: "hard"
    },
    {
        sentence: "Vou emprestar seu livro para você.",
        correct: "Vou te emprestar o livro.",
        explanation: "'Emprestar' significa dar emprestado, não pegar emprestado.",
        difficulty: "medium"
    }
];

// Estado do jogo
const gameState = {
    sentences: [...FALLBACK_SENTENCES],
    currentSentence: null,
    score: 0,
    timeLeft: 30,
    timer: null,
    isActive: false
};

// Elementos DOM
const DOM = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    startButton: document.getElementById('start-button'),
    sentence: document.getElementById('sentence'),
    options: document.getElementById('options'),
    timer: document.getElementById('timer'),
    timerText: document.querySelector('#timer span'),
    score: document.querySelector('#score span'),
    feedback: document.getElementById('feedback'),
    animationContainer: document.getElementById('animation-container')
};

// Inicialização
function init() {
    DOM.startButton.addEventListener('click', startGame);
    document.getElementById('back-to-menu').addEventListener('click', () => {
    window.location.href = '../../index.html';
    });
}

// Fluxo do jogo
function startGame() {
    // Transição entre telas
    DOM.startScreen.style.animation = 'fadeOut 0.5s forwards';
    
    setTimeout(() => {
        DOM.startScreen.style.display = 'none';
        DOM.gameScreen.style.display = 'block';
        DOM.gameScreen.style.animation = 'fadeIn 0.5s forwards';
        
        resetGame();
        loadNextSentence();
        startTimer();
    }, 500);
}

function resetGame() {
    gameState.score = 0;
    gameState.timeLeft = 30;
    gameState.isActive = true;
    
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
            endGame();
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

// Gerenciamento de frases
function loadNextSentence() {
    if (!gameState.isActive) return;
    
    clearFeedback();
    gameState.currentSentence = getRandomSentence();
    displaySentence();
    createOptions();
}

function getRandomSentence() {
    const randomIndex = Math.floor(Math.random() * gameState.sentences.length);
    return gameState.sentences[randomIndex];
}

function displaySentence() {
    DOM.sentence.textContent = gameState.currentSentence.sentence;
    DOM.sentence.style.animation = 'fadeIn 0.5s';
}

function createOptions() {
    DOM.options.innerHTML = '';
    
    const correctOption = createOption(gameState.currentSentence.correct, true);
    const wrongOptions = [
        gameState.currentSentence.sentence,
        generateWrongOption(gameState.currentSentence.correct)
    ].map(option => createOption(option, false));
    
    shuffleArray([correctOption, ...wrongOptions]).forEach(option => {
        DOM.options.appendChild(option);
    });
}

function createOption(text, isCorrect) {
    const button = document.createElement('button');
    button.className = 'option';
    button.textContent = text;
    button.addEventListener('click', () => handleAnswer(isCorrect));
    return button;
}

function generateWrongOption(correct) {
    const commonMistakes = {
        "Houve muitos problemas na festa.": "Haviam muitos problemas na festa.",
        "Ele assistiu ao jogo na TV.": "Ele assistiu o jogo na televisão.",
        "A maioria dos alunos faltou à prova.": "A maioria dos alunos faltaram a prova."
    };
    
    return commonMistakes[correct] || correct.replace(/\b(a|o)\b/g, match => 
        match === 'a' ? 'à' : 'ao');
}

// Manipulação de respostas
function handleAnswer(isCorrect) {
    if (!gameState.isActive) return;
    
    clearInterval(gameState.timer);
    
    if (isCorrect) {
        handleCorrect();
    } else {
        handleIncorrect();
    }
    
    prepareNextRound();
}

function handleCorrect() {
    gameState.score++;
    updateScore();
    showFeedback(`✅ Correto! ${gameState.currentSentence.explanation}`, 'correct');
    createAnimation('🎉', '#4CAF50');
}

function handleIncorrect() {
    showFeedback(`❌ Errado! O correto é: "${gameState.currentSentence.correct}". ${gameState.currentSentence.explanation}`, 'incorrect');
    createAnimation('💥', '#f44336');
}

function createAnimation(emoji, color) {
    const anim = document.createElement('div');
    anim.className = 'emoji-animation';
    anim.textContent = emoji;
    anim.style.color = color;
    anim.style.left = `${Math.random() * 70 + 15}%`;
    DOM.animationContainer.appendChild(anim);
    
    setTimeout(() => anim.remove(), 1000);
}

function prepareNextRound() {
    setTimeout(() => {
        if (gameState.timeLeft > 0) {
            loadNextSentence();
            startTimer();
        }
    }, 2000);
}

// Finalização
function endGame() {
    gameState.isActive = false;
    clearInterval(gameState.timer);
    showFinalResults();
}

function showFinalResults() {
    DOM.sentence.textContent = `Fim de jogo! Pontuação: ${gameState.score}/${gameState.sentences.length}`;
    DOM.options.innerHTML = '';
    
    const percentage = (gameState.score / gameState.sentences.length) * 100;
    let message, className;
    
    if (percentage >= 90) {
        message = '🎉 Excelente! Domínio total!';
        className = 'correct';
    } else if (percentage >= 60) {
        message = '👍 Bom trabalho! Continue praticando!';
        className = 'correct';
    } else {
        message = '📚 Estude mais e tente novamente!';
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

function showFeedback(message, type) {
    DOM.feedback.textContent = message;
    DOM.feedback.className = type;
}

function clearFeedback() {
    DOM.feedback.textContent = '';
    DOM.feedback.className = '';
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Iniciar o jogo
document.addEventListener('DOMContentLoaded', init);