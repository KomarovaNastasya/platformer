
class Player {
    constructor(game) {
        this.game = game;
        this.width = 32;
        this.height = 42;
        this.x = 100;
        this.y = 180;
        
        this.vx = 0;
        this.vy = 0;
        this.speed = 5.2;
        this.jumpPower = -13;
        this.gravity = 0.8;
        this.friction = 0.85;
        this.onGround = false;
        this.jumping = false;
        
        // Для работы с движущимися платформами
        this.onMovingPlatform = false;
        this.platformVelocityY = 0;
        
        // Для анимации огня/свечения
        this.flameAnimation = 0;
        this.flameSpeed = 0.1;
        
        // Для анимации рогов (небольшое движение)
        this.hornPulse = 0;
        this.hornPulseSpeed = 0.05;
        
        console.log('Демон создан! 🔥');
    }

    update(input, platforms) {
        // Анимация пламени
        this.flameAnimation += this.flameSpeed;
        
        // Анимация пульсации рогов
        this.hornPulse += this.hornPulseSpeed;
        if (this.hornPulse > Math.PI * 2) {
            this.hornPulse = 0;
        }
        
        // Горизонтальное движение
        if (input && input.keys) {
            if (input.keys.left) {
                this.vx = -this.speed;
            } else if (input.keys.right) {
                this.vx = this.speed;
            } else {
                this.vx *= this.friction;
                if (Math.abs(this.vx) < 0.2) this.vx = 0;
            }

            // Прыжок с эффектом пламени
            if (input.keys.jump && this.onGround && !this.jumping) {
                this.vy = this.jumpPower;
                this.onGround = false;
                this.jumping = true;
                this.onMovingPlatform = false;
                this.platformVelocityY = 0;
                
                // Эффект пламени при прыжке
                this.createJumpFlameEffect();
            }
        }

        // Гравитация (если не на движущейся платформе)
        if (!this.onGround || !this.onMovingPlatform) {
            this.vy += this.gravity;
        }
        
        // Ограничение скорости
        if (this.vy > 15) this.vy = 15;
        if (this.vy < -20) this.vy = -20;
        
        // Если на движущейся платформе, учитываем ее скорость
        if (this.onMovingPlatform) {
            this.vy = this.platformVelocityY;
        }
        
        // Обновление позиции
        this.x += this.vx;
        this.y += this.vy;
        
        // Сбрасываем состояние прыжка
        if (this.vy > 0) {
            this.jumping = false;
        }
    }
    
    createJumpFlameEffect() {
        // Создаем эффект пламени при прыжке
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const particle = {
                    x: this.x + this.width / 2,
                    y: this.y + this.height,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.7) * 2 - 2,
                    life: 25,
                    size: 2 + Math.random() * 4,
                    draw: (ctx) => {
                        const alpha = particle.life / 25;
                        // Градиент цвета пламени
                        const flameColor = `rgba(255, ${100 + Math.random() * 100}, 0, ${alpha * 0.8})`;
                        ctx.fillStyle = flameColor;
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                        ctx.fill();
                        
                        particle.x += particle.vx;
                        particle.y += particle.vy;
                        particle.vx *= 0.92;
                        particle.vy *= 0.92;
                        particle.life--;
                    }
                };
                
