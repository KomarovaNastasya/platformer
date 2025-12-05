
class Skull {
    constructor(x, y, size = 28) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.collected = false;
        
        // Плавное парение
        this.floatOffset = Math.random() * Math.PI * 2;
        this.floatSpeed = 0.03;
        this.floatAmplitude = 4;
        this.currentY = y;
        
        // Для анимации вращения и пульсации
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.05;
        
        // Яркость свечения
        this.glowIntensity = 0.5 + Math.random() * 0.5;
        
        console.log(`💀 Эмоджи-череп создан в позиции (${x}, ${y})`);
    }

    update(deltaTime) {
        if (!this.collected) {
            // Плавное парение
            this.floatOffset += this.floatSpeed;
            this.currentY = this.y + Math.sin(this.floatOffset) * this.floatAmplitude;
            
            // Медленное вращение
            this.rotation += this.rotationSpeed;
            
            // Пульсация
            this.pulseOffset += this.pulseSpeed;
        }
    }

    draw(ctx) {
        if (this.collected) return;
        
        const centerX = this.x;
        const centerY = this.currentY;
        const pulse = 0.9 + Math.sin(this.pulseOffset) * 0.1;
        
        // Сначала рисуем свечение
        this.drawGlow(ctx, centerX, centerY, pulse);
        
        // Затем сам эмоджи
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        ctx.scale(pulse, pulse);
        
        // Рисуем эмоджи 💀
        this.drawEmojiSkull(ctx);
        
        ctx.restore();
    }
    
    drawGlow(ctx, x, y, pulse) {
        const time = Date.now() * 0.001;
        const glowPulse = 0.6 + Math.sin(time * 2) * 0.2;
        const intensity = this.glowIntensity * pulse * glowPulse;
        
        // Внешнее желтое свечение
        const outerGlow = ctx.createRadialGradient(
            x, y, 0,
            x, y, this.size * 3
        );
        outerGlow.addColorStop(0, `rgba(255, 255, 100, ${0.3 * intensity})`);
        outerGlow.addColorStop(0.5, `rgba(255, 200, 50, ${0.15 * intensity})`);
        outerGlow.addColorStop(1, 'rgba(255, 150, 0, 0)');
        
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(x, y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Внутреннее оранжевое свечение
        const innerGlow = ctx.createRadialGradient(
            x, y, 0,
            x, y, this.size * 2
        );
        innerGlow.addColorStop(0, `rgba(255, 200, 0, ${0.5 * intensity})`);
        innerGlow.addColorStop(0.7, `rgba(255, 100, 0, ${0.2 * intensity})`);
        innerGlow.addColorStop(1, 'rgba(255, 50, 0, 0)');
        
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(x, y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Белое ядро свечения
        const coreGlow = ctx.createRadialGradient(
            x, y, 0,
            x, y, this.size * 1.2
        );
        coreGlow.addColorStop(0, `rgba(255, 255, 255, ${0.4 * intensity})`);
        coreGlow.addColorStop(1, 'rgba(255, 255, 200, 0)');
        
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(x, y, this.size * 1.2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawEmojiSkull(ctx) {
        // Основной круг (белая голова)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Черный контур (толстый как в эмоджи)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.stroke();
        
        // Глазницы (большие черные овалы)
        ctx.fillStyle = '#000000';
        
        // Левая глазница
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.25, -this.size * 0.05, 
                    this.size * 0.15, this.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Правая глазница
        ctx.beginPath();
        ctx.ellipse(this.size * 0.25, -this.size * 0.05, 
                    this.size * 0.15, this.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Нос (перевернутый сердечко или треугольник)
        ctx.beginPath();
        ctx.moveTo(0, this.size * 0.1);
        ctx.lineTo(-this.size * 0.1, this.size * 0.25);
        ctx.quadraticCurveTo(0, this.size * 0.35, this.size * 0.1, this.size * 0.25);
        ctx.closePath();
        ctx.fill();
        
        // Рот (зигзагообразная улыбка как в эмоджи)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.35, this.size * 0.45);
        
        // Зигзаг: вниз-вверх-вниз-вверх-вниз
        ctx.lineTo(-this.size * 0.25, this.size * 0.55);
        ctx.lineTo(-this.size * 0.15, this.size * 0.45);
        ctx.lineTo(-this.size * 0.05, this.size * 0.55);
        ctx.lineTo(this.size * 0.05, this.size * 0.45);
        ctx.lineTo(this.size * 0.15, this.size * 0.55);
        ctx.lineTo(this.size * 0.25, this.size * 0.45);
        ctx.lineTo(this.size * 0.35, this.size * 0.55);
        
        ctx.stroke();
        
        // Добавляем небольшие трещинки для детализации
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        
        // Маленькая трещинка на лбу
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.1, -this.size * 0.3);
        ctx.lineTo(0, -this.size * 0.4);
        ctx.lineTo(this.size * 0.1, -this.size * 0.35);
        ctx.stroke();
        
        // Блеск в глазах (белые блики)
        ctx.fillStyle = '#FFFFFF';
        
        // Левый блик
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.3, -this.size * 0.15, 
                    this.size * 0.04, this.size * 0.06, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Правый блик
        ctx.beginPath();
        ctx.ellipse(this.size * 0.2, -this.size * 0.15, 
                    this.size * 0.04, this.size * 0.06, -0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Небольшая тень снизу для объема
        const shadowGradient = ctx.createRadialGradient(
            0, 0, this.size * 0.8,
            0, 0, this.size
        );
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        
        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    checkCollision(player) {
        if (this.collected) return false;
        
        // Используем текущую позицию черепа (с плавающей анимацией)
        const skullY = this.currentY || this.y;
        
        // Упрощенная проверка коллизии (круг с игроком-прямоугольником)
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        
        const dx = Math.abs(playerCenterX - this.x);
        const dy = Math.abs(playerCenterY - skullY);
        
        if (dx > (player.width / 2 + this.size)) return false;
        if (dy > (player.height / 2 + this.size)) return false;
        
        if (dx <= (player.width / 2)) return true;
        if (dy <= (player.height / 2)) return true;
        
        const cornerDistance = Math.pow(dx - player.width / 2, 2) + 
                              Math.pow(dy - player.height / 2, 2);
        
        return cornerDistance <= Math.pow(this.size, 2);
    }
    
    collect() {
        this.collected = true;
        console.log(`💀 Череп-эмоджи собран! +150 очков`);
        return 150;
    }
}