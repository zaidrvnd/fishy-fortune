// Fishy Fortune - Farcaster Mini App Game Logic
// Best practices: Modular, clean code with error handling and separation of concerns

(function() {
    'use strict';

    // Game Configuration
    const CONFIG = {
        FISH_TYPES: {
            common: [
                {
                    name: 'Ikan Mas',
                    emoji: '🐟',
                    description: 'Ikan mas yang biasa di sungai',
                    rarity: 'common',
                    tokenReward: 0,
                    probability: 0.7
                },
                {
                    name: 'Ikan Lele',
                    emoji: '🐟',
                    description: 'Ikan lele yang suka di lumpur',
                    rarity: 'common',
                    tokenReward: 0,
                    probability: 0.7
                },
                {
                    name: 'Ikan Nila',
                    emoji: '🐟',
                    description: 'Ikan nila yang jinak',
                    rarity: 'common',
                    tokenReward: 0,
                    probability: 0.7
                }
            ],
            rare: [
                {
                    name: 'Ikan Koi',
                    emoji: '🐠',
                    description: 'Ikan koi yang cantik dan langka',
                    rarity: 'rare',
                    tokenReward: 5,
                    probability: 0.25
                },
                {
                    name: 'Ikan Cupang',
                    emoji: '🐠',
                    description: 'Ikan cupang dengan sirip indah',
                    rarity: 'rare',
                    tokenReward: 5,
                    probability: 0.25
                },
                {
                    name: 'Ikan Arwana',
                    emoji: '🐠',
                    description: 'Ikan arwana yang eksotis',
                    rarity: 'rare',
                    tokenReward: 5,
                    probability: 0.25
                }
            ],
            legendary: [
                {
                    name: 'Ikan Arowana',
                    emoji: '🐡',
                    description: 'Ikan arowana super langka!',
                    rarity: 'legendary',
                    tokenReward: 50,
                    probability: 0.05
                },
                {
                    name: 'Ikan Napoleon',
                    emoji: '🐡',
                    description: 'Ikan napoleon raja terumbu!',
                    rarity: 'legendary',
                    tokenReward: 50,
                    probability: 0.05
                },
                {
                    name: 'Ikan Paus',
                    emoji: '🐋',
                    description: 'Ikan paus mini yang legendaris!',
                    rarity: 'legendary',
                    tokenReward: 50,
                    probability: 0.05
                }
            ]
        },
        ANIMATION_DURATION: 2000, // 2 seconds
        CANVAS_WIDTH: 400,
        CANVAS_HEIGHT: 300
    };

    // Game State
    let gameState = {
        isPlaying: false,
        totalFishes: 0,
        totalTokens: 0,
        currentResult: null
    };

    // DOM Elements
    const elements = {};

    // Canvas Context
    let canvas, ctx;

    // Initialize the game
    function init() {
        try {
            // Cache DOM elements
            elements.fishButton = document.getElementById('fish-button');
            elements.resultDisplay = document.getElementById('result-display');
            elements.resultTitle = document.getElementById('result-title');
            elements.resultDescription = document.getElementById('result-description');
            elements.shareButton = document.getElementById('share-button');
            elements.playAgainButton = document.getElementById('play-again-button');
            elements.totalFishes = document.getElementById('total-fishes');
            elements.totalTokens = document.getElementById('total-tokens');
            elements.userPfp = document.getElementById('user-pfp');
            elements.userName = document.getElementById('user-name');
            elements.userHandle = document.getElementById('user-handle');

            // Initialize fullscreen canvas
            canvas = document.getElementById('fishing-canvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas context not available');
            }

            // Set canvas to fullscreen
            resizeCanvas();

            // Set up event listeners
            setupEventListeners();

            // Initialize user info after SDK is ready
            initializeUserInfo();

            // Listen for context updates
            if (window.farcasterSDK) {
                // Listen for context ready event
                window.farcasterSDK.on('context', (context) => {
                    console.log('Context updated:', context);
                    initializeUserInfo();
                });
            }

            // Draw initial scene
            drawInitialScene();

            // Load saved game state
            loadGameState();

            console.log('Fishy Fortune game initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            showError('Gagal memuat game. Silakan refresh halaman.');
        }
    }

    // Set up event listeners
    function setupEventListeners() {
        if (elements.fishButton) {
            elements.fishButton.addEventListener('click', startFishing);
        }

        if (elements.shareButton) {
            elements.shareButton.addEventListener('click', shareResult);
        }

        if (elements.playAgainButton) {
            elements.playAgainButton.addEventListener('click', resetGame);
        }
    }

    // Start fishing animation and logic
    function startFishing() {
        if (gameState.isPlaying) return;

        gameState.isPlaying = true;
        elements.fishButton.disabled = true;
        elements.fishButton.classList.add('loading');
        elements.fishButton.textContent = 'Sedang Memancing...';

        // Hide previous result
        elements.resultDisplay.classList.add('hidden');

        // Start animation
        animateFishing().then(() => {
            // Determine result
            const result = rollGacha();
            showResult(result);
        }).catch(error => {
            console.error('Fishing animation failed:', error);
            resetGame();
        });
    }

    // Gacha logic with weighted random selection
    function rollGacha() {
        const roll = Math.random();
        let cumulativeProbability = 0;

        // First determine rarity
        for (const [rarity, fishArray] of Object.entries(CONFIG.FISH_TYPES)) {
            // Get the probability from the first fish in the array (they all have the same probability)
            const probability = fishArray[0].probability;
            cumulativeProbability += probability;
            if (roll < cumulativeProbability) {
                // Select random fish from this rarity
                const randomIndex = Math.floor(Math.random() * fishArray.length);
                return fishArray[randomIndex];
            }
        }

        // Fallback to first common fish
        return CONFIG.FISH_TYPES.common[0];
    }

    // Animate fishing process with bite animation
    function animateFishing() {
        return new Promise((resolve) => {
            let startTime = Date.now();
            let hookPosition = { x: CONFIG.CANVAS_WIDTH / 2, y: 50 };
            let lineLength = 0;
            const maxLineLength = CONFIG.CANVAS_HEIGHT - 100;
            let biteAnimation = null;
            let biteStartTime = 0;

            function animate() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / CONFIG.ANIMATION_DURATION, 1);

                // Clear canvas
                ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

                // Draw water background
                drawWater();

                // Draw fishing rod
                drawFishingRod();

                // Animate fishing line
                lineLength = progress * maxLineLength;
                const hookY = 80 + lineLength;

                // Check for bite animation (random chance when hook is deep)
                if (progress > 0.3 && progress < 0.9 && !biteAnimation) {
                    if (Math.random() < 0.02) { // 2% chance per frame
                        biteAnimation = 'pulling';
                        biteStartTime = Date.now();
                    }
                }

                // Handle bite animation
                if (biteAnimation) {
                    const biteElapsed = Date.now() - biteStartTime;
                    const biteProgress = Math.min(biteElapsed / 300, 1); // 300ms bite animation

                    if (biteAnimation === 'pulling') {
                        // Hook gets pulled down by fish
                        const pullAmount = Math.sin(biteProgress * Math.PI) * 15;
                        drawFishingLine(hookPosition.x, 80, hookPosition.x, hookY + pullAmount);
                        drawHook(hookPosition.x, hookY + pullAmount);

                        // Draw bite effect (bubbles and ripples)
                        drawBiteEffect(hookPosition.x, hookY + pullAmount, biteProgress);

                        if (biteProgress >= 1) {
                            biteAnimation = 'caught';
                            biteStartTime = Date.now();
                        }
                    } else if (biteAnimation === 'caught') {
                        // Fish is caught, hook shakes
                        const shake = Math.sin(biteElapsed * 0.05) * 3;
                        drawFishingLine(hookPosition.x + shake, 80, hookPosition.x + shake, hookY);
                        drawHook(hookPosition.x + shake, hookY);

                        // Draw caught fish effect
                        drawCaughtFish(hookPosition.x + shake, hookY, biteElapsed);

                        if (biteElapsed > 800) { // Show caught fish for 800ms
                            biteAnimation = null;
                        }
                    }
                } else {
                    // Normal fishing animation
                    drawFishingLine(hookPosition.x, 80, hookPosition.x, hookY);
                    drawHook(hookPosition.x, hookY);
                }

                // Add some bubbles for effect
                drawBubbles(progress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Add a small delay before resolving
                    setTimeout(resolve, 500);
                }
            }

            animate();
        });
    }

    // Draw initial scene
    function drawInitialScene() {
        ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        drawWater();
        drawFishingRod();
        drawFishingLine(CONFIG.CANVAS_WIDTH / 2, 80, CONFIG.CANVAS_WIDTH / 2, 150);
        drawHook(CONFIG.CANVAS_WIDTH / 2, 150);
    }

    // Draw pixel art water background with swimming fish
    function drawWater() {
        const time = Date.now() * 0.001;

        // Pixel art water with blocks and realistic waves
        const blockSize = 8;
        for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += blockSize) {
            for (let y = 80; y < CONFIG.CANVAS_HEIGHT; y += blockSize) {
                // Create multiple wave layers for realistic ocean
                const wave1 = Math.sin((x * 0.02 + time * 0.8) * 0.5) * 2;
                const wave2 = Math.sin((x * 0.015 + time * 1.2) * 0.3) * 1.5;
                const wave3 = Math.sin((x * 0.01 + time * 0.6) * 0.2) * 1;
                const totalWave = wave1 + wave2 + wave3;

                const depth = (y - 80) / (CONFIG.CANVAS_HEIGHT - 80);

                if (y + totalWave > 80) {
                    // Water colors - deeper = darker with wave effects
                    const blue = Math.floor(80 + depth * 120 + totalWave * 0.5);
                    const green = Math.floor(130 + depth * 80 + totalWave * 0.3);
                    ctx.fillStyle = `rgb(0, ${Math.max(0, Math.min(255, green))}, ${Math.max(0, Math.min(255, blue))})`;
                    ctx.fillRect(x, y, blockSize, blockSize);

                    // Add sparkle pixels based on wave intensity
                    if (Math.random() < 0.0005 + Math.abs(totalWave) * 0.001) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(x + 2, y + 2, 2, 2);
                    }
                }
            }
        }

        // Realistic wave crests on surface
        ctx.fillStyle = '#87ceeb';
        for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += 12) {
            const waveY = 80 + Math.sin((x * 0.03 + time * 1.5) * 0.08) * 6;
            const waveHeight = Math.sin((x * 0.02 + time * 2) * 0.05) * 2 + 3;
            ctx.fillRect(x, waveY, 6, waveHeight);

            // Add foam on bigger waves
            if (waveHeight > 4) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + 1, waveY, 4, 1);
                ctx.fillStyle = '#87ceeb';
            }
        }

        // Draw many swimming fish
        drawSwimmingFish();
    }

    // Draw swimming fish in the background
    function drawSwimmingFish() {
        const time = Date.now() * 0.001;

        // Create many fish at different depths (15 fish total)
        for (let i = 0; i < 15; i++) {
            const fishId = i;
            const baseY = 120 + (i % 5) * 50 + Math.sin(time * 0.5 + i) * 20; // Different depths with wave
            const speed = 0.3 + (i % 3) * 0.2; // Different speeds
            const amplitude = 8 + (i % 4) * 3; // Different wave amplitudes

            // Calculate fish position
            const x = (time * speed * 30 + fishId * 150) % (CONFIG.CANVAS_WIDTH + 100) - 50;
            const y = baseY + Math.sin(time * speed + fishId) * amplitude;

            // Only draw if fish is visible
            if (x > -50 && x < CONFIG.CANVAS_WIDTH + 50) {
                drawPixelFish(x, y, fishId, time);
            }
        }
    }

    // Draw a single pixel art fish with different types
    function drawPixelFish(x, y, fishId, time) {
        const wiggle = Math.sin(time * 3 + fishId) * 2;
        const fishType = fishId % 5; // 5 different fish types

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(wiggle * 0.1);

        // Different fish types with unique designs
        switch (fishType) {
            case 0: // Clownfish (Orange/White)
                drawClownfish();
                break;
            case 1: // Blue Tang
                drawBlueTang();
                break;
            case 2: // Yellow Tang
                drawYellowTang();
                break;
            case 3: // Butterfly Fish
                drawButterflyFish();
                break;
            case 4: // Angelfish
                drawAngelfish();
                break;
        }

        ctx.restore();
    }

    // Draw different fish types
    function drawClownfish() {
        // Body - orange
        ctx.fillStyle = '#ff6b35';
        ctx.fillRect(-8, -2, 16, 4);

        // White stripes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6, -2, 3, 4);
        ctx.fillRect(-1, -2, 3, 4);

        // Tail
        ctx.fillStyle = '#ff6b35';
        ctx.fillRect(-12, -1, 4, 2);

        // Fins
        ctx.fillRect(-4, -4, 2, 2);
        ctx.fillRect(2, -4, 2, 2);

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, -1, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(5, -1, 1, 1);
    }

    function drawBlueTang() {
        // Body - blue
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(-10, -3, 20, 6);

        // Dorsal fin
        ctx.fillRect(-8, -6, 16, 3);

        // Tail
        ctx.fillRect(-14, -2, 4, 4);

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, -1, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(7, -1, 1, 1);
    }

    function drawYellowTang() {
        // Body - yellow
        ctx.fillStyle = '#f9ca24';
        ctx.fillRect(-8, -2, 16, 4);

        // Spiny dorsal fin
        ctx.fillStyle = '#f0932b';
        ctx.fillRect(-6, -5, 12, 3);

        // Tail
        ctx.fillStyle = '#f9ca24';
        ctx.fillRect(-12, -1, 4, 2);

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, -1, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(5, -1, 1, 1);
    }

    function drawButterflyFish() {
        // Body - mix of colors
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(-6, -2, 12, 4);

        // Black eye band
        ctx.fillStyle = '#000000';
        ctx.fillRect(-2, -2, 8, 4);

        // White spot
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, -1, 2, 2);

        // Tail
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(-10, -1, 4, 2);

        // Fins
        ctx.fillRect(-4, -4, 2, 2);
        ctx.fillRect(2, -4, 2, 2);
    }

    function drawAngelfish() {
        // Body - purple/blue
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(-8, -3, 16, 6);

        // Vertical stripes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6, -3, 2, 6);
        ctx.fillRect(-2, -3, 2, 6);
        ctx.fillRect(2, -3, 2, 6);

        // Tail
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(-12, -2, 4, 4);

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5, -1, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(6, -1, 1, 1);
    }

    // Draw pixel art fisherman and fishing rod
    function drawFishingRod() {
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        const time = Date.now() * 0.001;

        // Draw fisherman on the left side
        drawFisherman();

        // Fishing rod (brown pixels)
        ctx.fillStyle = '#8B4513';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(centerX - 20 + i * 6, 30 + i * 4, 6, 4);
        }

        // Rod tip (darker brown)
        ctx.fillStyle = '#654321';
        ctx.fillRect(centerX + 16, 54, 8, 4);
        ctx.fillRect(centerX + 20, 50, 4, 8);

        // Fishing line (thin line from rod tip to hook)
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]); // Dashed line
        ctx.beginPath();
        ctx.moveTo(centerX + 24, 58);
        ctx.lineTo(centerX, CONFIG.CANVAS_HEIGHT * 0.6);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Hook at the end of the line
        const hookY = CONFIG.CANVAS_HEIGHT * 0.6;
        const wiggle = Math.sin(time * 2) * 2; // Gentle wiggle

        ctx.fillStyle = '#374151';
        // Hook curve
        ctx.fillRect(centerX - 6 + wiggle, hookY - 2, 12, 4);
        // Hook point
        ctx.fillRect(centerX + 4 + wiggle, hookY - 4, 4, 2);
        ctx.fillRect(centerX + 6 + wiggle, hookY - 2, 2, 4);

        // Add some shine to the hook
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(centerX - 4 + wiggle, hookY - 1, 2, 2);
    }

    // Draw pixel art fisherman
    function drawFisherman() {
        const time = Date.now() * 0.001;
        const fishermanX = 50;
        const fishermanY = 60;

        // Body (blue shirt)
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(fishermanX - 4, fishermanY - 8, 8, 12);

        // Head (skin color)
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(fishermanX - 3, fishermanY - 16, 6, 6);

        // Hat (red)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(fishermanX - 4, fishermanY - 20, 8, 4);

        // Arms (skin color)
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(fishermanX - 8, fishermanY - 6, 4, 8); // Left arm
        ctx.fillRect(fishermanX + 4, fishermanY - 6, 4, 8); // Right arm

        // Legs (blue pants)
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(fishermanX - 3, fishermanY + 4, 3, 8); // Left leg
        ctx.fillRect(fishermanX, fishermanY + 4, 3, 8); // Right leg

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(fishermanX - 2, fishermanY - 14, 1, 1); // Left eye
        ctx.fillRect(fishermanX + 1, fishermanY - 14, 1, 1); // Right eye

        // Mouth (smile)
        ctx.fillStyle = '#000000';
        ctx.fillRect(fishermanX - 1, fishermanY - 11, 2, 1);

        // Add slight breathing animation
        const breath = Math.sin(time * 1.5) * 0.5;
        ctx.save();
        ctx.translate(fishermanX, fishermanY);
        ctx.scale(1, 1 + breath * 0.02);
        ctx.restore();
    }

    // Draw fishing line
    function drawFishingLine(x1, y1, x2, y2) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw pixel art hook
    function drawHook(x, y) {
        // Hook body (silver pixels)
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x - 2, y - 2, 4, 4);

        // Hook curve (darker silver)
        ctx.fillStyle = '#a0a0a0';
        ctx.fillRect(x - 4, y, 2, 2);
        ctx.fillRect(x + 2, y, 2, 2);
        ctx.fillRect(x - 2, y + 2, 2, 2);

        // Hook point
        ctx.fillStyle = '#808080';
        ctx.fillRect(x, y + 4, 2, 2);
    }

    // Draw pixel art bubbles
    function drawBubbles(progress) {
        const bubbleCount = Math.floor(progress * 8);
        ctx.fillStyle = '#ffffff';

        for (let i = 0; i < bubbleCount; i++) {
            const x = Math.floor((CONFIG.CANVAS_WIDTH / 2) + (Math.random() - 0.5) * 80);
            const y = Math.floor(150 + progress * (CONFIG.CANVAS_HEIGHT - 200) + Math.random() * 40);
            const size = Math.floor(Math.random() * 2) + 1;

            // Pixel perfect bubbles
            for (let bx = 0; bx < size; bx++) {
                for (let by = 0; by < size; by++) {
                    if (Math.random() > 0.3) { // Some transparency effect
                        ctx.fillRect(x + bx * 2, y + by * 2, 2, 2);
                    }
                }
            }
        }
    }

    // Draw bite effect (bubbles and ripples when fish bites)
    function drawBiteEffect(x, y, progress) {
        // Rapid bubbles
        ctx.fillStyle = '#ffffff';
        const bubbleCount = Math.floor(progress * 12);

        for (let i = 0; i < bubbleCount; i++) {
            const angle = (i / bubbleCount) * Math.PI * 2;
            const distance = 10 + Math.random() * 20;
            const bubbleX = x + Math.cos(angle) * distance;
            const bubbleY = y + Math.sin(angle) * distance + Math.random() * 10;
            const size = Math.floor(Math.random() * 3) + 1;

            for (let bx = 0; bx < size; bx++) {
                for (let by = 0; by < size; by++) {
                    if (Math.random() > 0.2) {
                        ctx.fillRect(bubbleX + bx * 2, bubbleY + by * 2, 2, 2);
                    }
                }
            }
        }

        // Ripple effect in water
        ctx.strokeStyle = '#87ceeb';
        ctx.lineWidth = 1;
        for (let r = 1; r <= 3; r++) {
            const radius = progress * r * 15;
            const alpha = (1 - progress) * 0.5;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    // Draw caught fish animation
    function drawCaughtFish(x, y, elapsed) {
        const shake = Math.sin(elapsed * 0.05) * 3;

        // Draw a random fish type that's "caught"
        const caughtFishType = Math.floor(Math.random() * 5);

        ctx.save();
        ctx.translate(x + shake, y - 10);

        // Draw fish hanging from hook
        switch (caughtFishType) {
            case 0: // Small fish
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(-6, -2, 12, 4);
                ctx.fillRect(-8, -1, 2, 2); // Tail
                break;
            case 1: // Medium fish
                ctx.fillStyle = '#4ecdc4';
                ctx.fillRect(-8, -3, 16, 6);
                ctx.fillRect(-10, -2, 2, 4); // Tail
                break;
            case 2: // Large fish
                ctx.fillStyle = '#f9ca24';
                ctx.fillRect(-10, -4, 20, 8);
                ctx.fillRect(-12, -3, 2, 6); // Tail
                break;
            case 3: // Special fish
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(-8, -3, 16, 6);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-4, -3, 8, 6); // White band
                break;
            case 4: // Rare fish
                ctx.fillStyle = '#9b59b6';
                ctx.fillRect(-9, -4, 18, 8);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-6, -4, 2, 8);
                ctx.fillRect(-2, -4, 2, 8);
                ctx.fillRect(2, -4, 2, 8);
                break;
        }

        // Add sparkle effect for caught fish
        if (Math.random() < 0.3) {
            ctx.fillStyle = '#ffffff';
            const sparkleX = (Math.random() - 0.5) * 20;
            const sparkleY = (Math.random() - 0.5) * 10;
            ctx.fillRect(sparkleX, sparkleY, 2, 2);
        }

        ctx.restore();
    }

    // Show fishing result
    function showResult(fish) {
        gameState.currentResult = fish;
        gameState.totalFishes++;
        gameState.totalTokens += fish.tokenReward;

        // Update UI
        elements.resultTitle.textContent = `${fish.emoji} ${fish.name}`;
        elements.resultDescription.textContent = fish.description;

        // Style based on rarity
        elements.resultDisplay.className = `result ${fish.rarity}`;

        // Show result
        elements.resultDisplay.classList.remove('hidden');

        // Show appropriate buttons
        if (fish.rarity === 'legendary') {
            elements.shareButton.classList.remove('hidden');
        }
        elements.playAgainButton.classList.remove('hidden');

        // Update stats
        updateStats();

        // Save game state
        saveGameState();

        // Reset button
        elements.fishButton.disabled = false;
        elements.fishButton.classList.remove('loading');
        elements.fishButton.textContent = '🎣 Mulai Memancing!';

        gameState.isPlaying = false;
    }

    // Share result to Farcaster feed
    async function shareResult() {
        if (!gameState.currentResult) return;

        try {
            const castText = `Aku dapat ${gameState.currentResult.emoji} ${gameState.currentResult.name} di Fishy Fortune! ${gameState.currentResult.rarity === 'legendary' ? '🎉 LEGENDARY! +' + gameState.currentResult.tokenReward + ' tokens!' : ''}`;

            if (window.farcasterSDK) {
                await window.farcasterSDK.actions.composeCast({
                    text: castText,
                    embeds: [window.location.href]
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(castText);
                alert('Teks share telah disalin ke clipboard!');
            }
        } catch (error) {
            console.error('Failed to share result:', error);
            alert('Gagal membagikan hasil. Coba lagi.');
        }
    }

    // Reset game for another round
    function resetGame() {
        gameState.isPlaying = false;
        gameState.currentResult = null;

        elements.resultDisplay.classList.add('hidden');
        elements.shareButton.classList.add('hidden');
        elements.playAgainButton.classList.add('hidden');

        elements.fishButton.disabled = false;
        elements.fishButton.classList.remove('loading');
        elements.fishButton.textContent = '🎣 Mulai Memancing!';

        drawInitialScene();
    }

    // Update statistics display
    function updateStats() {
        elements.totalFishes.textContent = gameState.totalFishes;
        elements.totalTokens.textContent = gameState.totalTokens;
    }

    // Save game state to localStorage
    function saveGameState() {
        try {
            localStorage.setItem('fishy-fortune-state', JSON.stringify({
                totalFishes: gameState.totalFishes,
                totalTokens: gameState.totalTokens
            }));
        } catch (error) {
            console.warn('Failed to save game state:', error);
        }
    }

    // Load game state from localStorage
    function loadGameState() {
        try {
            const saved = localStorage.getItem('fishy-fortune-state');
            if (saved) {
                const state = JSON.parse(saved);
                gameState.totalFishes = state.totalFishes || 0;
                gameState.totalTokens = state.totalTokens || 0;
                updateStats();
            }
        } catch (error) {
            console.warn('Failed to load game state:', error);
        }
    }

    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ef4444;
            color: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 5000);
    }

    // Resize canvas to fullscreen
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Set actual canvas size
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Scale context to match device pixel ratio
        ctx.scale(dpr, dpr);

        // Set display size
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';

        CONFIG.CANVAS_WIDTH = rect.width;
        CONFIG.CANVAS_HEIGHT = rect.height;
    }

    // Initialize user info from Farcaster
    function initializeUserInfo() {
        try {
            // Check if SDK and context are available
            if (window.farcasterSDK && window.farcasterSDK.context && window.farcasterSDK.context.user) {
                const user = window.farcasterSDK.context.user;

                // Safely set image src
                const pfpUrl = user.pfpUrl;
                if (pfpUrl && typeof pfpUrl === 'string') {
                    elements.userPfp.src = pfpUrl;
                }

                // Set user name and handle
                const displayName = user.displayName || user.username || 'Anonymous';
                const username = user.username || 'unknown';

                elements.userName.textContent = displayName;
                elements.userHandle.textContent = `@${username}`;

                console.log('User info initialized:', { displayName, username, pfpUrl });
            } else {
                // Context not ready yet, show loading state
                elements.userName.textContent = 'Loading...';
                elements.userHandle.textContent = '@loading';

                // Try again in 500ms if still loading
                if (!window.farcasterSDK || !window.farcasterSDK.context) {
                    setTimeout(initializeUserInfo, 500);
                }
            }
        } catch (error) {
            console.warn('Failed to initialize user info:', error);
            // Fallback values
            elements.userName.textContent = 'Anonymous';
            elements.userHandle.textContent = '@unknown';
        }
    }

    // Global function to update user info (called from HTML)
    window.updateUserInfo = function() {
        console.log('updateUserInfo called');

        // Try to get user info directly from SDK context
        try {
            if (window.farcasterSDK && window.farcasterSDK.context && window.farcasterSDK.context.user) {
                const user = window.farcasterSDK.context.user;
                console.log('User from SDK context:', user);

                // Safely set image src
                const pfpUrl = user.pfpUrl;
                if (pfpUrl && typeof pfpUrl === 'string') {
                    elements.userPfp.src = pfpUrl;
                }

                // Set user name and handle
                const displayName = user.displayName || user.username || 'Anonymous';
                const username = user.username || 'unknown';

                elements.userName.textContent = displayName;
                elements.userHandle.textContent = `@${username}`;

                console.log('User info updated successfully:', { displayName, username, pfpUrl });
            } else {
                console.log('SDK context not available, using fallback');
                elements.userName.textContent = 'Anonymous';
                elements.userHandle.textContent = '@unknown';
            }
        } catch (error) {
            console.error('Error updating user info:', error);
            elements.userName.textContent = 'Anonymous';
            elements.userHandle.textContent = '@unknown';
        }
    };

    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        drawInitialScene();
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for potential testing or debugging
    window.FishyFortune = {
        getGameState: () => ({ ...gameState }),
        rollGacha: rollGacha,
        resetGame: resetGame
    };

})();