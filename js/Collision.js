class Collision {
    static checkPlayerPlatforms(player, platforms) {
        let onGround = false;
        
        const nextX = player.x + player.vx;
        const nextY = player.y + player.vy;
        
        for (const platform of platforms) {
            let platformY = platform.y;
            let platformVelocityY = 0;
            
            if (platform.type === 'movingVertical') {
                platformVelocityY = platform.speed * platform.direction;
                platformY = platform.y + platformVelocityY * 0.5;
            }
            
            if (this.checkAABB({
                x: nextX,
                y: nextY,
                width: player.width,
                height: player.height
            }, {
                x: platform.x,
                y: platformY,
                width: platform.width,
                height: platform.height
            })) {
                
                const playerBottom = player.y + player.height;
                const playerTop = player.y;
                const platformBottom = platformY + platform.height;
                const platformTop = platformY;
                
                const playerRight = player.x + player.width;
                const playerLeft = player.x;
                const platformRight = platform.x + platform.width;
                const platformLeft = platform.x;
                
                const bottomOverlap = playerBottom - platformTop;
                const topOverlap = platformBottom - playerTop;
                const rightOverlap = playerRight - platformLeft;
                const leftOverlap = platformRight - playerLeft;
                
                const minOverlap = Math.min(
                    bottomOverlap, topOverlap, rightOverlap, leftOverlap
                );
                
                if (minOverlap === bottomOverlap) {
                    player.y = platformY - player.height;
                    player.vy = platformVelocityY;
                    player.onGround = true;
                    player.jumping = false;
                    onGround = true;
                    
                    if (platformVelocityY < 0) {
                        player.y += platformVelocityY * 0.5;
                    }
                } 
                else if (minOverlap === topOverlap) {
                    player.y = platformBottom;
                    player.vy = Math.max(player.vy, 0);
                    
                    if (platformVelocityY > 0) {
                        player.vy += platformVelocityY * 0.5;
                    }
                }
                else if (minOverlap === rightOverlap) {
                    player.x = platformLeft - player.width;
                    player.vx = 0;
                }
                else if (minOverlap === leftOverlap) {
                    player.x = platformRight;
                    player.vx = 0;
                }
                
                if (platform.type === 'movingVertical' && onGround) {
                    player.vy = platformVelocityY;
                }
            }
        }
        
        if (!onGround && player.vy >= 0) {
            player.onGround = false;
        }
        
        this.checkMovingPlatforms(player, platforms);
        
        return onGround;
    }
    
    static checkMovingPlatforms(player, platforms) {
        for (const platform of platforms) {
            if (platform.type === 'movingVertical' && player.onGround) {
                const playerBottom = player.y + player.height;
                const platformTop = platform.y;
                
                if (Math.abs(playerBottom - platformTop) < 5) {
                    if (player.x + player.width > platform.x && player.x < platform.x + platform.width) {
                        player.vy = platform.speed * platform.direction;
                        return;
                    }
                }
            }
        }
    }
    
    static checkAABB(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    static checkWorldBounds(player, gameWidth, gameHeight) {
        // Левая граница
        if (player.x < 0) {
            player.x = 0;
            player.vx = 0;
        }
        
        // Правая граница
        if (player.x + player.width > gameWidth) {
            player.x = gameWidth - player.width;
            player.vx = 0;
        }
        
        // Потолок
        if (player.y < 0) {
            player.y = 0;
            player.vy = 0;
        }
        
        // ✅ СМЕРТЬ ПРИ ПАДЕНИИ НА НИЖНЮЮ ГРАНИЦУ
        // Игрок умирает, если его нижняя точка находится ниже пола
        // Высота пола: gameHeight - 40 (платформа нижнего пола)
        const floorY = gameHeight - 45;
        
        // Если нижняя часть игрока находится под полом
        if (player.y + player.height > floorY) {
            console.log(`Игрок умер! Нижняя Y: ${player.y + player.height}, пол Y: ${floorY}`);
            return true; // Смерть
        }
        
        return false; // Жив
    }
}