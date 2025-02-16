const translations = {
  en: {
    title: 'S4 SNAKE',
    play: 'Play',
    options: 'Options',
    achievements: 'Achievements',
    soon: 'Soon',
    gameOver: 'Game Over',
    finalScore: 'Final Score',
    playAgain: 'Play Again',
    mainMenu: 'Main Menu',
    snakeSkin: 'Snake Skin',
    classic: 'Classic',
    neon: 'Neon',
    rainbow: 'Rainbow',
    language: 'Language',
    back: 'Back',
    currentScore: 'Score',
    highScore: 'Best',
    achievementUnlocked: 'Achievement Unlocked!'
  },
  'pt-BR': {
    title: 'S4 SNAKE',
    play: 'Jogar',
    options: 'Opções',
    achievements: 'Conquistas',
    soon: 'Em breve',
    gameOver: 'Fim de Jogo',
    finalScore: 'Pontuação Final',
    playAgain: 'Jogar Novamente',
    mainMenu: 'Menu Principal',
    snakeSkin: 'Aparência da Cobra',
    classic: 'Clássico',
    neon: 'Neon',
    rainbow: 'Arco-íris',
    language: 'Idioma',
    back: 'Voltar',
    currentScore: 'Pontuação',
    highScore: 'Recorde',
    achievementUnlocked: 'Conquista Desbloqueada!'
  }
};

let currentLanguage = localStorage.getItem('language') || 'en';
let currentSkin = localStorage.getItem('snakeSkin') || 'classic';

window.currentSkin = currentSkin; // Make it globally available

function updateLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = translations[lang][key];
  });
}

function updateSkin(skin) {
  currentSkin = skin;
  window.currentSkin = skin; // Update global reference
  localStorage.setItem('snakeSkin', skin);
  document.querySelectorAll('.skin-button').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.skin === skin);
  });
}

// Initialize language
updateLanguage(currentLanguage);

document.querySelectorAll('.lang-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateLanguage(btn.dataset.lang);
  });
});

document.querySelectorAll('.skin-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.skin-button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateSkin(btn.dataset.skin);
  });
});
