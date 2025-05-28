// Configuração do jogo
const API_URL = "";
const FALLBACK_SENTENCES = [
    {
        sentence: "Houveram muitos problemas na festa.",
        correct: "Houve muitos problemas na festa.",
        explanation: "Verbo 'haver' (no sentido de existir) é impessoal (3ª pessoa do singular).",
        difficulty: "medium"
    },
    {
        sentence: "Ele assistiu o jogo na TV.",
        correct: "Ele assistiu ao jogo na TV.",
        explanation: "'Assistir a' é regência verbal obrigatória.",
        difficulty: "easy"
    },
    {
        sentence: "A maioria dos alunos faltaram à prova.",
        correct: "A maioria dos alunos faltou à prova.",
        explanation: "Com 'a maioria de', o verbo concorda com o núcleo ('maioria').",
        difficulty: "hard"
    }
];

// Variáveis do jogo
let sentences = [];
let currentSentence = null;
let score = 0;
let timeLeft = 30;
let timer;
let gameActive = false;

// Elementos do DOM
const elements = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    startButton: document.getElementById('start-button'),
    loading: document.getElementById('loading'),
    sentence: document.getElementById('sentence'),
    sentenceContainer: document.getElementById('sentence-container'),
    options: document.getElementById('options'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    feedback: document.getElementById('feedback'),
    animationContainer: document.getElementById('animation-container'),
    container: document.getElementById('game-container')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    elements.startButton.addEventListener('click', startGameFlow);
    document.getElementById('back-to-menu').addEventListener('click', () => {
        window.location.href = '../../index.html';
    });
});

// Fluxo do jogo
function startGameFlow() {
    elements.startScreen.style.display = 'none';
    elements.gameScreen.style.display = 'block';
    showLoader("Carregando frases...");
    fetchSentences();
}

// Busca frases
async function fetchSentences() {
    try {
        const response = await fetch(API_URL);
        
        if (API_URL && response.ok) {
            const data = await response.json();
            sentences = Array.isArray(data) ? data : data.frases;
        }
        
        if (!sentences || sentences.length === 0) {
            throw new Error("Usando frases locais");
        }
        
        hideLoader();
        initializeGame();
    } catch (error) {
        console.log(error.message);
        sentences = FALLBACK_SENTENCES;
        hideLoader();
        initializeGame();
    }
}

// Controles de loader
function showLoader(message) {
    elements.loading.textContent = message;
    elements.loading.style.display = 'block';
}

function hideLoader() {
    elements.loading.style.display = 'none';
}

// Inicia o jogo
function initializeGame() {
    gameActive = true;
    resetGameState();
    loadNextSentence();
    startTimer();
}

// Lógica do jogo
function resetGameState() {
    score = 0;
    timeLeft = 30;
    updateScoreDisplay();
    updateTimerDisplay();
    clearFeedback();
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
        clearInterval(timer);
        endGame();
    }
}

function updateTimerDisplay() {
    elements.timer.textContent = `Tempo: ${timeLeft}s`;
    if (timeLeft <= 10) {
        elements.timer.classList.add('warning');
    } else {
        elements.timer.classList.remove('warning');
    }
}

function updateScoreDisplay() {
    elements.score.textContent = `Pontos: ${score}`;
}

function clearFeedback() {
    elements.feedback.textContent = '';
    elements.feedback.className = '';
}

// Gerenciamento de frases
function loadNextSentence() {
    if (sentences.length === 0) {
        endGame();
        return;
    }

    clearFeedback();
    currentSentence = getRandomSentence();
    displaySentence();
    createAnswerOptions();
}

function getRandomSentence() {
    const randomIndex = Math.floor(Math.random() * sentences.length);
    return sentences[randomIndex];
}

function displaySentence() {
    elements.sentence.textContent = currentSentence.sentence;
    elements.sentence.style.animation = 'none';
    void elements.sentence.offsetHeight; // Trigger reflow
    elements.sentence.style.animation = 'fadeIn 0.5s';
}

function createAnswerOptions() {
    elements.options.innerHTML = '';
    
    const correctOption = createOption(currentSentence.correct, true);
    const wrongOptions = [
        currentSentence.sentence,
        generateWrongOption(currentSentence.correct)
    ].map(option => createOption(option, false));
    
    const allOptions = [correctOption, ...wrongOptions];
    shuffleOptions(allOptions).forEach(option => elements.options.appendChild(option));
}

function createOption(text, isCorrect) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'option';
    button.addEventListener('click', () => handleAnswer(isCorrect));
    return button;
}

function shuffleOptions(options) {
    return options.sort(() => Math.random() - 0.5);
}

function generateWrongOption(correct) {
    const commonMistakes = {
        "Houve muitos problemas na festa.": "Haviam muitos problemas na festa.",
        "Ele assistiu ao jogo na TV.": "Ele assistiu o jogo na televisão.",
        "A maioria dos alunos faltou à prova.": "A maioria dos alunos faltaram a prova."
    };
    
    return commonMistakes[correct] || 
           correct.replace(/\b(a|o)\b/g, match => match === 'a' ? 'à' : 'ao');
}

// Manipulação de respostas
function handleAnswer(isCorrect) {
    clearInterval(timer);
    
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }

    prepareNextRound();
}

function handleCorrectAnswer() {
    score++;
    updateScoreDisplay();
    showFeedback(`✅ Correto! ${currentSentence.explanation}`, 'correct');
    createAnimation('🎉', '#4CAF50');
    elements.sentence.classList.add('correct');
}

function handleWrongAnswer() {
    showFeedback(`❌ Errado! O correto é: "${currentSentence.correct}". ${currentSentence.explanation}`, 'incorrect');
    createAnimation('💥', '#f44336');
    elements.sentence.classList.add('incorrect');
}

function createAnimation(emoji, color) {
    const anim = document.createElement('div');
    anim.className = 'emoji-animation';
    anim.textContent = emoji;
    anim.style.color = color;
    anim.style.left = `${Math.random() * 80 + 10}%`;
    elements.animationContainer.appendChild(anim);
    
    setTimeout(() => {
        anim.remove();
    }, 1000);
}

function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = type;
}

function prepareNextRound() {
    if (timeLeft <= 0) return;
    
    setTimeout(() => {
        loadNextSentence();
        startTimer();
    }, 2000);
}

// Finalização do jogo
function endGame() {
    gameActive = false;
    showFinalResults();
    createRestartButton();
}

function showFinalResults() {
    elements.sentence.textContent = `Fim de jogo! Pontuação: ${score}/${sentences.length}`;
    elements.options.innerHTML = '';
    
    const feedbackMessage = getFeedbackMessage();
    showFeedback(feedbackMessage, getFeedbackType());
}

function getFeedbackMessage() {
    const percentage = (score / sentences.length) * 100;
    
    if (percentage >= 90) return '🎉 Excelente! Domínio total da gramática!';
    if (percentage >= 60) return '👍 Bom trabalho! Continue praticando!';
    return '📚 Estude mais e tente novamente!';
}

function getFeedbackType() {
    return (score / sentences.length) >= 0.6 ? 'correct' : 'incorrect';
}

function createRestartButton() {
    const button = document.createElement('button');
    button.textContent = 'Jogar Novamente';
    button.className = 'restart';
    button.addEventListener('click', () => {
        elements.options.innerHTML = '';
        initializeGame();
    });
    elements.options.appendChild(button);
}