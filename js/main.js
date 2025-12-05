window.addEventListener('DOMContentLoaded', () => {
    console.log('Игра запускается...');
    
    const canvas = document.getElementById('gameCanvas');
    const gameWidth = 800;
    const gameHeight = 600;
    
    canvas.width = gameWidth;
    canvas.height = gameHeight;
    
    // Создаем игру
    const game = new Game(gameWidth, gameHeight);
    game.start();
    
    console.log('Игра создана успешно!');
});