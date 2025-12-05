
class Platform {
    constructor(x, y, width, height, type = 'static', isBottomFloor = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.isBottomFloor = isBottomFloor; // Флаг для нижнего пола (лава)
        
        // Настройки для движущихся платформ
        this.speed = 2;
        this.direction = 1;
        this.originalX = x;
        this.originalY = y;
        this.range = 100;
        
        // Для анимации
        this.time = Math.random() * 100;
        this.crackAnimation = Math.random() * Math.PI * 2;
        
        // Цвета в адском стиле
        this.colors = {
            static: { 
                main: '#8B0000',      // Темно-красный
                light: '#B22222',     // Кирпично-красный
                dark: '#5D0000',      // Очень темно-красный
                crack: '#FF4500',     // Оранжево-красный для трещин
                glow: '#FF6347'       // Светящийся красный
            },
            movingHorizontal: { 
                main: '#DC143C',      // Малиновый
                light: '#FF6347',     // Помидорный
                dark: '#8B0000',      // Темно-красный
                crack: '#FF8C00',     // Темно-оранжевый
                glow: '#FF7F50',      // Коралловый
                energy: '#FFD700'     // Золотой для энергии
            },
            movingVertical: { 
                main: '#C71585',      // Средне-фиолетовый-красный
                light: '#DB7093',     // Бледно-фиолетовый-красный
                dark: '#8B008B',      // Темно-пурпурный
                crack: '#FF1493',     // Глубокий розовый
                glow: '#FF69B4',      // Горячий розовый
                energy: '#FF00FF'     // Пурпурный для энергии
            },
            bottomFloor: { 
                main: '#4a0000',      // Очень темно-красный
                light: '#8B0000',     // Темно-красный
                dark: '#2c0000',      // Почти черный красный
                lava: '#FF4500',      // Оранжево-красный
                core: '#FFD700',      // Золотой ядро лавы
                smoke: '#696969'      // Дым
            }
        };
    }

    update(deltaTime) {
        // Обновляем время для анимаций
        this.time += deltaTime / 1000;
        this.crackAnimation += 0.02;
        
        if (this.type === 'movingHorizontal') {
            this.x += this.speed * this.direction * (deltaTime / 16);
            
            if (this.x > this.originalX + this.range) {
                this.x = this.originalX + this.range;
                this.direction = -1;
            } else if (this.x < this.originalX) {
                this.x = this.originalX;
                this.direction = 1;
            }
        } else if (this.type === 'movingVertical') {
            this.y += this.speed * this.direction * (deltaTime / 16);
            
            if (this.y > this.originalY + this.range) {
                this.y = this.originalY + this.range;
                this.direction = -1;
            } else if (this.y < this.originalY) {
                this.y = this.originalY;
                this.direction = 1;
            }
        }
    }

    get currentVelocityY() {
        if (this.type === 'movingVertical') {
            return this.speed * this.direction;
        }
        return 0;
    }

    draw(ctx) {
        const colors = this.isBottomFloor ? this.colors.bottomFloor :
                      this.type === 'static' ? this.colors.static : 
                      this.type === 'movingHorizontal' ? this.colors.movingHorizontal : this.colors.movingVertical;
        
        // Глубокая тень (адская тьма)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(this.x + 4, this.y + 4, this.width, this.height);
        
        // Основная платформа в адском стиле
        if (this.isBottomFloor) {
            this.drawLavaFloor(ctx, colors);
        } else {
            this.drawHellPlatform(ctx, colors);
        }
        
        // Контур (огненный)
        this.drawFieryBorder(ctx, colors);
        
        // Свечение платформы (особенно для движущихся)
        if (this.type !== 'static') {
            this.drawPlatformGlow(ctx, colors);
        }
    }
    
