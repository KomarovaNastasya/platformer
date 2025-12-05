class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
        
        console.log('Game создается...');
        
        // Инициализация
        this.input = new InputHandler(this);
        this.background = new Background(this);
        
        // Система уровней
        this.currentLevel = 1;
        this.totalLevels = 3;
        this.levelCompleted = false;
        this.levelCompleteTimer = null;
        
        this.loadLevel(this.currentLevel);
        
        this.gameState = 'playing'; // playing, paused, levelComplete, gameComplete, gameOver
        this.lastTime = 0;
        
        // Для анимации экранов
        this.screenTime = 0;
        this.skullParticles = [];
        this.fireParticles = [];
        
        console.log(`Уровень ${this.currentLevel} загружен`);
        
        this.gameLoop = this.gameLoop.bind(this);
    }

    start() {
        console.log('Игра запущена');
        requestAnimationFrame(this.gameLoop);
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime || 0;
        this.lastTime = currentTime;
        this.screenTime += deltaTime / 1000;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') {
            // Обновляем частицы для экранов
            this.updateScreenParticles(deltaTime);
            return;
        }
        
        // Проверяем, не завершен ли уже уровень
        if (this.levelCompleted) return;
        
        // Обновление платформ
        this.platforms.forEach(platform => {
            if (platform.update) platform.update(deltaTime);
        });
        
        // Обновление черепов
        this.skulls.forEach(skull => {
            if (skull.update) skull.update(deltaTime);
        });
        
        // Обновление игрока
        if (this.player.update) {
            this.player.update(this.input, this.platforms);
        }
        
        // Обновление фона
        if (this.background.update) {
            this.background.update(this.player.vx);
        }
        
        // Проверка коллизий
        if (Collision.checkPlayerPlatforms) {
            Collision.checkPlayerPlatforms(this.player, this.platforms);
        }
        
        // ✅ ПРОВЕРЯЕМ СМЕРТЬ ОТ ГРАНИЦ
        if (Collision.checkWorldBounds) {
            const isDead = Collision.checkWorldBounds(this.player, this.width, this.height);
            if (isDead) {
                this.gameOver();
                return; // Важно: выходим из update если игрок умер
            }
        }
        
        // Проверка коллизий с черепами
        this.checkSkullCollisions();
        
        // Проверка завершения уровня (все черепа собраны)
        if (this.collectedSkulls === this.totalSkulls && this.totalSkulls > 0 && !this.levelCompleted) {
            this.completeLevel();
        }
    }
    
    updateScreenParticles(deltaTime) {
        // Обновляем частицы черепов
        this.skullParticles.forEach((particle, index) => {
            particle.y += particle.speed;
            particle.x += particle.drift;
            particle.rotation += particle.rotationSpeed;
            particle.floatOffset += 0.05;
            particle.y += Math.sin(particle.floatOffset) * 0.5;
            
            if (particle.y > this.height + 50) {
                this.skullParticles.splice(index, 1);
            }
        });
        
        // Обновляем огненные частицы
        this.fireParticles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life--;
            particle.size *= 0.97;
            
            if (particle.life <= 0 || particle.size < 0.5) {
                this.fireParticles.splice(index, 1);
            }
        });
        
        // Добавляем новые частицы для экранов
        if (this.gameState === 'levelComplete' || this.gameState === 'gameComplete') {
            // Добавляем случайные черепа-частицы
            if (Math.random() < 0.1) {
                this.skullParticles.push({
                    x: Math.random() * this.width,
                    y: -30,
                    size: 8 + Math.random() * 10,
                    speed: 1 + Math.random() * 2,
                    drift: (Math.random() - 0.5) * 0.5,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.05,
                    floatOffset: Math.random() * Math.PI * 2,
                    type: Math.floor(Math.random() * 3)
                });
            }
            
            // Добавляем огненные частицы
            if (Math.random() < 0.3) {
                this.fireParticles.push({
                    x: Math.random() * this.width,
                    y: this.height + 10,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -2 - Math.random() * 3,
                    size: 3 + Math.random() * 6,
                    life: 30 + Math.random() * 30,
                    color: Math.random() > 0.5 ? '#FF4500' : '#FFD700'
                });
            }
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        console.log('Игрок умер! Начинаем перезагрузку уровня...');
        
        // Сбрасываем время экрана
        this.screenTime = 0;
        
        // Показываем экран смерти на 1.5 секунды, затем перезагружаем уровень
        setTimeout(() => {
            this.restartLevel();
        }, 1500);
    }
    
    restartLevel() {
        console.log('Перезагрузка текущего уровня');
        this.loadLevel(this.currentLevel);
        this.gameState = 'playing';
        this.levelCompleted = false;
        this.skullParticles = [];
        this.fireParticles = [];
    }
    
    checkSkullCollisions() {
        this.skulls.forEach(skull => {
            if (!skull.collected && skull.checkCollision(this.player)) {
                const points = skull.collect();
                this.score += points;
                this.collectedSkulls++;
                console.log(`💀 Череп собран! +${points} очков. Всего: ${this.score}`);
                
                // Эффект сбора черепа (огненный взрыв)
                this.createSkullCollectionEffect(skull.x, skull.currentY || skull.y);
            }
        });
    }
    
    completeLevel() {
        this.levelCompleted = true;
        this.gameState = 'levelComplete';
        console.log(`Уровень ${this.currentLevel} завершен!`);
        
        // Сбрасываем время экрана
        this.screenTime = 0;
        
        // Очищаем предыдущий таймер если есть
        if (this.levelCompleteTimer) {
            clearTimeout(this.levelCompleteTimer);
        }
        
        // Автоматический переход на следующий уровень через 3 секунды
        this.levelCompleteTimer = setTimeout(() => {
            this.nextLevel();
        }, 3000);
    }
    
    nextLevel() {
        // Сбрасываем флаг завершения уровня
        this.levelCompleted = false;
        
        if (this.currentLevel < this.totalLevels) {
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
            this.gameState = 'playing';
            this.skullParticles = [];
            this.fireParticles = [];
            console.log(`Переход на уровень ${this.currentLevel}`);
        } else {
            // Игра полностью завершена
            this.gameState = 'gameComplete';
            console.log('Игра пройдена!');
        }
    }
    
    loadLevel(levelNumber) {
        // Сброс игрока
        this.player = new Player(this);
        
        // Загрузка уровня
        switch(levelNumber) {
            case 1:
                this.platforms = this.createLevel1();
                this.skulls = this.createSkullsLevel1();
                break;
            case 2:
                this.platforms = this.createLevel2();
                this.skulls = this.createSkullsLevel2();
                break;
            case 3:
                this.platforms = this.createLevel3();
                this.skulls = this.createSkullsLevel3();
                break;
        }
        
        // Сброс статистики
        this.score = 0;
        this.collectedSkulls = 0;
        this.totalSkulls = this.skulls.length;
        this.tempParticles = [];
        this.confetti = null;
        
        // Обновляем фон
        this.background = new Background(this);
        
        console.log(`Загружен уровень ${levelNumber}: ${this.totalSkulls} черепов`);
    }
    
    // Уровень 1 (простой)
    createLevel1() {
        return [
            new Platform(0, this.height - 40, this.width, 40, 'static', true),
            new Platform(80, 220, 150, 20, 'static'),
            new Platform(250, 400, 150, 20, 'static'),
            new Platform(450, 320, 100, 20, 'static'),
            new Platform(650, 250, 120, 20, 'static'),
            new Platform(150, 350, 100, 20, 'static'),
        ];
    }
    
    createSkullsLevel1() {
        return [
            new Skull(120, 190),
            new Skull(300, 380),
            new Skull(500, 300),
            new Skull(700, 230),
            new Skull(200, 260),
        ];
    }
    
    // Уровень 2 (средний)
    createLevel2() {
        return [
            new Platform(0, this.height - 40, this.width, 40, 'static', true),
            new Platform(100, 220, 120, 20, 'static'),
            new Platform(300, 250, 200, 20, 'movingHorizontal'),
            new Platform(500, 450, 150, 20, 'movingVertical'),
            new Platform(200, 320, 100, 20, 'static'),
            new Platform(600, 350, 120, 20, 'static'),
            new Platform(350, 400, 80, 20, 'static'),
        ];
    }
    
    createSkullsLevel2() {
        return [
            new Skull(150, 200),
            new Skull(400, 160),
            new Skull(550, 430),
            new Skull(250, 300),
            new Skull(500, 260),
            new Skull(650, 330),
            new Skull(390, 380),
        ];
    }
    
    // Уровень 3 (сложный)
    createLevel3() {
        return [
            new Platform(0, this.height - 40, this.width, 40, 'static', true),
            new Platform(50, 220, 100, 20, 'static'),
            new Platform(250, 180, 150, 20, 'movingHorizontal'),
            new Platform(450, 320, 100, 20, 'movingVertical'),
            new Platform(600, 250, 120, 20, 'movingHorizontal'),
            new Platform(150, 400, 100, 20, 'static'),
            new Platform(350, 300, 80, 20, 'static'),
            new Platform(500, 180, 100, 20, 'movingVertical'),
            new Platform(200, 280, 120, 20, 'static'),
            new Platform(700, 350, 80, 20, 'static'),
            new Platform(50, 350, 80, 20, 'static'),
        ];
    }
    
    createSkullsLevel3() {
        return [
            new Skull(100, 200),
            new Skull(325, 160),
            new Skull(500, 300),
            new Skull(650, 230),
            new Skull(200, 380),
            new Skull(390, 280),
            new Skull(550, 160),
            new Skull(250, 260),
            new Skull(740, 330),
        ];
    }

    render() {
        // Очистка экрана
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Фон
        if (this.background.draw) {
            this.background.draw(this.ctx);
        }
        
        // Если игра активна - рисуем игровые объекты
        if (this.gameState === 'playing' || this.gameState === 'gameOver') {
            // Платформы
            this.platforms.forEach(platform => {
                if (platform.draw) platform.draw(this.ctx);
            });
            
            // Черепа
            this.skulls.forEach(skull => {
                if (skull.draw) skull.draw(this.ctx);
            });
            
            // Эффекты
            if (this.tempParticles) {
                this.tempParticles.forEach(particle => {
                    if (particle.draw && particle.life > 0) {
                        particle.draw(this.ctx);
                    }
                });
                this.tempParticles = this.tempParticles.filter(p => p.life > 0);
            }
            
            // Игрок
            if (this.player.draw) {
                this.player.draw(this.ctx);
            }
            
            // UI
            this.renderUI();
        }
        
        // Экран смерти
        if (this.gameState === 'gameOver') {
            this.renderGameOverScreen();
        }
        
        // Экран паузы
        if (this.gameState === 'paused') {
            this.renderPauseScreen();
        }
        
        // Экран завершения уровня (адский)
        if (this.gameState === 'levelComplete') {
            this.renderHellLevelCompleteScreen();
        }
        
        // Экран завершения игры (финальный ад)
        if (this.gameState === 'gameComplete') {
            this.renderHellGameCompleteScreen();
        }
    }
    
    renderGameOverScreen() {
        // Кроваво-черное затемнение
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, 'rgba(139, 0, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Трещины ада
        this.drawHellCracks(this.ctx);
        
        // Текст
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 56px "Arial Black", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('ДЕМОН ПАЛ!', this.width / 2, this.height / 2 - 100);
        
        this.ctx.fillStyle = '#FF4500';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText('Лава поглотила тебя...', this.width / 2, this.height / 2 - 30);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '28px Arial';
        this.ctx.fillText('Возрождение через мгновение...', this.width / 2, this.height / 2 + 20);
        
        // Пламя внизу
        this.drawBottomFlames(this.ctx);
        
        // Падающие угли
        this.drawFallingEmbers(this.ctx);
    }
    
    renderHellLevelCompleteScreen() {
        // Адский градиент
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width
        );
        gradient.addColorStop(0, 'rgba(255, 69, 0, 0.8)');
        gradient.addColorStop(0.4, 'rgba(139, 0, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Вращающийся адский портал
        this.drawHellPortal(this.ctx, this.width / 2, this.height / 2 - 50);
        
        // Частицы черепов
        this.drawSkullParticles(this.ctx);
        
        // Огненные частицы
        this.drawFireParticles(this.ctx);
        
        // Текст с огненным эффектом
        const time = this.screenTime;
        const pulse = 0.7 + Math.sin(time * 3) * 0.3;
        
        // Заголовок
        this.ctx.save();
        this.ctx.shadowColor = '#FF0000';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.fillStyle = `rgba(255, ${Math.floor(100 + pulse * 100)}, 0, 1)`;
        this.ctx.font = 'bold 64px "Arial Black", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('УРОВЕНЬ ПОКОРЁН!', this.width / 2, 250);
        this.ctx.restore();
        
        // Номер уровня в портале
        
        // Статистика
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillText(`Собрано черепов: ${this.collectedSkulls}/${this.totalSkulls}`, 
                         this.width / 4, this.height / 2 + 60);
        
        // Следующий уровень
        if (this.currentLevel < this.totalLevels) {
            this.ctx.fillStyle = '#f1cec4';
            this.ctx.font = '28px Arial';
            this.ctx.fillText(`Врата уровня ${this.currentLevel + 1} открываются...`, 
                             this.width / 4, this.height - 100);
            
        }
        
        // Пламя по краям
        this.drawSideFlames(this.ctx);
    }
    
    renderHellGameCompleteScreen() {
        // Финальный адский градиент
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, Math.max(this.width, this.height)
        );
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(0.3, '#FF4500');
        gradient.addColorStop(0.6, '#8B0000');
        gradient.addColorStop(1, '#000000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        
        // Блуждающие души (частицы)
        this.drawLostSouls(this.ctx);
        
        // Лавовые реки
        this.drawLavaRivers(this.ctx);
        
        // Частицы черепов
        this.drawSkullParticles(this.ctx);
        
        // Огненные частицы
        this.drawFireParticles(this.ctx);
        
        
        const time = this.screenTime;
		const pulse = 0.5 + Math.sin(time * 4) * 0.5;
        
        
        // Подзаголовок
        this.ctx.save();
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillText('Все черепа собраны!', 155, 300);
        this.ctx.restore();
        
        // Статистика
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillText(`Итоговый счёт: ${this.score}`, 230, 350);
        
        
        // Инструкция
        this.ctx.fillStyle = '#f1cec4';
        this.ctx.font = '28px Arial';
        this.ctx.fillText('Нажми R, чтобы вновь бросить вызов аду', 130, 500);
        
    }
    
    drawHellPortal(ctx, x, y) {
        const time = this.screenTime;
        
        // Внешнее кольцо портала
        for (let i = 0; i < 3; i++) {
            const ringSize = 150 + i * 40;
            const rotation = time * (0.5 + i * 0.2);
            const alpha = 0.3 - i * 0.1;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.globalAlpha = alpha;
            
            // Кольцо
            ctx.strokeStyle = i === 0 ? '#FF0000' : (i === 1 ? '#FF4500' : '#FFD700');
            ctx.lineWidth = 8 - i * 2;
            
            ctx.beginPath();
            ctx.arc(0, 0, ringSize, 0, Math.PI * 2);
            ctx.stroke();
            
            // Руны на кольце
            for (let j = 0; j < 8; j++) {
                const angle = (j * Math.PI) / 4;
                const runeX = Math.cos(angle) * ringSize;
                const runeY = Math.sin(angle) * ringSize;
                
                ctx.save();
                ctx.translate(runeX, runeY);
                ctx.rotate(angle + Math.PI/2);
                
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('†', 0, 0);
                
                ctx.restore();
            }
            
            ctx.restore();
        }
        
        // Внутренний вихрь
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-time * 2);
        
        const vortexGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
        vortexGradient.addColorStop(0, '#FF0000');
        vortexGradient.addColorStop(0.5, '#FF4500');
        vortexGradient.addColorStop(1, 'rgba(139, 0, 0, 0)');
        
        ctx.fillStyle = vortexGradient;
        ctx.beginPath();
        
        // Спиральный вихрь
        for (let i = 0; i <= 20; i++) {
            const angle = i * 0.3 + time * 3;
            const radius = 100 * (i / 20);
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    
    
    
    drawSkullParticles(ctx) {
        this.skullParticles.forEach(particle => {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.globalAlpha = 0.8;
            
            // Череп
            ctx.fillStyle = '#F5F5F5';
            ctx.beginPath();
            ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Глазницы
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(-particle.size * 0.3, -particle.size * 0.1, particle.size * 0.2, 0, Math.PI * 2);
            ctx.arc(particle.size * 0.3, -particle.size * 0.1, particle.size * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Огненные глазницы для некоторых
            if (particle.type === 1) {
                const flameSize = particle.size * 0.3;
                ctx.fillStyle = '#FF4500';
                ctx.beginPath();
                ctx.arc(-particle.size * 0.3, -particle.size * 0.1, flameSize, 0, Math.PI * 2);
                ctx.arc(particle.size * 0.3, -particle.size * 0.1, flameSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
    }
    
    drawFireParticles(ctx) {
        this.fireParticles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life / 60;
            
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(0.7, '#FF8C00');
            gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    drawHellCracks(ctx) {
        const time = this.screenTime;
        
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        
        // Случайные трещины по экрану
        for (let i = 0; i < 5; i++) {
            const startX = Math.random() * this.width;
            const startY = Math.random() * this.height;
            const segments = 3 + Math.floor(Math.random() * 4);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            for (let j = 0; j < segments; j++) {
                const endX = startX + (Math.random() - 0.5) * 200;
                const endY = startY + Math.random() * 100;
                ctx.lineTo(endX, endY);
            }
            
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }
    
    drawBottomFlames(ctx) {
        const time = this.screenTime;
        const flameHeight = 60;
        
        for (let i = 0; i < this.width; i += 40) {
            const pulse = 0.5 + Math.sin(time * 3 + i * 0.1) * 0.5;
            const height = flameHeight * pulse;
            
            const gradient = ctx.createLinearGradient(
                i, this.height,
                i, this.height - height
            );
            gradient.addColorStop(0, '#FFFF00');
            gradient.addColorStop(0.3, '#FF4500');
            gradient.addColorStop(0.7, '#8B0000');
            gradient.addColorStop(1, 'rgba(139, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(i - 20, this.height - height, 40, height);
        }
    }
    
    drawSideFlames(ctx) {
        const time = this.screenTime;
        const flameWidth = 40;
        
        // Левое пламя
        for (let i = 0; i < this.height; i += 30) {
            const pulse = 0.4 + Math.sin(time * 2 + i * 0.1) * 0.3;
            const width = flameWidth * pulse;
            
            const gradient = ctx.createLinearGradient(
                0, i,
                width, i
            );
            gradient.addColorStop(0, '#FF0000');
            gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, i - 15, width, 30);
        }
        
        // Правое пламя
        for (let i = 0; i < this.height; i += 30) {
            const pulse = 0.4 + Math.sin(time * 2.5 + i * 0.1) * 0.3;
            const width = flameWidth * pulse;
            
            const gradient = ctx.createLinearGradient(
                this.width, i,
                this.width - width, i
            );
            gradient.addColorStop(0, '#FF0000');
            gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(this.width - width, i - 15, width, 30);
        }
    }
    
    drawFallingEmbers(ctx) {
        const time = this.screenTime;
        
        for (let i = 0; i < 20; i++) {
            const emberX = (time * 50 + i * 50) % this.width;
            const emberY = (time * 100 + i * 30) % this.height;
            const size = 1 + Math.sin(time * 2 + i) * 0.5;
            const alpha = 0.3 + Math.sin(time * 3 + i) * 0.2;
            
            ctx.fillStyle = `rgba(255, ${100 + Math.sin(time + i) * 100}, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(emberX, emberY, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawLostSouls(ctx) {
        const time = this.screenTime;
        
        for (let i = 0; i < 8; i++) {
            const soulX = (time * 20 + i * 100) % this.width;
            const soulY = 100 + Math.sin(time * 2 + i) * 50;
            const size = 3 + Math.sin(time * 3 + i) * 2;
            const alpha = 0.4 + Math.sin(time * 1.5 + i) * 0.3;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.arc(soulX, soulY, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Хвост души
            ctx.beginPath();
            ctx.moveTo(soulX, soulY);
            ctx.lineTo(soulX - 10, soulY + 10);
            ctx.lineTo(soulX - 5, soulY + 15);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#87CEEB';
            ctx.stroke();
            ctx.restore();
        }
    }
    
    drawLavaRivers(ctx) {
        const time = this.screenTime;
        
        // Река 1
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        for (let x = 0; x < this.width; x += 10) {
            const y = 400 + Math.sin((x + time * 50) * 0.01) * 20;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Река 2
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 6;
        
        ctx.beginPath();
        for (let x = 0; x < this.width; x += 10) {
            const y = 450 + Math.sin((x + time * 30 + 100) * 0.015) * 15;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    drawFlickeringRunes(ctx) {
        const time = this.screenTime;
        const runes = ['†', '‡', '¥', 'µ', '§', '¶', '•', 'ª'];
        
        for (let i = 0; i < runes.length; i++) {
            const runeX = 50 + i * 100;
            const runeY = this.height - 150;
            const alpha = 0.3 + Math.sin(time * 2 + i) * 0.3;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(runes[i], runeX, runeY);
            ctx.restore();
        }
    }

    renderUI() {
        // Фон для UI (полупрозрачный черный)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(15, 15, 250, 80);
        
        // Красная окантовка
        this.ctx.strokeStyle = '#8B0000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(15, 15, 250, 80);
        
        // Текст
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        
        // Уровень с огненным эффектом
        const time = Date.now() * 0.001;
        const pulse = 0.5 + Math.sin(time * 3) * 0.3;
        this.ctx.fillStyle = `rgba(255, ${Math.floor(100 + pulse * 100)}, 0, 1)`;
        this.ctx.fillText(`Уровень: ${this.currentLevel}/${this.totalLevels}`, 60, 42);
        
        // Очки и черепа
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText(`🔥 ${this.score}  💀 ${this.collectedSkulls}/${this.totalSkulls}`, 45, 75);
    }

    renderPauseScreen() {
        // Полупрозрачное затемнение
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Огненная рамка
        this.ctx.strokeStyle = '#FF4500';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(50, 50, this.width - 100, this.height - 100);
        
        // Текст
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 56px "Arial Black", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('ВСЁ ЗАМЕРЛО', this.width / 2, this.height / 2 - 80);
        
        this.ctx.fillStyle = '#ff4500';
        this.ctx.font = '28px Arial';
        this.ctx.fillText('Нажмите P, чтобы продолжить', this.width / 2, this.height / 2);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Уровень: ${this.currentLevel} | Черепа: ${this.collectedSkulls}/${this.totalSkulls}`, 
                         this.width / 2, this.height / 2 + 60);
    }
    
    createSkullCollectionEffect(x, y) {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const particle = {
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10 - 5,
                    life: 40,
                    size: 2 + Math.random() * 4,
                    color: i % 3 === 0 ? '#FFD700' : (i % 3 === 1 ? '#FF4500' : '#8B0000'),
                    draw: (ctx) => {
                        ctx.fillStyle = particle.color;
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                        ctx.fill();
                        
                        particle.x += particle.vx;
                        particle.y += particle.vy;
                        particle.vx *= 0.93;
                        particle.vy *= 0.93;
                        particle.life--;
                    }
                };
                
                this.tempParticles = this.tempParticles || [];
                this.tempParticles.push(particle);
                
                setTimeout(() => {
                    if (this.tempParticles) {
                        const index = this.tempParticles.indexOf(particle);
                        if (index > -1) {
                            this.tempParticles.splice(index, 1);
                        }
                    }
                }, 800);
            }, i * 25);
        }
    }

    restart() {
        console.log('Рестарт игры');
        this.currentLevel = 1;
        this.loadLevel(this.currentLevel);
        this.gameState = 'playing';
        this.levelCompleted = false;
        this.confetti = null;
        this.skullParticles = [];
        this.fireParticles = [];
        
        // Очищаем таймер если есть
        if (this.levelCompleteTimer) {
            clearTimeout(this.levelCompleteTimer);
            this.levelCompleteTimer = null;
        }
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
}