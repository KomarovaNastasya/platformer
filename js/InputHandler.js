class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {
            left: false,
            right: false,
            jump: false,
            restart: false
        };
        
        console.log('InputHandler создан');
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        
        window.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        }, true);
    }

    handleKeyDown(event) {
        switch(event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'Space':
            case 'ArrowUp':
            case 'KeyW':
                // Прыжок только если игра активна
                if (this.game.gameState === 'playing') {
                    this.keys.jump = true;
                }
                break;
            case 'KeyR':
                this.keys.restart = true;
                // Рестарт доступен в любом состоянии кроме паузы
                if (this.game.restart && this.game.gameState !== 'paused') {
                    this.game.restart();
                }
                break;
            case 'KeyP':
                // Пауза только если игра активна или на паузе
                if (this.game.gameState === 'playing' || this.game.gameState === 'paused') {
                    if (this.game.togglePause) this.game.togglePause();
                }
                break;
        }
    }

    handleKeyUp(event) {
        switch(event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'Space':
            case 'ArrowUp':
            case 'KeyW':
                this.keys.jump = false;
                break;
            case 'KeyR':
                this.keys.restart = false;
                break;
        }
    }
}