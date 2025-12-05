class Background {
    constructor(game) {
        this.game = game;
        
        // Параллакс слои
        this.layers = [];
        this.createHellLayers();
        
        // Текущее смещение
        this.offset = 0;
        
        // Для анимации
        this.time = 0;
        
        console.log('Адские скалы созданы! 🔥');
    }
    
    createHellLayers() {
        // Слой 1: Адское небо
        this.layers.push({
            speed: 0,
            draw: (ctx, offset) => {
                // Градиент адского неба
                const gradient = ctx.createLinearGradient(0, 0, 0, this.game.height);
                gradient.addColorStop(0, '#000000');          // Черный верх
                gradient.addColorStop(0.4, '#2c0000');       // Темно-бордовый
                gradient.addColorStop(0.8, '#8B0000');       // Темно-красный
                gradient.addColorStop(1, '#4a0000');         // Кроваво-красный низ
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, this.game.width, this.game.height);
                
                // Адская луна
                this.drawBloodMoon(ctx);
            }
        });
        
        // Слой 2: Дальние адские скалы
        this.layers.push({
            speed: 0.2,
            draw: (ctx, offset) => {
                ctx.fillStyle = 'rgba(88, 0, 0, 0.9)';
                this.drawHellMountains(ctx, offset * 0.2, 320, 100, 4, '#440000');
            }
        });
        
        // Слой 3: Средние адские скалы
        this.layers.push({
            speed: 0.4,
            draw: (ctx, offset) => {
                ctx.fillStyle = 'rgba(120, 0, 0, 0.95)';
                this.drawHellMountains(ctx, offset * 0.4, 380, 140, 5, '#660000');
                
            }
        });
        
        // Слой 4: Ближние адские скалы
        this.layers.push({
            speed: 0.6,
            draw: (ctx, offset) => {
                ctx.fillStyle = 'rgba(139, 0, 0, 1)';
                this.drawHellMountains(ctx, offset * 0.6, 420, 180, 6, '#8B0000');
                
            }
        });
        
        // Слой 5: Лавовое озеро (пол)
        this.layers.push({
            speed: 0,
            draw: (ctx, offset) => {
                this.drawLavaLake(ctx);
            }
        });
    }
    
    drawBloodMoon(ctx) {
        const time = Date.now() * 0.001;
        const moonX = this.game.width - 120;
        const moonY = 90;
        const moonSize = 40;
        const pulse = 0.8 + Math.sin(time * 0.5) * 0.2;
        
        // Внешнее свечение луны
        const outerGlow = ctx.createRadialGradient(
            moonX, moonY, moonSize,
            moonX, moonY, moonSize * 4
        );
        outerGlow.addColorStop(0, 'rgba(139, 0, 0, 0.6)');
        outerGlow.addColorStop(0.5, 'rgba(88, 0, 0, 0.3)');
        outerGlow.addColorStop(1, 'rgba(44, 0, 0, 0)');
        
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonSize * 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Внутреннее свечение
        const innerGlow = ctx.createRadialGradient(
            moonX, moonY, 0,
            moonX, moonY, moonSize * 2.5
        );
        innerGlow.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        innerGlow.addColorStop(0.7, 'rgba(139, 0, 0, 0.4)');
        innerGlow.addColorStop(1, 'rgba(88, 0, 0, 0)');
        
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonSize * 2.5 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Сама луна
        const moonGradient = ctx.createRadialGradient(
            moonX - 10, moonY - 10, 0,
            moonX, moonY, moonSize
        );
        moonGradient.addColorStop(0, '#FF0000');
        moonGradient.addColorStop(0.5, '#B22222');
        moonGradient.addColorStop(0.8, '#8B0000');
        moonGradient.addColorStop(1, '#4a0000');
        
        ctx.fillStyle = moonGradient;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Текстура на луне (кратеры)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        // Большой центральный кратер
        ctx.arc(moonX - 5, moonY - 5, 8, 0, Math.PI * 2);
        // Меньшие кратеры
        ctx.arc(moonX + 15, moonY + 10, 5, 0, Math.PI * 2);
        ctx.arc(moonX - 20, moonY + 15, 6, 0, Math.PI * 2);
        ctx.arc(moonX + 10, moonY - 20, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Кровавые прожилки на луне
        ctx.strokeStyle = 'rgba(139, 0, 0, 0.9)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        // Прожилка 1
        ctx.beginPath();
        ctx.moveTo(moonX - 25, moonY - 10);
        ctx.bezierCurveTo(
            moonX - 15, moonY,
            moonX - 5, moonY + 10,
            moonX + 5, moonY + 5
        );
        ctx.stroke();
        
        // Прожилка 2
        ctx.beginPath();
        ctx.moveTo(moonX + 20, moonY - 15);
        ctx.bezierCurveTo(
            moonX + 10, moonY - 5,
            moonX, moonY + 15,
            moonX - 10, moonY + 20
        );
        ctx.stroke();
        
    }
    
    drawHellMountains(ctx, offset, yBase, height, count, color) {
        const segmentWidth = this.game.width / count;
        const time = Date.now() * 0.001;
        
        for (let i = -1; i <= count + 1; i++) {
            const x = i * segmentWidth + (offset % segmentWidth);
            
            if (x > -200 && x < this.game.width + 200) {
                // Основная форма горы
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(x, this.game.height);
                
                // Создаем зазубренную вершину
                const peakX = x + segmentWidth * 0.5;
                const peakY = yBase - height;
                
                // Левая сторона с зубцами
                for (let j = 0; j <= 3; j++) {
                    const segmentX = x + (segmentWidth * 0.5 * j / 3);
                    const toothHeight = height * 0.1 * Math.sin(time + i + j);
                    const segmentY = yBase - height * (1 - j/3) + toothHeight;
                    ctx.lineTo(segmentX, segmentY);
                }
                
                // Вершина
                ctx.lineTo(peakX, peakY);
                
                // Правая сторона с зубцами
                for (let j = 1; j <= 3; j++) {
                    const segmentX = peakX + (segmentWidth * 0.5 * j / 3);
                    const toothHeight = height * 0.1 * Math.sin(time + i + 3 + j);
                    const segmentY = yBase - height * (1 - (3-j)/3) + toothHeight;
                    ctx.lineTo(segmentX, segmentY);
                }
                
                ctx.lineTo(x + segmentWidth, this.game.height);
                ctx.closePath();
                ctx.fill();
                
                
            }
        }
    }
    
    
    
    drawLavaLake(ctx) {
        const time = Date.now() * 0.001;
        const lakeY = this.game.height - 40;
        const lakeHeight = 40;
        
        // Основной цвет лавы
        const lavaGradient = ctx.createLinearGradient(0, lakeY, 0, lakeY + lakeHeight);
        lavaGradient.addColorStop(0, '#FF4500');
        lavaGradient.addColorStop(0.3, '#FF0000');
        lavaGradient.addColorStop(0.7, '#DC143C');
        lavaGradient.addColorStop(1, '#8B0000');
        
        ctx.fillStyle = lavaGradient;
        ctx.fillRect(0, lakeY, this.game.width, lakeHeight);
        
        // Волны лавы
        ctx.strokeStyle = '#FF6347';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            const waveOffset = time * 20 + i * 50;
            ctx.beginPath();
            
            for (let x = 0; x < this.game.width; x += 10) {
                const waveHeight = Math.sin((x + waveOffset) * 0.05) * 5;
                const y = lakeY + waveHeight;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
        
        // Пузыри в лаве
        for (let i = 0; i < 8; i++) {
            const bubbleX = (time * 15 + i * 60) % this.game.width;
            const bubbleY = lakeY + 10 + Math.sin(time * 2 + i) * 8;
            const bubbleSize = 3 + Math.sin(time * 3 + i) * 2;
            const bubbleAlpha = 0.7 + Math.sin(time * 4 + i) * 0.3;
            
            // Пузырь
            ctx.fillStyle = `rgba(255, 165, 0, ${bubbleAlpha})`;
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Отражение на пузыре
            ctx.fillStyle = `rgba(255, 255, 255, ${bubbleAlpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(bubbleX - bubbleSize * 0.3, bubbleY - bubbleSize * 0.3, bubbleSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Пар от лавы
        for (let i = 0; i < 5; i++) {
            const steamX = (time * 8 + i * 80) % this.game.width;
            const steamY = lakeY - 5 - Math.sin(time * 1.5 + i) * 10;
            const steamSize = 6 + Math.sin(time * 2 + i) * 4;
            
            const steamGradient = ctx.createRadialGradient(
                steamX, steamY, 0,
                steamX, steamY, steamSize
            );
            steamGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            steamGradient.addColorStop(0.7, 'rgba(200, 200, 200, 0.2)');
            steamGradient.addColorStop(1, 'rgba(150, 150, 150, 0)');
            
            ctx.fillStyle = steamGradient;
            ctx.beginPath();
            ctx.arc(steamX, steamY, steamSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    update(playerVX) {
        // Обновляем смещение в зависимости от скорости игрока
        this.offset -= playerVX * 0.5;
        this.time += 0.05;
        
        // Ограничиваем смещение
        if (this.offset < -1000) this.offset += 1000;
        if (this.offset > 1000) this.offset -= 1000;
    }
    
    draw(ctx) {
        // Рисуем все слои по порядку
        this.layers.forEach(layer => {
            layer.draw(ctx, this.offset);
        });
        
        // Легкая красная дымка для атмосферы
        ctx.fillStyle = 'rgba(139, 0, 0, 0.08)';
        ctx.fillRect(0, 0, this.game.width, this.game.height * 0.7);
    }
}