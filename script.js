document.addEventListener('DOMContentLoaded', () => {
    // Menu Mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('.header');
    
    menuToggle.addEventListener('click', () => {
        header.classList.toggle('active');
        menuToggle.innerHTML = header.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Efeito de digitação no título
    const title = document.querySelector('.header h1');
    if (title) {
        const originalText = title.textContent;
        title.textContent = '';
        title.style.display = 'inline-block';
        title.style.overflow = 'hidden';
        title.style.whiteSpace = 'nowrap';
        title.style.borderRight = '3px solid var(--secondary)';
        title.style.animation = 'typing 3s steps(30, end), blink-caret .75s step-end infinite';
        
        setTimeout(() => {
            title.textContent = originalText;
            title.style.animation = 'none';
            title.style.borderRight = 'none';
        }, 3000);
    }

    // Efeitos para os cards de jogos
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (card.classList.contains('coming-soon')) {
                e.preventDefault();
                
                // Feedback visual
                card.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    card.style.animation = '';
                }, 500);
                
                alert('Jogo em desenvolvimento! Em breve disponível.');
            }
        });
    });
});

// Animação de shake para feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
    
    @keyframes typing {
        from { width: 0 }
        to { width: 100% }
    }
    
    @keyframes blink-caret {
        from, to { border-color: transparent }
        50% { border-color: var(--secondary) }
    }
`;
document.head.appendChild(style);