    drawHellPlatform(ctx, colors) {
        const time = this.time;
        
        // Основная текстура платформы (обожженный камень)
        const mainGradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x, this.y + this.height
        );
        mainGradient.addColorStop(0, colors.main);
        mainGradient.addColorStop(0.5, colors.light);
        mainGradient.addColorStop(1, colors.dark);
        
        ctx.fillStyle = mainGradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Текстура трещин с лавой
        this.drawLavaCracks(ctx, colors);
        
        // Обгоревшие участки
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 0; i < this.width; i += 25) {
            const burnSize = 8 + Math.sin(time + i * 0.1) * 3;
            ctx.beginPath();
            ctx.arc(
                this.x + i + 10,
                this.y + this.height / 2,
                burnSize,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Металлические вставки/скобы
        if (this.type === 'movingHorizontal' || this.type === 'movingVertical') {
            this.drawMetalBrackets(ctx, colors);
        }
        
        // Рунические символы на движущихся платформах
        if (this.type !== 'static') {
            this.drawDemonicRunes(ctx, colors);
        }
    }
    
    drawLavaCracks(ctx, colors) {
        const time = this.time;
        
        // Вертикальные трещины с лавой
        for (let i = 0; i < 3; i++) {
            const crackX = this.x + this.width * (0.2 + i * 0.3);
            const crackWidth = 2 + Math.sin(time * 2 + i) * 1;
            const pulse = 0.5 + Math.sin(time * 3 + this.crackAnimation + i) * 0.5;
            
            // Свечение трещины
            const crackGradient = ctx.createLinearGradient(
                crackX, this.y,
                crackX, this.y + this.height
            );
            crackGradient.addColorStop(0, `rgba(255, 69, 0, ${0.2 + pulse * 0.3})`);
            crackGradient.addColorStop(0.5, `rgba(255, 140, 0, ${0.4 + pulse * 0.4})`);
            crackGradient.addColorStop(1, `rgba(255, 69, 0, ${0.2 + pulse * 0.3})`);
            
            ctx.fillStyle = crackGradient;
            ctx.fillRect(crackX - crackWidth/2, this.y, crackWidth, this.height);
            
            // Яркая сердцевина трещины
            ctx.fillStyle = `rgba(255, 215, 0, ${0.6 + pulse * 0.2})`;
            ctx.fillRect(crackX - 1, this.y, 2, this.height);
        }
        
        // Горизонтальные трещины
        for (let i = 0; i < 2; i++) {
            const crackY = this.y + this.height * (0.3 + i * 0.4);
            const crackHeight = 1 + Math.sin(time * 1.5 + i) * 0.5;
            const pulse = 0.4 + Math.sin(time * 2 + i * 2) * 0.3;
            
            ctx.fillStyle = `rgba(255, 100, 0, ${0.3 + pulse * 0.2})`;
            ctx.fillRect(this.x, crackY - crackHeight/2, this.width, crackHeight);
        }
    }
    
    drawMetalBrackets(ctx, colors) {
        const bracketCount = Math.floor(this.width / 40);
        
        ctx.fillStyle = '#2F4F4F'; // Темный стальной цвет
        ctx.strokeStyle = '#1C1C1C';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= bracketCount; i++) {
            const bracketX = this.x + (this.width * i / bracketCount);
            
            // Скоба
            ctx.fillRect(bracketX - 3, this.y - 2, 6, this.height + 4);
            
            // Болты
            ctx.fillStyle = '#696969';
            ctx.beginPath();
            ctx.arc(bracketX, this.y + 5, 2, 0, Math.PI * 2);
            ctx.arc(bracketX, this.y + this.height - 5, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Ржавчина
            ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
            ctx.fillRect(bracketX - 4, this.y + this.height/2 - 3, 8, 6);
            
            ctx.fillStyle = '#2F4F4F'; // Возвращаем цвет
        }
    }
    
    drawDemonicRunes(ctx, colors) {
        const runeCount = 3;
        const runeSize = 10;
        const time = this.time;
        
        for (let i = 0; i < runeCount; i++) {
            const runeX = this.x + this.width * (0.2 + i * 0.3);
            const runeY = this.y + this.height / 2;
            const pulse = 0.5 + Math.sin(time * 2 + i) * 0.5;
            
            // Свечение руны
            ctx.save();
            ctx.globalAlpha = 0.3 + pulse * 0.2;
            ctx.fillStyle = colors.glow;
            ctx.beginPath();
            ctx.arc(runeX, runeY, runeSize * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // Сама руна (простой демонический символ)
            ctx.save();
            ctx.translate(runeX, runeY);
            ctx.rotate(time + i);
            
            ctx.strokeStyle = colors.energy || colors.glow;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.8 + pulse * 0.2;
            
            // Треугольник с глазом
            ctx.beginPath();
            ctx.moveTo(0, -runeSize);
            ctx.lineTo(runeSize, runeSize);
            ctx.lineTo(-runeSize, runeSize);
            ctx.closePath();
            ctx.stroke();
            
            // Глаз в центре
            ctx.fillStyle = colors.energy || '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, runeSize/3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    drawPlatformGlow(ctx, colors) {
        const time = this.time;
        const glowSize = 10;
        const pulse = 0.3 + Math.sin(time * 3) * 0.2;
        
        // Свечение снизу (особенно для движущихся вертикально)
        if (this.type === 'movingVertical') {
            const glowGradient = ctx.createLinearGradient(
                this.x, this.y + this.height,
                this.x, this.y + this.height + glowSize
            );
            glowGradient.addColorStop(0, `rgba(255, 69, 0, ${0.5 + pulse * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
            
            ctx.fillStyle = glowGradient;
            ctx.fillRect(this.x, this.y + this.height, this.width, glowSize);
        }
        
        // Свечение по бокам для горизонтально движущихся
        if (this.type === 'movingHorizontal') {
            const sideGlow = ctx.createLinearGradient(
                this.x, this.y,
                this.x + (this.direction > 0 ? glowSize : -glowSize), this.y
            );
            sideGlow.addColorStop(0, `rgba(255, 215, 0, ${0.4 + pulse * 0.2})`);
            sideGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            ctx.fillStyle = sideGlow;
            if (this.direction > 0) {
                ctx.fillRect(this.x + this.width, this.y, glowSize, this.height);
            } else {
                ctx.fillRect(this.x - glowSize, this.y, glowSize, this.height);
            }
        }
    }
    
    drawFieryBorder(ctx, colors) {
        const time = this.time;
        
        // Основной контур
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Огненная окантовка
        for (let i = 0; i < 4; i++) {
            const pulse = 0.5 + Math.sin(time * 4 + i) * 0.5;
            const fireWidth = 1 + pulse * 2;
            
            ctx.strokeStyle = `rgba(255, ${100 + i * 40}, 0, ${0.7 + pulse * 0.3})`;
            ctx.lineWidth = fireWidth;
            
            // Верхняя грань
            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.width, this.y);
                ctx.stroke();
            }
            // Правая грань
            else if (i === 1) {
                ctx.beginPath();
                ctx.moveTo(this.x + this.width, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.stroke();
            }
            // Нижняя грань
            else if (i === 2) {
                ctx.beginPath();
                ctx.moveTo(this.x + this.width, this.y + this.height);
                ctx.lineTo(this.x, this.y + this.height);
                ctx.stroke();
            }
            // Левая грань
            else if (i === 3) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + this.height);
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
            }
        }
    }
    
    drawLavaFloor(ctx, colors) {
        const time = this.time;
        const pulse = 0.7 + Math.sin(time * 2) * 0.3;
        
        // Основной цвет лавы
        const lavaGradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x, this.y + this.height
        );
        lavaGradient.addColorStop(0, colors.main);
        lavaGradient.addColorStop(0.3, colors.light);
        lavaGradient.addColorStop(0.7, colors.lava);
        lavaGradient.addColorStop(1, colors.dark);
        
        ctx.fillStyle = lavaGradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Горящие ядра лавы
        for (let i = 0; i < Math.floor(this.width / 50); i++) {
            const coreX = this.x + 25 + i * 50;
            const coreY = this.y + this.height / 2;
            const coreSize = 12 + Math.sin(time * 3 + i) * 4;
            const corePulse = 0.6 + Math.sin(time * 4 + i * 2) * 0.4;
            
            // Внешнее свечение ядра
            const outerGlow = ctx.createRadialGradient(
                coreX, coreY, 0,
                coreX, coreY, coreSize * 2
            );
            outerGlow.addColorStop(0, `rgba(255, 215, 0, ${0.4 * corePulse})`);
            outerGlow.addColorStop(1, 'rgba(255, 69, 0, 0)');
            
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(coreX, coreY, coreSize * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Само ядро лавы
            const coreGradient = ctx.createRadialGradient(
                coreX - coreSize/3, coreY - coreSize/3, 0,
                coreX, coreY, coreSize
            );
            coreGradient.addColorStop(0, colors.core);
            coreGradient.addColorStop(0.7, colors.lava);
            coreGradient.addColorStop(1, colors.light);
            
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(coreX, coreY, coreSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Внутреннее свечение ядра
            ctx.fillStyle = `rgba(255, 255, 200, ${0.8 * corePulse})`;
            ctx.beginPath();
            ctx.arc(coreX - coreSize/4, coreY - coreSize/4, coreSize/3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Волны лавы
        ctx.strokeStyle = `rgba(255, 165, 0, ${0.6 + pulse * 0.2})`;
        ctx.lineWidth = 3;
        
        for (let w = 0; w < 2; w++) {
            ctx.beginPath();
            const waveOffset = time * 20 + w * 30;
            
            for (let x = this.x; x <= this.x + this.width; x += 5) {
                const waveHeight = Math.sin((x + waveOffset) * 0.05) * 4;
                const y = this.y + this.height/2 + waveHeight;
                
                if (x === this.x) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
        
        // Пузыри в лаве
        for (let i = 0; i < 10; i++) {
            const bubbleX = this.x + (time * 15 + i * 20) % this.width;
            const bubbleY = this.y + this.height/2 + Math.sin(time * 2 + i) * 5;
            const bubbleSize = 2 + Math.sin(time * 3 + i) * 2;
            const bubbleAlpha = 0.6 + Math.sin(time * 4 + i) * 0.3;
            
            // Пузырь
            ctx.fillStyle = `rgba(255, 200, 0, ${bubbleAlpha})`;
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Отражение на пузыре
            ctx.fillStyle = `rgba(255, 255, 255, ${bubbleAlpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(bubbleX - bubbleSize/3, bubbleY - bubbleSize/3, bubbleSize/3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Дым и пар от лавы
        this.drawLavaSmoke(ctx, colors, time);
        
    }
    
    drawLavaSmoke(ctx, colors, time) {
        for (let i = 0; i < 6; i++) {
            const smokeX = this.x + (time * 10 + i * 40) % this.width;
            const smokeY = this.y - 10 - Math.sin(time * 1.5 + i) * 8;
            const smokeSize = 5 + Math.sin(time * 2 + i) * 3;
            
            const smokeGradient = ctx.createRadialGradient(
                smokeX, smokeY, 0,
                smokeX, smokeY, smokeSize * 2
            );
            smokeGradient.addColorStop(0, `rgba(100, 100, 100, ${0.5 + Math.sin(time + i) * 0.2})`);
            smokeGradient.addColorStop(0.7, `rgba(50, 50, 50, ${0.2 + Math.sin(time + i) * 0.1})`);
            smokeGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = smokeGradient;
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, smokeSize * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Твердый центр дыма
            ctx.fillStyle = colors.smoke;
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
}