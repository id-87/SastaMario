const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
let score = 0;
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const pacman = {
    x: 10,
    y: 15,
    speed: 1,
    direction: {x: 0, y: 0},
    nextDirection: {x: 0, y: 0},
    radius: gridSize / 2 - 2,
    mouthAngle: 0,
    mouthOpen: true
};

// Create maze (1 = wall, 0 = path, 2 = dot)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,2,1,1,2,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,2,2,2,2,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,1,1,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,2,2,1,1,2,2,2,1,1,1,1,2,1],
    [1,2,2,2,1,1,2,1,2,1,1,2,1,2,1,1,2,2,2,1],
    [1,1,1,2,1,1,2,1,2,2,2,2,1,2,1,1,2,1,1,1],
    [1,1,1,2,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,2,1,1,2,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,2,2,2,2,1,2,1,1,1,1,2,1],
    [1,2,2,2,1,1,2,1,1,1,1,1,1,2,1,1,2,2,2,1],
    [1,1,1,2,1,1,2,2,2,1,1,2,2,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,2,1,1,2,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Ghosts
const ghosts = [
    {x: 9, y: 7, color: 'red', dx: 1, dy: 0},
    {x: 10, y: 7, color: 'pink', dx: -1, dy: 0},
    {x: 9, y: 8, color: 'cyan', dx: 0, dy: 1},
    {x: 10, y: 8, color: 'orange', dx: 0, dy: -1}
];

// Game loop
function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 1000/15); // 15 FPS
}

function update() {
    // Move Pac-Man
    movePacman();
    
    // Check for dot collision
    checkDotCollision();
    
    // Move ghosts
    moveGhosts();
    
    // Check ghost collisions
    checkGhostCollisions();
}

function movePacman() {
    // Try to change direction if possible
    if (pacman.nextDirection.x !== 0 || pacman.nextDirection.y !== 0) {
        const nextX = pacman.x + pacman.nextDirection.x;
        const nextY = pacman.y + pacman.nextDirection.y;
        
        if (nextX >= 0 && nextX < tileCount && nextY >= 0 && nextY < maze.length && 
            maze[nextY][nextX] !== 1) {
            pacman.direction = {...pacman.nextDirection};
            pacman.nextDirection = {x: 0, y: 0};
        }
    }
    
    // Move in current direction if possible
    const nextX = pacman.x + pacman.direction.x;
    const nextY = pacman.y + pacman.direction.y;
    
    if (nextX >= 0 && nextX < tileCount && nextY >= 0 && nextY < maze.length && 
        maze[nextY][nextX] !== 1) {
        pacman.x = nextX;
        pacman.y = nextY;
    }
    
    // Wrap around (tunnel effect)
    if (pacman.x < 0) pacman.x = tileCount - 1;
    if (pacman.x >= tileCount) pacman.x = 0;
    
    // Animate mouth
    if (pacman.mouthAngle >= 30) pacman.mouthOpen = false;
    if (pacman.mouthAngle <= 0) pacman.mouthOpen = true;
    pacman.mouthAngle += pacman.mouthOpen ? 2 : -2;
}

function checkDotCollision() {
    if (maze[pacman.y][pacman.x] === 2) {
        maze[pacman.y][pacman.x] = 0;
        score += 10;
        scoreElement.textContent = `Score: ${score}`;
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        // Simple movement logic (would be improved in a real game)
        let nextX = ghost.x + ghost.dx;
        let nextY = ghost.y + ghost.dy;
        
        // If hit a wall, change direction
        if (nextX < 0 || nextX >= tileCount || nextY < 0 || nextY >= maze.length || 
            maze[nextY][nextX] === 1) {
            const directions = [];
            if (ghost.x > 0 && maze[ghost.y][ghost.x-1] !== 1) directions.push({dx: -1, dy: 0});
            if (ghost.x < tileCount-1 && maze[ghost.y][ghost.x+1] !== 1) directions.push({dx: 1, dy: 0});
            if (ghost.y > 0 && maze[ghost.y-1][ghost.x] !== 1) directions.push({dx: 0, dy: -1});
            if (ghost.y < maze.length-1 && maze[ghost.y+1][ghost.x] !== 1) directions.push({dx: 0, dy: 1});
            
            if (directions.length > 0) {
                const newDir = directions[Math.floor(Math.random() * directions.length)];
                ghost.dx = newDir.dx;
                ghost.dy = newDir.dy;
            }
        } else {
            ghost.x = nextX;
            ghost.y = nextY;
        }
    });
}

function checkGhostCollisions() {
    ghosts.forEach(ghost => {
        if (ghost.x === Math.floor(pacman.x) && ghost.y === Math.floor(pacman.y)) {
            alert(`Game Over! Score: ${score}`);
            document.location.reload();
        }
    });
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 1) { // Wall
                ctx.fillStyle = 'blue';
                ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
            } else if (maze[y][x] === 2) { // Dot
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(
                    x * gridSize + gridSize/2, 
                    y * gridSize + gridSize/2, 
                    3, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
    
    // Draw ghosts
    ghosts.forEach(ghost => {
        const ghostX = ghost.x * gridSize + gridSize/2;
        const ghostY = ghost.y * gridSize + gridSize/2;
        
        // Body
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghostX, ghostY, gridSize/2 - 2, 0, Math.PI, true);
        ctx.lineTo(ghostX + gridSize/2 - 2, ghostY + gridSize/2 - 2);
        ctx.lineTo(ghostX - gridSize/2 + 2, ghostY + gridSize/2 - 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ghostX - 5, ghostY - 3, 3, 0, Math.PI * 2);
        ctx.arc(ghostX + 5, ghostY - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(ghostX - 5, ghostY - 3, 1.5, 0, Math.PI * 2);
        ctx.arc(ghostX + 5, ghostY - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw Pac-Man
    const pacmanX = pacman.x * gridSize + gridSize/2;
    const pacmanY = pacman.y * gridSize + gridSize/2;
    
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    
    let startAngle, endAngle;
    if (pacman.direction.x === 1) { // Right
        startAngle = (0 + pacman.mouthAngle) * Math.PI / 180;
        endAngle = (360 - pacman.mouthAngle) * Math.PI / 180;
    } else if (pacman.direction.x === -1) { // Left
        startAngle = (180 + pacman.mouthAngle) * Math.PI / 180;
        endAngle = (540 - pacman.mouthAngle) * Math.PI / 180;
    } else if (pacman.direction.y === -1) { // Up
        startAngle = (270 + pacman.mouthAngle) * Math.PI / 180;
        endAngle = (630 - pacman.mouthAngle) * Math.PI / 180;
    } else if (pacman.direction.y === 1) { // Down
        startAngle = (90 + pacman.mouthAngle) * Math.PI / 180;
        endAngle = (450 - pacman.mouthAngle) * Math.PI / 180;
    } else { // Default (right)
        startAngle = (0 + pacman.mouthAngle) * Math.PI / 180;
        endAngle = (360 - pacman.mouthAngle) * Math.PI / 180;
    }
    
    ctx.arc(pacmanX, pacmanY, pacman.radius, startAngle, endAngle);
    ctx.lineTo(pacmanX, pacmanY);
    ctx.fill();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            pacman.nextDirection = {x: 0, y: -1};
            break;
        case 'ArrowDown':
            pacman.nextDirection = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
            pacman.nextDirection = {x: -1, y: 0};
            break;
        case 'ArrowRight':
            pacman.nextDirection = {x: 1, y: 0};
            break;
    }
});

// Start game
gameLoop();