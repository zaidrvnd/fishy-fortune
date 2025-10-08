// Fishy Fortune - Farcaster Mini App Game Logic
// Best practices: Modular, clean code with error handling and separation of concerns

(function() {
    'use strict';

    // Game Configuration
    const CONFIG = {
        FISH_TYPES: {
            common: {
                name: 'Ikan Biasa',
                emoji: '🐟',
                description: 'Ikan biasa yang lumrah',
                rarity: 'common',
                tokenReward: 0,
                probability: 0.7
            },
            rare: {
                name: 'Ikan Langka',
                emoji: '🐠',
                description: 'Ikan yang cukup jarang ditemukan',
                rarity: 'rare',
                tokenReward: 5,
                probability: 0.25
            },
            legendary: {
                name: 'Ikan Legendary',
                emoji: '🐡',
                description: 'Ikan legenda yang sangat langka!',
                rarity: 'legendary',
                tokenReward: 50,
                probability: 0.05
            }
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

        for (const [key, fish] of Object.entries(CONFIG.FISH_TYPES)) {
            cumulativeProbability += fish.probability;
            if (roll < cumulativeProbability) {
                return fish;
            }
        }

        // Fallback to common fish
        return CONFIG.FISH_TYPES.common;
    }

    // Animate fishing process
    function animateFishing() {
        return new Promise((resolve) => {
            let startTime = Date.now();
            let hookPosition = { x: CONFIG.CANVAS_WIDTH / 2, y: 50 };
            let lineLength = 0;
            const maxLineLength = CONFIG.CANVAS_HEIGHT - 100;

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
                drawFishingLine(hookPosition.x, 80, hookPosition.x, 80 + lineLength);

                // Draw hook
                drawHook(hookPosition.x, 80 + lineLength);

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
        // Pixel art water with blocks
        const blockSize = 8;
        for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += blockSize) {
            for (let y = 80; y < CONFIG.CANVAS_HEIGHT; y += blockSize) {
                // Create wave pattern
                const waveOffset = Math.sin((x + Date.now() * 0.002) * 0.02) * 3;
                const depth = (y - 80) / (CONFIG.CANVAS_HEIGHT - 80);

                if (y + waveOffset > 80) {
                    // Water colors - deeper = darker
                    const blue = Math.floor(100 + depth * 100);
                    const green = Math.floor(150 + depth * 50);
                    ctx.fillStyle = `rgb(0, ${green}, ${blue})`;
                    ctx.fillRect(x, y, blockSize, blockSize);

                    // Add some sparkle pixels
                    if (Math.random() < 0.001) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(x + 2, y + 2, 2, 2);
                    }
                }
            }
        }

        // Pixel art waves on surface
        ctx.fillStyle = '#60a5fa';
        for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += 16) {
            const waveY = 80 + Math.sin((x + Date.now() * 0.003) * 0.05) * 4;
            ctx.fillRect(x, waveY, 8, 4);
        }

        // Draw swimming fish
        drawSwimmingFish();
    }

    // Draw swimming fish in the background
    function drawSwimmingFish() {
        const time = Date.now() * 0.001;

        // Create multiple fish at different depths
        for (let i = 0; i < 5; i++) {
            const fishId = i;
            const baseY = 120 + i * 60; // Different depths
            const speed = 0.5 + i * 0.2; // Different speeds
            const amplitude = 10 + i * 5; // Different wave amplitudes

            // Calculate fish position
            const x = (time * speed * 50 + fishId * 200) % (CONFIG.CANVAS_WIDTH + 100) - 50;
            const y = baseY + Math.sin(time * speed + fishId) * amplitude;

            // Only draw if fish is visible
            if (x > -50 && x < CONFIG.CANVAS_WIDTH + 50) {
                drawPixelFish(x, y, fishId);
            }
        }
    }

    // Draw a single pixel art fish
    function drawPixelFish(x, y, fishId) {
        const time = Date.now() * 0.001;
        const wiggle = Math.sin(time * 3 + fishId) * 2;

        // Fish body (different colors for variety)
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];
        ctx.fillStyle = colors[fishId % colors.length];

        // Main body
        ctx.fillRect(x - 8, y - 2, 16, 4);

        // Tail
        ctx.fillRect(x - 12, y - 1, 4, 2);

        // Fins
        ctx.fillRect(x - 4, y - 4, 2, 2);
        ctx.fillRect(x + 2, y - 4, 2, 2);

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4, y - 1, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 5, y - 1, 1, 1);

        // Add slight wiggle animation
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(wiggle * 0.1);
        ctx.restore();
    }

    // Draw pixel art fishing line and hook only (no fisherman)
    function drawFishingRod() {
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        const time = Date.now() * 0.001;

        // Fishing line (thin vertical line from top to hook)
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]); // Dashed line
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, CONFIG.CANVAS_HEIGHT * 0.6);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Hook at the end of the line
        const hookY = CONFIG.CANVAS_HEIGHT * 0.6;
        const wiggle = Math.sin(time * 2) * 3; // Gentle wiggle

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