                this.game.tempParticles = this.game.tempParticles || [];
                this.game.tempParticles.push(particle);
            }, i * 20);
        }
    }

    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // ✅ ТЕЛО ДЕМОНА (округляем)
        const bodyColor = this.onGround ? '#8B0000' : '#a90f2e';
        if (this.onMovingPlatform) {
            ctx.fillStyle = '#FF4500';
        } else {
            ctx.fillStyle = bodyColor;
        }
        
        // Округлое тело вместо прямоугольника
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 8);
        ctx.fill();
        
        // Мышечный рельеф (тоже округлый)
        ctx.fillStyle = this.onGround ? '#A52A2A' : '#FF6347';
        // Грудь
        ctx.beginPath();
        ctx.roundRect(this.x + 6, this.y + 10, this.width - 12, 8, 4);
        ctx.fill();
        // Пресс
        ctx.beginPath();
        ctx.roundRect(this.x + 8, this.y + 25, this.width - 16, 6, 3);
        ctx.fill();
        
        // ✅ РОГА (более округлые)
        this.drawHorns(ctx);
        
        // ✅ ХВОСТ (более плавный)
        this.drawTail(ctx);
        
        // ✅ КРЫЛЬЯ (более округлые)
        this.drawWings(ctx);
        
        // ✅ КОНТУР (округлый)
        ctx.strokeStyle = this.onGround ? '#5D0000' : '#B22222';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 8);
        ctx.stroke();
        
        // ✅ ГЛАЗА (округлые)
        ctx.fillStyle = '#FFD700';
        // Левый глаз
        ctx.beginPath();
        ctx.arc(this.x + 11, this.y + 13, 5, 0, Math.PI * 2);
        ctx.fill();
        // Правый глаз
        ctx.beginPath();
        ctx.arc(this.x + 21, this.y + 13, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Свечение глаз
        ctx.save();
        ctx.globalAlpha = 0.4 + Math.sin(this.flameAnimation * 2) * 0.3;
        ctx.fillStyle = '#FF4500';
        // Левое свечение
        ctx.beginPath();
        ctx.arc(this.x + 11, this.y + 13, 7, 0, Math.PI * 2);
        ctx.fill();
        // Правое свечение
        ctx.beginPath();
        ctx.arc(this.x + 21, this.y + 13, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Зрачки
        ctx.fillStyle = '#000';
        const pupilOffset = Math.sign(this.vx) * 1.5;
        const pupilOffsetY = this.vy < 0 ? -1 : (this.vy > 0 ? 1 : 0);
        // Левый зрачок
        ctx.beginPath();
        ctx.arc(this.x + 11 + pupilOffset, this.y + 13 + pupilOffsetY, 2, 0, Math.PI * 2);
        ctx.fill();
        // Правый зрачок
        ctx.beginPath();
        ctx.arc(this.x + 21 + pupilOffset, this.y + 13 + pupilOffsetY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Блики в глазах
        ctx.fillStyle = '#FFFFFF';
        // Левый блик
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 12, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Правый блик
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 12, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // ✅ РОТ (округляем)
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        if (this.onGround) {
            // Улыбка на земле
            ctx.arc(this.x + 16, this.y + 28, 6, 0.2 * Math.PI, 0.8 * Math.PI);
        } else {
            // Более открытый рот в воздухе
            ctx.arc(this.x + 16, this.y + 28, 7, 0.1 * Math.PI, 0.9 * Math.PI);
        }
        ctx.stroke();
        
        // Клыки (округлые)
        ctx.fillStyle = '#FFFFFF';
        // Левый клык
        ctx.beginPath();
        ctx.ellipse(this.x + 10, this.y + 26, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Правый клык
        ctx.beginPath();
        ctx.ellipse(this.x + 22, this.y + 26, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // ✅ ПЛАМЯ НА РОГАХ И ПЛЕЧАХ
        if (!this.onGround || Math.abs(this.vx) > 0.5) {
            this.drawFlames(ctx);
        }
        
    }
    
    drawHorns(ctx) {
        const hornPulseFactor = Math.sin(this.hornPulse) * 0.5;
        
        // Левый рог (более округлый)
        ctx.save();
        ctx.translate(this.x + 9, this.y - 3);
        
        // Градиент для рога
        const hornGradient = ctx.createLinearGradient(0, 0, 0, -18);
        hornGradient.addColorStop(0, '#2F4F4F');
        hornGradient.addColorStop(0.5, '#696969');
        hornGradient.addColorStop(1, '#1C1C1C');
        
        ctx.fillStyle = hornGradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        // Округляем рог
        ctx.bezierCurveTo(
            -5 - hornPulseFactor, -8,
            -3 - hornPulseFactor, -16,
            0, -18
        );
        ctx.bezierCurveTo(
            3 + hornPulseFactor, -16,
            5 + hornPulseFactor, -8,
            0, 0
        );
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // Правый рог
        ctx.save();
        ctx.translate(this.x + 23, this.y - 3);
        
        ctx.fillStyle = hornGradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
            -5 - hornPulseFactor, -8,
            -3 - hornPulseFactor, -16,
            0, -18
        );
        ctx.bezierCurveTo(
            3 + hornPulseFactor, -16,
            5 + hornPulseFactor, -8,
            0, 0
        );
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    drawTail(ctx) {
        const tailX = this.x + this.width;
        const tailY = this.y + this.height - 8;
        const tailLength = 22;
        
        ctx.save();
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        
        // Более плавный извилистый хвост
        for (let i = 1; i <= 5; i++) {
            const t = i / 5;
            const segmentX = tailX + i * 4.5;
            const wave = Math.sin(this.flameAnimation * 2 + i) * 4;
            const segmentY = tailY - i * 2.2 + wave;
            
            if (i === 1) {
                ctx.lineTo(segmentX, segmentY);
            } else {
                // Используем кривые Безье для плавности
                const prevX = tailX + (i-1) * 4.5;
                const prevY = tailY - (i-1) * 2.2 + Math.sin(this.flameAnimation * 2 + i-1) * 4;
                const cp1x = prevX + 2;
                const cp1y = prevY + 1;
                const cp2x = segmentX - 2;
                const cp2y = segmentY - 1;
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, segmentX, segmentY);
            }
        }
        
        ctx.stroke();
        
        // Наконечник хвоста (округлый треугольник)
        const tipX = tailX + 26;
        const tipY = tailY - 11 + Math.sin(this.flameAnimation * 2 + 5) * 3;
        
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        // Округляем наконечник
        ctx.bezierCurveTo(tipX + 7, tipY - 4, tipX + 7, tipY + 4, tipX, tipY);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    drawWings(ctx) {
        const wingY = this.y + 12;
        const wingSize = 16;
        
        // Более округлые крылья
        ctx.save();
        const wingGradient = ctx.createLinearGradient(
            this.x - 5, wingY,
            this.x - 20, wingY + 15
        );
        wingGradient.addColorStop(0, 'rgba(139, 0, 0, 0.8)');
        wingGradient.addColorStop(1, 'rgba(178, 34, 34, 0.6)');
        
        // Левое крыло
        ctx.fillStyle = wingGradient;
        ctx.beginPath();
        ctx.moveTo(this.x - 3, wingY);
        // Округляем крыло
        ctx.bezierCurveTo(
            this.x - 18, wingY + 6,
            this.x - 16, wingY + 18,
            this.x - 3, wingY + 12
        );
        ctx.bezierCurveTo(
            this.x - 10, wingY + 15,
            this.x - 14, wingY + 10,
            this.x - 3, wingY
        );
        ctx.closePath();
        ctx.fill();
        
        // Правое крыло
        ctx.beginPath();
        ctx.moveTo(this.x + this.width + 3, wingY);
        ctx.bezierCurveTo(
            this.x + this.width + 18, wingY + 6,
            this.x + this.width + 16, wingY + 18,
            this.x + this.width + 3, wingY + 12
        );
        ctx.bezierCurveTo(
            this.x + this.width + 10, wingY + 15,
            this.x + this.width + 14, wingY + 10,
            this.x + this.width + 3, wingY
        );
        ctx.closePath();
        ctx.fill();
        
        // Детали крыльев (округлые кости)
        ctx.strokeStyle = 'rgba(205, 92, 92, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        
        // Левое крыло детали
        ctx.beginPath();
        ctx.moveTo(this.x - 3, wingY + 3);
        ctx.bezierCurveTo(
            this.x - 12, wingY + 9,
            this.x - 10, wingY + 14,
            this.x - 3, wingY + 10
        );
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x - 3, wingY + 6);
        ctx.bezierCurveTo(
            this.x - 15, wingY + 11,
            this.x - 13, wingY + 16,
            this.x - 3, wingY + 12
        );
        ctx.stroke();
        
        // Правое крыло детали
        ctx.beginPath();
        ctx.moveTo(this.x + this.width + 3, wingY + 3);
        ctx.bezierCurveTo(
            this.x + this.width + 12, wingY + 9,
            this.x + this.width + 10, wingY + 14,
            this.x + this.width + 3, wingY + 10
        );
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width + 3, wingY + 6);
        ctx.bezierCurveTo(
            this.x + this.width + 15, wingY + 11,
            this.x + this.width + 13, wingY + 16,
            this.x + this.width + 3, wingY + 12
        );
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawFlames(ctx) {
        const flameSize = 3 + Math.sin(this.flameAnimation * 3) * 2;
        
        // Пламя на рогах
        ctx.save();
        
        // Левое пламя (более округлое)
        const leftFlame = ctx.createRadialGradient(
            this.x + 9, this.y - 20, 0,
            this.x + 9, this.y - 20, flameSize * 1.8
        );
        leftFlame.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
        leftFlame.addColorStop(0.4, 'rgba(255, 140, 0, 0.7)');
        leftFlame.addColorStop(0.8, 'rgba(255, 69, 0, 0.4)');
        leftFlame.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        // Правое пламя
        const rightFlame = ctx.createRadialGradient(
            this.x + 23, this.y - 20, 0,
            this.x + 23, this.y - 20, flameSize * 1.6
        );
        rightFlame.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
        rightFlame.addColorStop(0.4, 'rgba(255, 140, 0, 0.7)');
        rightFlame.addColorStop(0.8, 'rgba(255, 69, 0, 0.4)');
        rightFlame.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        // Левое пламя
        ctx.fillStyle = leftFlame;
        ctx.beginPath();
        // Округляем пламя
        ctx.ellipse(this.x + 9, this.y - 20, flameSize, flameSize * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Правое пламя
        ctx.fillStyle = rightFlame;
        ctx.beginPath();
        ctx.ellipse(this.x + 23, this.y - 20, flameSize * 0.9, flameSize * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Пламя на плечах (более округлое)
        const shoulderFlameSize = 2 + Math.sin(this.flameAnimation * 2 + 1) * 1.5;
        
        const leftShoulderFlame = ctx.createRadialGradient(
            this.x + 6, this.y + 8, 0,
            this.x + 6, this.y + 8, shoulderFlameSize * 1.8
        );
        leftShoulderFlame.addColorStop(0, 'rgba(255, 220, 0, 0.8)');
        leftShoulderFlame.addColorStop(0.7, 'rgba(255, 140, 0, 0.5)');
        leftShoulderFlame.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        const rightShoulderFlame = ctx.createRadialGradient(
            this.x + this.width - 6, this.y + 8, 0,
            this.x + this.width - 6, this.y + 8, shoulderFlameSize * 1.8
        );
        rightShoulderFlame.addColorStop(0, 'rgba(255, 220, 0, 0.8)');
        rightShoulderFlame.addColorStop(0.7, 'rgba(255, 140, 0, 0.5)');
        rightShoulderFlame.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        // Левое плечо
        ctx.fillStyle = leftShoulderFlame;
        ctx.beginPath();
        ctx.ellipse(this.x + 6, this.y + 8, shoulderFlameSize, shoulderFlameSize * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Правое плечо
        ctx.fillStyle = rightShoulderFlame;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width - 6, this.y + 8, shoulderFlameSize, shoulderFlameSize * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}