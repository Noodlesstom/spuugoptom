// Wacht tot de pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    // DOM elementen
    const startScreen = document.getElementById('start-screen');
    const mainTom = document.getElementById('main-tom');
    const gameContainer = document.getElementById('game-container');
    const cloudsContainer = document.getElementById('clouds-container');
    const controls = document.getElementById('controls');
    const speedUpButton = document.getElementById('speed-up');
    const speedDownButton = document.getElementById('speed-down');
    const healthContainer = document.getElementById('health-container');
    const healthBar = document.getElementById('health-bar');
    const gameOverScreen = document.getElementById('game-over');
    const scoreHits = document.getElementById('score-hits');
    const scoreTime = document.getElementById('score-time');
    const scoreEfficiency = document.getElementById('score-efficiency');
    const restartButton = document.getElementById('restart-button');
    const scoreContainer = document.getElementById('score-container');
    const scoreDisplay = document.getElementById('score-display');
    const youtubeContainer = document.getElementById('youtube-container');

    // Window resize event handler toevoegen
    window.addEventListener('resize', handleWindowResize);
    
    // Functie om vensterwijzigingen af te handelen
    function handleWindowResize() {
        detectMobileDevice(); // Update HEAD_SIZE gebaseerd op apparaattype
        
        // Update de positie van alle hoofden om binnen het scherm te blijven
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Update de positie van stuiterende hoofden
        bounceHeads.forEach(head => {
            // Beperk positie binnen het scherm
            if (head.x > width - HEAD_SIZE) {
                head.x = width - HEAD_SIZE;
            }
            if (head.y > height - HEAD_SIZE) {
                head.y = height - HEAD_SIZE;
            }
            
            // Update DOM element positie
            head.element.style.left = `${head.x}px`;
            head.element.style.top = `${head.y}px`;
        });
        
        // Update de positie van afgevuurde hoofden
        bulletHeads.forEach(bullet => {
            // Beperk positie binnen het scherm
            if (bullet.x > width - HEAD_SIZE) {
                bullet.x = width - HEAD_SIZE;
            }
            if (bullet.y > height - HEAD_SIZE) {
                bullet.y = height - HEAD_SIZE;
            }
            
            // Update DOM element positie
            bullet.element.style.left = `${bullet.x}px`;
            bullet.element.style.top = `${bullet.y}px`;
        });
        
        // Herpositioneer Tom1 in het midden
        if (gameLevel === 2) {
            // Zorg ervoor dat Tom1 in het midden blijft
            const currentScale = calculateTomScale();
            mainTom.style.transform = `scale(${currentScale}) rotate(${mainTomAngle}deg)`;
        }
        
        console.log("Venstergrootte aangepast, spelelementen bijgewerkt");
    }
    
    // Configuratie
    const DESKTOP_HEAD_SIZE = 100;
    const MOBILE_HEAD_SIZE = 50; // 50% van desktop grootte
    let HEAD_SIZE = DESKTOP_HEAD_SIZE; // Wordt dynamisch aangepast op basis van apparaattype
    const MIN_SPEED = 2;
    const MAX_SPEED = 5;
    const BULLET_SPEED = 8;
    const TIME_TO_LEVEL_2 = 6000; // 6 seconden
    const DESKTOP_CLOUD_COUNT = 15; // Aantal wolken op desktop
    const MOBILE_CLOUD_COUNT = 8; // Minder wolken op mobiel
    let CLOUD_COUNT = DESKTOP_CLOUD_COUNT; // Zal later worden bijgewerkt obv apparaattype
    const FIRE_RATE = 333; // 3 Tommies per seconde (1000ms / 3)
    const MAX_HEALTH = 10; // Aantal keren dat Tom1 geraakt kan worden
    const SPIT_SIZE_REDUCTION = 0.9; // 10% verkleining voor spit na hit
    
    // Prestatie configuratie
    let MAX_BOUNCING_HEADS = 20; // Wordt later bijgewerkt voor mobiel
    let MAX_BULLET_HEADS = 30; // Wordt later bijgewerkt voor mobiel 
    let UPDATE_INTERVAL = 16; // Wordt later bijgewerkt voor mobiel
    
    let currentSpeedMultiplier = 1.0;
    let isGameRunning = false;
    let tommieCount = 0;
    let bulletCount = 0;
    let gameTime = 0;
    let gameLevel = 1;
    let mainTomAngle = 0; // in graden
    let lastFireTime = 0;
    let keysPressed = {};
    let isFiring = false;
    let tomHealth = MAX_HEALTH; // Huidige gezondheid van Tom1
    let hitCount = 0; // Aantal geraakt vijanden
    let gameStartTime = 0; // Tijd wanneer het spel begint
    let spitSizeMultiplier = 1.0; // Grootte van spit-projectielen
    let isMobileDevice = false; // Detectie voor mobiele apparaten
    let useGyroscope = false; // Gyroscoop besturing inschakelen
    let gyroscopeAvailable = false; // Of gyroscoop beschikbaar is
    let gyroscopePermission = false; // Of toestemming voor gyroscoop is gegeven
    let musicPlaying = false; // Of muziek speelt
    let useTouchControl = false; // Aanraakbesturing inschakelen
    let touchActive = false; // Of er momenteel aangeraakt wordt
    
    // Mobiele besturingselementen
    const mobileControls = document.getElementById('mobile-controls');
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    const spitButton = document.getElementById('spit-button');
    
    // Gyroscoop elementen
    const gyroPermission = document.getElementById('gyro-permission');
    const enableGyroBtn = document.getElementById('enable-gyro');
    const useButtonsBtn = document.getElementById('use-buttons');
    
    // Audio-bestanden
    const bgMusic = new Audio('Assets/Audio/bg_music.wav');
    bgMusic.loop = true;
    
    const soundEffects = [
        new Audio('Assets/Audio/OE1.wav'),
        new Audio('Assets/Audio/OE2.wav'),
        new Audio('Assets/Audio/OE3.wav'),
        new Audio('Assets/Audio/OE4.wav'),
        new Audio('Assets/Audio/OE5.wav'),
        new Audio('Assets/Audio/OE6.wav'),
        new Audio('Assets/Audio/OE7.wav')
    ];
    
    // Verlaag het volume van de OE-geluiden met 6dB
    // 6dB vermindering is ongeveer gelijk aan een factor 0.5 in volume
    soundEffects.forEach(sound => {
        sound.volume = 0.5;
    });
    
    // Specifieke geluid voor klikken op hoofdTom
    const tomClickSound = new Audio('Assets/Audio/OE5.wav');
    tomClickSound.volume = 0.5;
    
    // Specifiek geluid voor als Tom1 geraakt wordt
    const tomHitSound = new Audio('Assets/Audio/tomgeraakt.wav');
    tomHitSound.volume = 0.7;
    
    // Nieuwe geluidseffecten
    const pewSound = new Audio('Assets/Audio/pew.wav');
    pewSound.volume = 0.7;
    
    const splodeSound = new Audio('Assets/Audio/splode.wav');
    splodeSound.volume = 0.7;
    
    // Afbeeldingen
    const idleImage = 'Assets/Graphics/face_idle.gif';
    const talkingImage = 'Assets/Graphics/face_talking.gif';
    const explosionImage = 'Assets/Graphics/splode.png';
    const spitImage = 'Assets/Graphics/spit.png';
    const faceSpitImage = 'Assets/Graphics/face_spit.gif';
    const faceHurtImage = 'Assets/Graphics/face_hurt.gif';
    const spitVsSpitImage = 'Assets/Graphics/spitvsspit.png';
    // Nieuwe Tom hurt afbeeldingen
    const tomHurtImages = [
        'Assets/Graphics/tom_hurt1.png',
        'Assets/Graphics/tom_hurt2.png',
        'Assets/Graphics/tom_hurt3.png',
        'Assets/Graphics/tom_hurt4.png',
        'Assets/Graphics/tom_hurt5.png',
        'Assets/Graphics/tom_hurt6.png',
        'Assets/Graphics/tom_hurt7.png',
        'Assets/Graphics/tom_hurt8.png',
        'Assets/Graphics/tom_hurt9.png',
        'Assets/Graphics/tom_hurt10.png'
    ];
    const cloudImages = [
        'Assets/Graphics/cloud1.png',
        'Assets/Graphics/cloud2.png',
        'Assets/Graphics/cloud3.png'
    ];
    
    // Arrays om alle elementen bij te houden
    const bounceHeads = []; // reguliere stuiterende tommies
    const bulletHeads = []; // afgevuurde tommies (level 2)
    
    // Stel het hoofdtom in met de juiste afbeelding
    mainTom.style.backgroundImage = `url(${idleImage})`;
    mainTom.style.transform = `scale(2.0) rotate(${mainTomAngle}deg)`;
    
    // Restart button event listener
    restartButton.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        resetGame();
        startGame();
    });
    
    // Hoofdtom event listeners
    mainTom.addEventListener('click', () => {
        // Speel OE5.wav af
        tomClickSound.currentTime = 0;
        tomClickSound.play().catch(error => {
            console.error('Kan tomClickSound niet afspelen:', error);
        });
        
        // Alleen in level 1 de animatie voor pratende Tom tonen
        if (gameLevel === 1) {
        // Verander naar pratende animatie
        mainTom.style.backgroundImage = `url(${talkingImage})`;
        
        // Na 1 seconde weer terug naar idle
        setTimeout(() => {
            mainTom.style.backgroundImage = `url(${idleImage})`;
        }, 1000);
        }
        
        // Geef visuele feedback door Tom1 kort 10% groter te maken (in beide levels)
        const currentScale = calculateTomScale();
        const clickScale = currentScale * 1.1; // 10% groter
        
        if (gameLevel === 2) {
            mainTom.style.transform = `scale(${clickScale}) rotate(${mainTomAngle}deg)`;
        } else {
            mainTom.style.transform = `scale(${clickScale})`;
        }
        
        // Na 3 frames (ongeveer 50ms per frame) terug naar normale grootte
        setTimeout(() => {
            if (gameLevel === 2) {
                mainTom.style.transform = `scale(${currentScale}) rotate(${mainTomAngle}deg)`;
            } else {
                mainTom.style.transform = `scale(${currentScale})`;
            }
        }, 150); // 3 frames × 50ms
        
        // Als de game nog niet loopt, start deze
        if (!isGameRunning) {
            startGame();
        } else {
            // Anders spawnen we een nieuwe stuiterende Tommie (in beide levels)
            spawnBouncingTommie();
        }
    });
    
    // Maak Tom1 aanklikbaar voor mobiel zonder schieten
    mainTom.addEventListener('touchstart', function(e) {
        // Voorkom de standaard touchevent en bubble naar handleTouchStart
        e.stopPropagation(); // Stop propagatie zodat handleTouchStart niet wordt aangeroepen
        e.preventDefault();
        
        // Simuleer een muisklik op Tom1 om nieuwe Tommies te spawnen
        const clickEvent = new MouseEvent('click', {
            bubbles: false, // Zet op false om te voorkomen dat het zich verder verspreidt
            cancelable: true,
            view: window
        });
        mainTom.dispatchEvent(clickEvent);
    }, { passive: false });
    
    // Muisbeweging volgen voor desktop besturing
    document.addEventListener('mousemove', (e) => {
        if (gameLevel === 2 && !isMobileDevice) {
            // Bereken het middelpunt van het scherm
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            // Bereken de afstand tussen aanraakpunt en het midden (Tom1)
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            // Negeer kleine bewegingen dicht bij het centrum om instabiliteit te voorkomen
            if (distance < 10) {
                return; // Voorkom rotatie bij kleine bewegingen rond het centrum
            }
            
            // Bereken de hoek in graden
            let newAngle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // Voeg 180 graden toe zodat Tom1 de tegenovergestelde kant op draait
            newAngle = (newAngle + 180) % 360;
            
            // Direct de nieuwe hoek instellen zonder geleidelijke rotatie
            mainTomAngle = newAngle;
            
            // Update Tom1's rotatie
            const currentScale = calculateTomScale();
            mainTom.style.transform = `scale(${currentScale}) rotate(${mainTomAngle}deg)`;
        }
    });
    
    // Muisklik voor schieten op desktop
    document.addEventListener('click', (e) => {
        if (gameLevel === 2 && !isMobileDevice && !isMouseOverMainTom()) {
            // Voorkom dat clicks op Tom1 zelf als schoten worden geregistreerd
            // Speel het pew geluid af bij het klikken
            pewSound.currentTime = 0;
            pewSound.play().catch(error => {
                console.error('Kan pewSound niet afspelen:', error);
            });
            
            // Vuur een Tommie af
            fireBulletTommie();
        }
    });
    
    // Toetsenbord event listeners (behouden voor toegankelijkheid, maar niet meer gebruikt voor primaire besturing)
    document.addEventListener('keydown', (e) => {
        keysPressed[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
    });
    
    // Muis over hoofdTom check
    function isMouseOverMainTom() {
        return mainTom.matches(':hover');
    }
    
    // Functie om de hitCount bij te werken en weer te geven
    function updateScore() {
        scoreDisplay.textContent = `Score: ${hitCount}`;
    }
    
    // Helper functie om de huidige schaal van Tom1 te berekenen
    function calculateTomScale() {
        // 1% reductie per hit (start met 2.0 en eindig met 1.9 na 10 hits)
        const scaleReduction = 1 - (0.01 * (MAX_HEALTH - tomHealth));
        return 2.0 * scaleReduction;
    }
    
    // Update functie voor animatie
    function update() {
        if (!isGameRunning) return;
        
        gameTime += UPDATE_INTERVAL;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Controleer hover status voor zowel level 1 als 2
        if (isMouseOverMainTom()) {
            mainTom.classList.add('ready-to-fire');
            
            // Pas de schaal toe met huidige gezondheid factor
            const currentScale = calculateTomScale();
            const hoverScale = currentScale * 1.1; // 10% groter bij hover
            
            if (gameLevel === 2) {
                mainTom.style.transform = `scale(${hoverScale}) rotate(${mainTomAngle}deg)`;
            } else {
                mainTom.style.transform = `scale(${hoverScale})`;
            }
        } else {
            mainTom.classList.remove('ready-to-fire');
            
            // Terug naar normale schaal met gezondheid factor
            const currentScale = calculateTomScale();
            
            if (gameLevel === 2) {
                mainTom.style.transform = `scale(${currentScale}) rotate(${mainTomAngle}deg)`;
            } else {
                mainTom.style.transform = `scale(${currentScale})`;
            }
        }
        
        // Beperk het aantal stuiterende hoofden ALLEEN op mobiele apparaten voor betere prestaties
        if (isMobileDevice && bounceHeads.length > MAX_BOUNCING_HEADS) {
            // Verwijder de oudste hoofden
            const toRemove = bounceHeads.length - MAX_BOUNCING_HEADS;
            for (let i = 0; i < toRemove; i++) {
                if (bounceHeads[i] && bounceHeads[i].element) {
                    bounceHeads[i].element.remove();
                }
            }
            bounceHeads.splice(0, toRemove);
        }
        
        // Beperk het aantal bullet hoofden op mobiel voor betere prestaties
        // Op desktop limiteren we ze ook enigszins voor stabiliteit, maar met een hogere grens
        if (bulletHeads.length > MAX_BULLET_HEADS) {
            // Verwijder de oudste hoofden
            const toRemove = bulletHeads.length - MAX_BULLET_HEADS;
            for (let i = 0; i < toRemove; i++) {
                if (bulletHeads[i] && bulletHeads[i].element) {
                    bulletHeads[i].element.remove();
                }
            }
            bulletHeads.splice(0, toRemove);
        }
        
        // Update stuiterende Tommies
        for (let i = bounceHeads.length - 1; i >= 0; i--) {
            const head = bounceHeads[i];
            
            // Pas snelheid toe op basis van huidige multiplier
            const adjustedVx = head.vx * currentSpeedMultiplier;
            const adjustedVy = head.vy * currentSpeedMultiplier;
            
            // Update positie
            head.x += adjustedVx;
            head.y += adjustedVy;
            
            // Controleer botsing met randen
            let collision = false;
            
            // Horizontale botsing
            if (head.x <= 0) {
                head.x = 0;
                head.vx = Math.abs(head.vx);
                collision = true;
            } else if (head.x >= width - HEAD_SIZE) {
                head.x = width - HEAD_SIZE;
                head.vx = -Math.abs(head.vx);
                collision = true;
            }
            
            // Verticale botsing
            if (head.y <= 0) {
                head.y = 0;
                head.vy = Math.abs(head.vy);
                collision = true;
            } else if (head.y >= height - HEAD_SIZE) {
                head.y = height - HEAD_SIZE;
                head.vy = -Math.abs(head.vy);
                collision = true;
            }
            
            // Als er een botsing is, laat het hoofd praten en speel een geluid
            if (collision) {
                playRandomSound();
                makeHeadTalk(head);
            }
            
            // Update DOM element positie
            head.element.style.left = `${head.x}px`;
            head.element.style.top = `${head.y}px`;
        }
        
        // Update afgevuurde Tommies (level 2)
        for (let i = bulletHeads.length - 1; i >= 0; i--) {
            const bullet = bulletHeads[i];
            
            // Update positie
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            // Controleer eerst of de bullet Tom1 raakt voordat we andere botsingen checken
            if (checkTomCollision(bullet)) {
                damageMainTom();
                removeTommie(bullet, bulletHeads);
                continue; // Ga naar de volgende bullet
            }
            
            // Controleer botsing met randen
            let collision = false;
            
            // Horizontale botsing
            if (bullet.x <= 0) {
                bullet.x = 0;
                bullet.vx = Math.abs(bullet.vx);
                collision = true;
                // Update de hoek bij botsing
                bullet.angle = Math.atan2(bullet.vy, bullet.vx) * (180 / Math.PI);
            } else if (bullet.x >= width - HEAD_SIZE) {
                bullet.x = width - HEAD_SIZE;
                bullet.vx = -Math.abs(bullet.vx);
                collision = true;
                // Update de hoek bij botsing
                bullet.angle = Math.atan2(bullet.vy, bullet.vx) * (180 / Math.PI);
            }
            
            // Verticale botsing
            if (bullet.y <= 0) {
                bullet.y = 0;
                bullet.vy = Math.abs(bullet.vy);
                collision = true;
                // Update de hoek bij botsing
                bullet.angle = Math.atan2(bullet.vy, bullet.vx) * (180 / Math.PI);
            } else if (bullet.y >= height - HEAD_SIZE) {
                bullet.y = height - HEAD_SIZE;
                bullet.vy = -Math.abs(bullet.vy);
                collision = true;
                // Update de hoek bij botsing
                bullet.angle = Math.atan2(bullet.vy, bullet.vx) * (180 / Math.PI);
            }
            
            // Als er een botsing met een rand is, laat het hoofd praten
            // en verander de isOwn eigenschap naar false (nu "vijandig")
            if (collision) {
                makeHeadTalk(bullet);
                bullet.isOwn = false; // Na botsing met een muur is het niet meer "eigen"
            }
            
            // Update DOM element positie en rotatie
            bullet.element.style.left = `${bullet.x}px`;
            bullet.element.style.top = `${bullet.y}px`;
            bullet.element.style.transform = `rotate(${bullet.angle}deg)`;
        }
        
        // Controleer botsingen tussen bullets en heads
        checkBulletHeadCollisions();
        
        // Controleer botsingen tussen spits onderling
        checkSpitCollisions();
    }
    
    // Animatie interval variabele
    let animationInterval = null;
    
    // Functie om de game te starten
    function startGame() {
        isGameRunning = true;
        gameTime = 0;
        gameLevel = 1;
        gameStartTime = Date.now();
        tomHealth = MAX_HEALTH;
        hitCount = 0;
        
        // Game elementen tonen, maar startscherm niet verbergen zodat Tom1 zichtbaar blijft
        // Alleen het gameContainer tonen voor de spellogica
        gameContainer.style.display = 'block';
        controls.style.display = 'none'; // Verborgen houden tot level 2
        healthContainer.style.display = 'none'; // Verborgen houden tot level 2
        healthBar.style.width = '100%';
        
        // Maak drijvende wolken
        createClouds();
        
        // Timer voor level 2
        setTimeout(() => {
            if (isGameRunning) {
                startLevel2();
            }
        }, TIME_TO_LEVEL_2);
        
        // Start de achtergrondmuziek
        startBackgroundMusic();
        
        // Spawn de eerste Tommie
        spawnBouncingTommie();
        
        // Start animatie met setInterval in plaats van requestAnimationFrame
        // voor een consistentere framerate op mobiele apparaten
        if (animationInterval) {
            clearInterval(animationInterval);
        }
        animationInterval = setInterval(update, UPDATE_INTERVAL);
    }
    
    // Functie om de game te resetten
    function resetGame() {
        // Stop de animatie interval
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        
        // Reset alle variabelen
        currentSpeedMultiplier = 1.0;
        tommieCount = 0;
        bulletCount = 0;
        gameTime = 0;
        gameLevel = 1;
        mainTomAngle = 0;
        tomHealth = MAX_HEALTH;
        hitCount = 0;
        spitSizeMultiplier = 1.0; // Reset de grootte van spit-projectielen
        
        // Reset gyroscoop controls
        if (useGyroscope) {
            // controlIndicator is verwijderd, dus deze regel is niet meer nodig
        }
        
        // Verwijder alle bestaande hoofden
        bounceHeads.forEach(head => {
            head.element.remove();
        });
        bulletHeads.forEach(bullet => {
            bullet.element.remove();
        });
        
        // Leeg de arrays
        bounceHeads.length = 0;
        bulletHeads.length = 0;
        
        // Reset de DOM
        mainTom.style.transform = `scale(2.0)`; // Tom1 weer terug naar originele grootte
        healthBar.style.width = '100%';
        healthBar.style.backgroundColor = '#2ecc71'; // Reset naar groen
        
        // Reset Tom afbeelding naar de originele
        mainTom.style.backgroundImage = `url(${idleImage})`;
        
        // Update de score
        updateScore();
        
        // Verberg besturingselementen
        mobileControls.style.display = 'none';
        controls.style.display = 'none';
        scoreContainer.style.display = 'none';
        
        // Reset de feedback tekst bij een nieuwe game
        const scoreFeedbackElement = document.getElementById('score-feedback');
        if (scoreFeedbackElement) {
            scoreFeedbackElement.textContent = '';
            scoreFeedbackElement.className = '';
        }
        
        // Stop de muziek
        if (musicPlaying) {
            bgMusic.pause();
            bgMusic.currentTime = 0;
            musicPlaying = false;
        }
    }
    
    // Functie om achtergrondmuziek te starten
    function startBackgroundMusic() {
            bgMusic.play().catch(error => {
            console.error('Kan achtergrondmuziek niet afspelen:', error);
            
            // Voor iOS: audio moet gestart worden na gebruikersinteractie
            if (isMobileDevice) {
                console.log('Mobiel apparaat gedetecteerd, audio wordt gestart na eerste klik');
                
                // Eenmalige event listener voor de eerste klik
                const unlockAudio = () => {
                    bgMusic.play().catch(e => console.error('Audio nog steeds niet afgespeeld:', e));
                    document.removeEventListener('touchstart', unlockAudio);
                    document.removeEventListener('click', unlockAudio);
                };
                
                document.addEventListener('touchstart', unlockAudio, { once: true });
                document.addEventListener('click', unlockAudio, { once: true });
            }
        });
        
        musicPlaying = true;
    }
    
    // Functie om wolken te maken
    function createClouds() {
        for (let i = 0; i < CLOUD_COUNT; i++) {
            createCloud();
        }
    }
    
    // Functie om een individuele wolk te maken
    function createCloud() {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // Kies een willekeurige wolkafbeelding
        const cloudImage = cloudImages[Math.floor(Math.random() * cloudImages.length)];
        cloud.style.backgroundImage = `url(${cloudImage})`;
        
        // Willekeurige eigenschappen voor de wolk
        const size = 100 + Math.random() * 200; // Groter formaat voor de afbeeldingswolken
        const top = Math.random() * window.innerHeight;
        
        // Bereken willekeurige animatieduur (langzamer voor grotere wolken)
        const speed = 30 + Math.random() * 70;
        const delay = Math.random() * 60;
        
        // Pas stijlen toe
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size}px`;
        cloud.style.top = `${top}px`;
        cloud.style.left = '-20%';
        cloud.style.opacity = 0.7 + Math.random() * 0.3;
        
        // Pas animatie toe
        cloud.style.animation = `floatCloud ${speed}s linear ${delay}s infinite`;
        
        // Voeg toe aan container
        cloudsContainer.appendChild(cloud);
    }
    
    // Start level 2
    function startLevel2() {
        gameLevel = 2;
        console.log("Level 2 gestart! Tom volgt nu je muis en je kunt klikken om te schieten.");
        
        // In level 2 behouden we het startscherm voor Tom1
        startScreen.style.display = 'flex';
        
        // Reset Tom terug naar de originele afbeelding als de gezondheid nog vol is
        if (tomHealth === MAX_HEALTH) {
            mainTom.style.backgroundImage = `url(${idleImage})`;
        }
        
        // Zorg ervoor dat Tom1 zijn juiste grootte behoudt
        const currentScale = calculateTomScale();
        mainTom.style.transform = `scale(${currentScale}) rotate(${mainTomAngle}deg)`;
        
        // Check of het een mobiel apparaat is
        if (isMobileDevice) {
            // Direct aanraakbesturing inschakelen
            enableTouchControl();
            
            // Verberg alle andere besturingselementen
            mobileControls.style.display = 'none';
            controls.style.display = 'none';
        } else {
            // Desktop browser: verberg alle besturingselementen omdat we muis gebruiken
            controls.style.display = 'none';
            mobileControls.style.display = 'none';
        }
        
        // Toon de gezondheidsbalk en score in level 2
        healthContainer.style.display = 'block';
        scoreContainer.style.display = 'block';
        
        // Stel de juiste kleur in voor de levensbalk op basis van de huidige gezondheid
        const healthPercentage = (tomHealth / MAX_HEALTH) * 100;
        if (healthPercentage > 60) {
            // Groen tot geelgroen (60-100%)
            healthBar.style.backgroundColor = `hsl(${120 * (healthPercentage/100)}, 80%, 60%)`;
        } else if (healthPercentage > 30) {
            // Geelgroen tot oranje (30-60%)
            healthBar.style.backgroundColor = `hsl(${60 * (healthPercentage/60)}, 80%, 60%)`;
        } else {
            // Oranje tot rood (0-30%)
            healthBar.style.backgroundColor = `hsl(${60 * (healthPercentage/30)}, 80%, 50%)`;
        }
        
        updateScore(); // Zet de initiële score
        
        // Voeg level 2 instructies toe
        const instructionsDiv = document.createElement('div');
        instructionsDiv.id = 'level2-instructions';
        
        // Toon instructies voor zowel mobiel als desktop in één keer
        instructionsDiv.innerHTML = `
            <h2>Level 2!</h2>
            <p>Desktop: Beweeg je muis om Tom te draaien en klik om te schieten</p>
            <p>Mobiel: Tik ergens op het scherm om te richten en te spugen!</p>
        `;
        
        document.body.appendChild(instructionsDiv);
        
        // Verwijder instructies na 5 seconden
        setTimeout(() => {
            const instructions = document.getElementById('level2-instructions');
            if (instructions) {
                instructions.remove();
            }
        }, 5000);
    }
    
    // Functie om gyroscoop toestemming te tonen
    function showGyroscopePermission() {
        // Op mobiel direct aanraakbesturing inschakelen zonder opties te tonen
        enableTouchControl();
    }
    
    // Functie om aanraakbesturing te activeren
    function enableTouchControl() {
        // Verberg permission scherm
        gyroPermission.style.display = 'none';
        
        // Verberg knoppen
        mobileControls.style.display = 'none';
        
        useTouchControl = true;
        useGyroscope = false;
        
        // Voeg touch event listeners toe
        document.addEventListener('touchstart', handleTouchStart);
        
        console.log('Aanraakbesturing ingeschakeld: tik ergens op het scherm om te richten en te schieten');
    }
    
    // Handlers voor aanraakbesturing
    function handleTouchStart(e) {
        if (gameLevel === 2 && useTouchControl) {
            e.preventDefault(); // Voorkom standaard touchgedrag
            
            // Bereken het middelpunt van het scherm
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            // Bereken de afstand tussen aanraakpunt en het midden (Tom1)
            const dx = e.touches[0].clientX - centerX;
            const dy = e.touches[0].clientY - centerY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            // Als de aanraking te dicht bij Tom1 is, negeer de beweging
            const tomRadius = isMobileDevice ? 50 : 100; // Kleinere radius op mobiel
            
            if (distance <= tomRadius) {
                return; // Ga niet verder met de aanraakverwerking
            }
            
            // Bereken de hoek in graden op basis van aanraakpositie
            updateTomAngleFromTouch(e.touches[0]);
            
            // Vuur onmiddellijk een projectiel af in die richting
            if (!isFiring) {
                isFiring = true;
                
                // Speel het pew geluid af
                pewSound.currentTime = 0;
                pewSound.play().catch(error => {
                    console.error('Kan pewSound niet afspelen:', error);
                });
                
                // Vuur projectiel af
                fireBulletTommie();
                
                // Reset vlaggetje na korte vertraging
                setTimeout(() => {
                    isFiring = false;
                }, 300);
            }
            
            // Voeg touchmove event toe voor blijvende rotatie tijdens aanraking
            document.addEventListener('touchmove', handleTouchMove);
            
            // Verwijder touchmove event wanneer de aanraking eindigt
            document.addEventListener('touchend', function removeTouchMove() {
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', removeTouchMove);
            });
        }
    }
    
    // Handler voor touchmove om Tom1 te laten blijven draaien tijdens aanraking
    function handleTouchMove(e) {
        if (gameLevel === 2 && useTouchControl) {
            e.preventDefault(); // Voorkom standaard touchgedrag zoals scrollen
            
            // Bereken het middelpunt van het scherm
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            // Bereken de afstand tussen aanraakpunt en het midden (Tom1)
            const dx = e.touches[0].clientX - centerX;
            const dy = e.touches[0].clientY - centerY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            // Als de aanraking te dicht bij Tom1 is, negeer de beweging
            const tomRadius = isMobileDevice ? 50 : 100; // Kleinere radius op mobiel
            
            if (distance <= tomRadius) {
                return; // Ga niet verder met de aanraakverwerking
            }
            
            // Update Tom's hoek op basis van de nieuwe aanraakpositie
            updateTomAngleFromTouch(e.touches[0]);
        }
    }
    
    // Functie om Tom's hoek te berekenen op basis van aanraakpositie
    function updateTomAngleFromTouch(touch) {
        // Bereken het middelpunt van het scherm
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Bereken de hoek tussen het middelpunt en de aanraakpositie
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Negeer kleine bewegingen dicht bij het centrum om instabiliteit te voorkomen
        if (distance < 10) {
            return; // Voorkom rotatie bij kleine bewegingen rond het centrum
        }
        
        // Bereken de hoek in graden en voeg 180 graden toe zodat Tom1 de tegenovergestelde kant op draait
        const newAngle = (Math.atan2(dy, dx) * (180 / Math.PI) + 180) % 360;
        
        // Stel de nieuwe hoek direct in zonder geleidelijke verandering
        mainTomAngle = newAngle;
        
        // Update Tom1's rotatie
        const currentScale = calculateTomScale();
        mainTom.style.transform = `scale(${currentScale}) rotate(${mainTomAngle}deg)`;
    }
    
    // Functie om gyroscoop te activeren
    function enableGyroscope() {
        // Verberg permission scherm
        gyroPermission.style.display = 'none';
        
        // Verberg knoppen
        mobileControls.style.display = 'none';
        
        useGyroscope = true;
        
        // Vraag toestemming voor deviceorientation (nodig voor iOS)
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ apparaten
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        gyroscopePermission = true;
                        window.addEventListener('deviceorientation', handleOrientation);
                    } else {
                        console.log('Gyroscoop toestemming geweigerd');
                        fallbackToButtonControls();
                    }
                })
                .catch(console.error);
        } else {
            // Andere apparaten die geen expliciete toestemming nodig hebben
            gyroscopePermission = true;
            window.addEventListener('deviceorientation', handleOrientation);
        }
        
        // Voeg touch event toe voor spugen
        document.addEventListener('touchstart', handleTouchForSpit);
    }
    
    // Functie om terug te vallen op knopbediening
    function fallbackToButtonControls() {
        useGyroscope = false;
        useTouchControl = false;
        enableButtonControls();
    }
    
    // Functie om knopbediening te activeren
    function enableButtonControls() {
        gyroPermission.style.display = 'none';
        mobileControls.style.display = 'flex';
        useGyroscope = false;
        useTouchControl = false;
    }
    
    // Handler voor gyroscoop data
    function handleOrientation(event) {
        if (gameLevel === 2 && useGyroscope) {
            // Beta is kanteling voor-achter, gamma is links-rechts
            const gamma = event.gamma; // Bereik: -90 tot 90
            
            if (gamma !== null) {
                // Zet gamma om naar rotatie hoek (vermenigvuldigen met 2 voor meer responsiviteit)
                // 90 graden kanteling = 180 graden rotatie
                mainTomAngle = gamma * 2;
                
                // Update Tom1's rotatie
                const currentScale = 2.0 * (tomHealth / MAX_HEALTH);
                mainTom.style.transform = `scale(${currentScale}) rotate(${mainTomAngle}deg)`;
            }
        }
    }
    
    // Handler voor tikken om te spugen in gyroscoop modus
    function handleTouchForSpit(e) {
        if (gameLevel === 2 && useGyroscope && !isFiring) {
            // Voorkom standaard touchgedrag
            e.preventDefault();
            
            isFiring = true;
            
            // Vuur projectiel af
            fireBulletTommie();
            
            // Reset vlaggetje na korte vertraging
            setTimeout(() => {
                isFiring = false;
            }, 300);
        }
    }
    
    // Functie om mobile touch controls in te stellen
    function setupMobileControls() {
        // Links draaien
        rotateLeftBtn.addEventListener('touchstart', function(e) {
            e.preventDefault(); // Voorkom schuiven/zoomen
            keysPressed['ArrowLeft'] = true;
        });
        
        rotateLeftBtn.addEventListener('touchend', function() {
            keysPressed['ArrowLeft'] = false;
        });
        
        // Rechts draaien
        rotateRightBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            keysPressed['ArrowRight'] = true;
        });
        
        rotateRightBtn.addEventListener('touchend', function() {
            keysPressed['ArrowRight'] = false;
        });
        
        // Spuug knop
        spitButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (gameLevel === 2 && !isFiring) {
                isFiring = true;
                // Speel het pew geluid af
                pewSound.currentTime = 0;
                pewSound.play().catch(error => {
                    console.error('Kan pewSound niet afspelen:', error);
                });
                
                // Vuur projectiel af
                fireBulletTommie();
            }
        });
        
        spitButton.addEventListener('touchend', function() {
            isFiring = false;
        });
        
        // Ook mouse events toevoegen voor testing op desktop
        rotateLeftBtn.addEventListener('mousedown', function() {
            keysPressed['ArrowLeft'] = true;
        });
        
        rotateLeftBtn.addEventListener('mouseup', function() {
            keysPressed['ArrowLeft'] = false;
        });
        
        rotateRightBtn.addEventListener('mousedown', function() {
            keysPressed['ArrowRight'] = true;
        });
        
        rotateRightBtn.addEventListener('mouseup', function() {
            keysPressed['ArrowRight'] = false;
        });
        
        spitButton.addEventListener('click', function() {
            if (gameLevel === 2 && !isFiring) {
                isFiring = true;
                pewSound.currentTime = 0;
                pewSound.play().catch(error => {
                    console.error('Kan pewSound niet afspelen:', error);
                });
                fireBulletTommie();
                setTimeout(() => {
                    isFiring = false;
                }, 300);
            }
        });
        
        // De oude touchstart handler voor mainTom is verwijderd 
        // omdat we nu een specifieke handler hebben die voorkomt dat er tijdens het spawnen ook wordt geschoten
    }
    
    // Game Over functie
    function gameOver() {
        isGameRunning = false;
        
        // Stop de animatie interval
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        
        // Stop de muziek
        if (musicPlaying) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
            musicPlaying = false;
        }
        
        // Bereken de score
        const totalTime = Math.floor((Date.now() - gameStartTime) / 1000); // in seconden
        
        // Bereken de efficiëntiescore (1-10)
        const efficiency = calculateEfficiency(hitCount, totalTime, MAX_HEALTH - tomHealth);
        
        // Update de score tekst
        scoreHits.textContent = `Geraakt: ${hitCount} Tommies`;
        scoreTime.textContent = `Tijd: ${totalTime} seconden`;
        
        // Pas de kleur van de spuugscore aan op basis van de score
        const scoreElement = scoreEfficiency;
        scoreElement.textContent = `JOUW SPUUGSCORE: ${efficiency}/10`;
        
        // Voeg een scorebeoordelingstekst toe op basis van de score
        const scoreFeedbackElement = document.getElementById('score-feedback');
        if (!scoreFeedbackElement) {
            // Maak het element aan als het nog niet bestaat
            const feedbackElement = document.createElement('p');
            feedbackElement.id = 'score-feedback';
            // Voeg het element toe direct na de scoreEfficiency
            scoreEfficiency.insertAdjacentElement('afterend', feedbackElement);
        }
        
        const feedbackElement = document.getElementById('score-feedback');
        // Bepaal het feedback bericht op basis van de score
        if (efficiency >= 7) {
            feedbackElement.textContent = "WAUW JIJ HEBT ECHT EEN HEKEL AAN TOM!";
            feedbackElement.className = 'score-high';
        } else if (efficiency >= 4) {
            feedbackElement.textContent = "HM, JIJ HEBT EEN GEMIDDELDE HEKEL AAN TOM";
            feedbackElement.className = 'score-medium';
        } else {
            feedbackElement.textContent = "AW, JIJ HOUDT VAST ERG VAN TOM WANT GIJ SPUUGT VUR GINNE METER";
            feedbackElement.className = 'score-low';
        }
        
        // Verwijder bestaande kleurstijlen van scoreEfficiency
        scoreElement.classList.remove('score-high', 'score-medium', 'score-low');
        
        // Voeg de juiste kleurklasse toe aan scoreEfficiency
        if (efficiency >= 7) {
            scoreElement.classList.add('score-high'); // Groen voor hoge score
        } else if (efficiency >= 4) {
            scoreElement.classList.add('score-medium'); // Geel voor gemiddelde score
        } else {
            scoreElement.classList.add('score-low'); // Rood voor lage score
        }
        
        // Maak het invoerveld voor spelersnaam aan als het nog niet bestaat
        let nameInputContainer = document.getElementById('name-input-container');
        if (!nameInputContainer) {
            nameInputContainer = document.createElement('div');
            nameInputContainer.id = 'name-input-container';
            nameInputContainer.className = 'name-input-container';
            
            const nameLabel = document.createElement('label');
            nameLabel.htmlFor = 'player-name';
            nameLabel.textContent = 'JOUW NAAM:';
            
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.id = 'player-name';
            nameInput.placeholder = 'Voer je naam in';
            nameInput.maxLength = 20;
            
            const submitButton = document.createElement('button');
            submitButton.id = 'submit-score';
            submitButton.textContent = 'OPSLAAN';
            submitButton.addEventListener('click', submitScore);
            
            nameInputContainer.appendChild(nameLabel);
            nameInputContainer.appendChild(nameInput);
            nameInputContainer.appendChild(submitButton);
            
            // Voeg het toe tussen score-feedback en restart-button
            const restartButtonElement = document.getElementById('restart-button');
            restartButtonElement.parentNode.insertBefore(nameInputContainer, restartButtonElement);
        }
        
        // Maak het scorebord aan als het nog niet bestaat
        let scoreboard = document.getElementById('scoreboard');
        if (!scoreboard) {
            scoreboard = document.createElement('div');
            scoreboard.id = 'scoreboard';
            scoreboard.className = 'scoreboard';
            
            const scoreboardTitle = document.createElement('h2');
            scoreboardTitle.textContent = 'SCOREBORD';
            
            const scoresList = document.createElement('div');
            scoresList.id = 'scores-list';
            scoresList.className = 'scores-list';
            
            scoreboard.appendChild(scoreboardTitle);
            scoreboard.appendChild(scoresList);
            
            // Voeg het toe na het naamformulier
            const restartButtonElement = document.getElementById('restart-button');
            restartButtonElement.parentNode.insertBefore(scoreboard, restartButtonElement);
        }
        
        // Toon het game over scherm
        gameOverScreen.style.display = 'flex';
        
        // Verberg de levensbalk, score en YouTube playlist
        healthContainer.style.display = 'none';
        scoreContainer.style.display = 'none';
        youtubeContainer.style.display = 'none';
        
        // Toon het startscherm weer (behind the game over screen)
        startScreen.style.display = 'flex';
        mainTom.style.transform = 'scale(2.0)';
        
        // Laad en toon de bestaande scores
        displayScoreboard();
    }
    
    // Functie om score in te dienen en op te slaan
    function submitScore() {
        const playerNameInput = document.getElementById('player-name');
        const playerName = playerNameInput.value.trim();
        
        if (!playerName) {
            alert('Voer een naam in om je score op te slaan!');
            return;
        }
        
        // Bereken de score opnieuw (deze zal gelijk zijn aan die in gameOver)
        const totalTime = Math.floor((Date.now() - gameStartTime) / 1000);
        const efficiency = calculateEfficiency(hitCount, totalTime, MAX_HEALTH - tomHealth);
        
        // Maak een score object
        const scoreEntry = {
            name: playerName,
            score: efficiency,
            hits: hitCount,
            time: totalTime,
            date: new Date().toISOString()
        };
        
        // Haal bestaande scores op uit localStorage
        let scores = JSON.parse(localStorage.getItem('tomGameScores') || '[]');
        
        // Voeg nieuwe score toe
        scores.push(scoreEntry);
        
        // Sorteer op score (hoog naar laag)
        scores.sort((a, b) => b.score - a.score);
        
        // Beperk tot de top 10 scores
        if (scores.length > 10) {
            scores = scores.slice(0, 10);
        }
        
        // Sla opnieuw op in localStorage
        localStorage.setItem('tomGameScores', JSON.stringify(scores));
        
        // Update het weergegeven scorebord
        displayScoreboard();
        
        // Geef feedback aan de gebruiker
        playerNameInput.value = '';
        const submitButton = document.getElementById('submit-score');
        submitButton.textContent = 'OPGESLAGEN!';
        submitButton.disabled = true;
        
        // Reset de knop na 2 seconden
        setTimeout(() => {
            submitButton.textContent = 'OPSLAAN';
            submitButton.disabled = false;
        }, 2000);
    }
    
    // Functie om het scorebord weer te geven
    function displayScoreboard() {
        const scoresList = document.getElementById('scores-list');
        if (!scoresList) return;
        
        // Maak het scorebord leeg
        scoresList.innerHTML = '';
        
        // Haal de scores op uit localStorage
        const scores = JSON.parse(localStorage.getItem('tomGameScores') || '[]');
        
        if (scores.length === 0) {
            // Als er geen scores zijn, toon een bericht
            const noScores = document.createElement('p');
            noScores.textContent = 'Nog geen scores. Wees de eerste!';
            scoresList.appendChild(noScores);
            return;
        }
        
        // Maak een tabel voor de scores
        const table = document.createElement('table');
        
        // Maak de tabelkop
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Voeg kolomkoppen toe
        const headers = ['RANG', 'NAAM', 'SCORE', 'HITS', 'TIJD'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Maak de tabelinhoud
        const tbody = document.createElement('tbody');
        
        // Voeg elke score toe aan de tabel
        scores.forEach((scoreEntry, index) => {
            const row = document.createElement('tr');
            
            // Bepaal de rij-klasse op basis van de score
            if (scoreEntry.score >= 7) {
                row.className = 'score-high-row';
            } else if (scoreEntry.score >= 4) {
                row.className = 'score-medium-row';
            } else {
                row.className = 'score-low-row';
            }
            
            // Rang kolom (1-10)
            const rankCell = document.createElement('td');
            rankCell.textContent = index + 1;
            row.appendChild(rankCell);
            
            // Naam kolom
            const nameCell = document.createElement('td');
            nameCell.textContent = scoreEntry.name;
            row.appendChild(nameCell);
            
            // Score kolom
            const scoreCell = document.createElement('td');
            scoreCell.textContent = `${scoreEntry.score}/10`;
            row.appendChild(scoreCell);
            
            // Hits kolom
            const hitsCell = document.createElement('td');
            hitsCell.textContent = scoreEntry.hits;
            row.appendChild(hitsCell);
            
            // Tijd kolom (formatteren naar mm:ss)
            const timeCell = document.createElement('td');
            const minutes = Math.floor(scoreEntry.time / 60);
            const seconds = scoreEntry.time % 60;
            timeCell.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            row.appendChild(timeCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        scoresList.appendChild(table);
    }
    
    // Functie om de efficiëntiescore te berekenen (1-10)
    function calculateEfficiency(hits, time, damage) {
        // Basis parameters voor de berekening
        const hitsPerSecond = hits / Math.max(time, 1); // Voorkom delen door nul
        
        // Basisefficiëntie berekenen
        let score = 0;
        
        // Formule voor efficiency:
        // - Meer hits = beter
        // - Minder schade = beter
        // - Kortere tijd met veel hits = beter
        
        // Hits per seconde hebben een grote impact
        score += hitsPerSecond * 5; // 1 hit per seconde geeft 5 punten
        
        // Minder schade geeft bonuspunten
        score += (MAX_HEALTH - damage) / MAX_HEALTH * 4; // Geen schade geeft 4 extra punten
        
        // Minimaal 30 seconden spelen geeft een basispunt
        score += (time >= 30) ? 1 : 0;
        
        // Normaliseer score tussen 1-10
        score = Math.max(1, Math.min(10, Math.round(score)));
        
        return score;
    }
    
    // Reduceer Tom's gezondheid
    function damageMainTom() {
        // Bereken de huidige damage index voordat we de gezondheid verminderen
        // Damage index is 0-9, waar 0 betekent geen damage (nog MAX_HEALTH)
        // en 9 betekent bijna dood (1 health over)
        const currentDamageIndex = MAX_HEALTH - tomHealth - 1;
        
        // Verlaag de gezondheid
        tomHealth--;
        
        // Update de levensbalk
        const healthPercentage = (tomHealth / MAX_HEALTH) * 100;
        healthBar.style.width = `${healthPercentage}%`;
        
        // Update de kleur van de levensbalk op basis van gezondheid percentage
        // Van groen (100%) naar rood (0%)
        if (healthPercentage > 60) {
            // Groen tot geelgroen (60-100%)
            healthBar.style.backgroundColor = `hsl(${120 * (healthPercentage/100)}, 80%, 60%)`;
        } else if (healthPercentage > 30) {
            // Geelgroen tot oranje (30-60%)
            healthBar.style.backgroundColor = `hsl(${60 * (healthPercentage/60)}, 80%, 60%)`;
        } else {
            // Oranje tot rood (0-30%)
            healthBar.style.backgroundColor = `hsl(${60 * (healthPercentage/30)}, 80%, 50%)`;
        }
        
        // Bereken de nieuwe damage index
        const newDamageIndex = MAX_HEALTH - tomHealth - 1;
        
        // Toon tijdelijk de hurt animatie
        mainTom.style.backgroundImage = `url(${faceHurtImage})`;
        
        // Maak Tom1 slechts 1% kleiner per hit
        // Start met 2.0 (200%) en eindig met 1.9 (190%) na 10 hits
        const scaleReduction = 1 - (0.01 * (MAX_HEALTH - tomHealth)); // 1% reductie per hit
        const currentScale = 2.0 * scaleReduction;
        
        if (gameLevel === 2) {
            mainTom.style.transform = `scale(${currentScale}) rotate(${mainTomAngle}deg)`;
        } else {
            mainTom.style.transform = `scale(${currentScale})`;
        }
        
        // Speel het tomgeraakt.wav geluid af
        tomHitSound.currentTime = 0;
        tomHitSound.play().catch(error => {
            console.error('Kan tomHitSound niet afspelen:', error);
        });
        
        // Na een korte tijd terug naar de juiste beschadigde afbeelding
        setTimeout(() => {
            // Als we in level 2 zijn en Tom1 is beschadigd, toon de juiste beschadigde Tom afbeelding
            if (gameLevel === 2 && tomHealth < MAX_HEALTH) {
                // Pak de juiste beschadigde afbeelding op basis van de huidige damage index
                mainTom.style.backgroundImage = `url(${tomHurtImages[newDamageIndex]})`;
            } else {
                // In level 1 of als gezondheid nog vol is, gebruik de normale idle afbeelding
                mainTom.style.backgroundImage = `url(${idleImage})`;
            }
        }, 500);
        
        // Als de gezondheid op is, game over
        if (tomHealth <= 0) {
            gameOver();
        }
        
        // Verklein spit-projectielen met 10% (cumulatief)
        // Dit gebeurt ALLEEN als Tom1 wordt geraakt
        spitSizeMultiplier *= SPIT_SIZE_REDUCTION;
        
        // Pas de grootte toe op alle bestaande spit-projectielen
        bulletHeads.forEach(bullet => {
            const currentSize = HEAD_SIZE * spitSizeMultiplier;
            bullet.element.style.width = `${currentSize}px`;
            bullet.element.style.height = `${currentSize}px`;
        });
    }
    
    // Functie om een willekeurig geluid af te spelen
    function playRandomSound() {
        // Op mobiel minder vaak geluiden afspelen om prestaties te verbeteren
        if (isMobileDevice && Math.random() > 0.5) {
            return; // 50% kans om het geluid over te slaan op mobiel
        }
        
        const randomIndex = Math.floor(Math.random() * soundEffects.length);
        const sound = soundEffects[randomIndex];
        
        // Reset audio en speel af
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.error('Kan geluid niet afspelen:', error);
        });
    }
    
    // Functie om een nieuwe stuiterende Tommie te spawnen
    function spawnBouncingTommie() {
        // Controleer of we het maximale aantal stuiterende hoofden hebben bereikt (alleen op mobiel)
        if (isMobileDevice && bounceHeads.length >= MAX_BOUNCING_HEADS) {
            // Verwijder de oudste Tommie voordat we een nieuwe toevoegen
            if (bounceHeads[0] && bounceHeads[0].element) {
                bounceHeads[0].element.remove();
            }
            bounceHeads.shift();
        }
        
        tommieCount++;
        console.log(`Nieuwe stuiterende Tommie #${tommieCount} gespawnt`);
        
        // Laat Tom1 oplichten bij het spawnen van een nieuwe tommie
        createTomGlow();
        
        const tommie = document.createElement('div');
        tommie.className = 'tom-head';
        tommie.dataset.type = 'bounce';
        
        // Begin in het midden van het scherm (zelfde positie als hoofdTom)
        const centerX = window.innerWidth / 2 - HEAD_SIZE / 2;
        const centerY = window.innerHeight / 2 - HEAD_SIZE / 2;
        
        // Willekeurige snelheid en richting
        const speed = (MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED));
        const angle = Math.random() * Math.PI * 2;
        
        // Tommie opties
        const tommieOptions = {
            element: tommie,
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            isTalking: false,
            talkingTimeout: null
        };
        
        // Voeg de Tommie toe aan de container
        tommie.style.backgroundImage = `url(${idleImage})`;
        tommie.style.left = `${centerX}px`;
        tommie.style.top = `${centerY}px`;
        tommie.style.zIndex = '1'; // Zorg dat Tommies onder de hoofdTom verschijnen
        gameContainer.appendChild(tommie);
        
        // Voeg de Tommie toe aan de array
        bounceHeads.push(tommieOptions);
    }
    
    // Functie om Tom1 te laten oplichten met een vervaagde lichtcirkel
    function createTomGlow() {
        // Maak een nieuw div element voor de glow
        const glowElement = document.createElement('div');
        
        // Bereken de positie voor de glow (gecentreerd op Tom1)
        const tomRect = mainTom.getBoundingClientRect();
        const tomCenterX = tomRect.left + tomRect.width / 2;
        const tomCenterY = tomRect.top + tomRect.height / 2;
        
        // Bepaal de grootte van de glow (half zo groot als voorheen)
        const glowSize = Math.max(tomRect.width, tomRect.height) * 0.55; // Ongeveer half zo groot
        
        // Stel de stijl in
        glowElement.style.position = 'fixed';
        glowElement.style.left = `${tomCenterX - glowSize/2}px`;
        glowElement.style.top = `${tomCenterY - glowSize/2}px`;
        glowElement.style.width = `${glowSize}px`;
        glowElement.style.height = `${glowSize}px`;
        glowElement.style.backgroundColor = '#ffffff';
        glowElement.style.borderRadius = '50%';
        glowElement.style.boxShadow = '0 0 10px 5px white';
        glowElement.style.opacity = '0.7';
        glowElement.style.pointerEvents = 'none';
        glowElement.style.zIndex = '1'; // Lager zIndex zodat het achter Tom1 verschijnt
        
        // Voeg toe aan gameContainer in plaats van de body, zodat het onder Tom1 komt
        gameContainer.appendChild(glowElement);
        
        // Eenvoudige uitfade animatie
        let opacity = 0.7;
        const fadeInterval = setInterval(() => {
            opacity -= 0.05;
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                glowElement.remove();
            } else {
                glowElement.style.opacity = opacity.toString();
            }
        }, 30);
    }
    
    // Functie om een kogel-Tommie af te vuren (level 2)
    function fireBulletTommie() {
        // Controleer of we het maximale aantal bullet hoofden hebben bereikt
        if (bulletHeads.length >= MAX_BULLET_HEADS) {
            // Verwijder de oudste bullet (die niet "eigen" is) voordat we een nieuwe toevoegen
            for (let i = 0; i < bulletHeads.length; i++) {
                if (!bulletHeads[i].isOwn) {
                    bulletHeads[i].element.remove();
                    bulletHeads.splice(i, 1);
                    break;
                }
            }
            
            // Als alle bullets "eigen" zijn, verwijder dan de oudste
            if (bulletHeads.length >= MAX_BULLET_HEADS) {
                if (bulletHeads[0] && bulletHeads[0].element) {
                    bulletHeads[0].element.remove();
                }
                bulletHeads.shift();
            }
        }
        
        bulletCount++;
        
        // Speel het pew-geluid af bij elke schot
        pewSound.currentTime = 0;
        pewSound.play().catch(error => {
            console.error('Kan pewSound niet afspelen:', error);
        });
        
        // Maak een spuug-mond element en plaats het over Tom1 heen
        const spitMouth = document.createElement('div');
        spitMouth.className = 'spit-mouth';
        spitMouth.style.backgroundImage = `url(${faceSpitImage})`;
        spitMouth.style.position = 'absolute';
        spitMouth.style.width = '100%';
        spitMouth.style.height = '100%';
        spitMouth.style.left = '0';
        spitMouth.style.top = '0';
        spitMouth.style.zIndex = '10';
        
        // Voeg de spuugmond toe aan mainTom
        mainTom.appendChild(spitMouth);
        
        // Verwijder de spuugmond na 150ms (3 frames bij 60fps)
        setTimeout(() => {
            spitMouth.remove();
        }, 150);
        
        const tommie = document.createElement('div');
        tommie.className = 'tom-head bullet-tommie';
        tommie.dataset.type = 'bullet';
        
        // Startpositie in het midden van het scherm
        const centerX = window.innerWidth / 2 - (HEAD_SIZE * spitSizeMultiplier) / 2;
        const centerY = window.innerHeight / 2 - (HEAD_SIZE * spitSizeMultiplier) / 2;
        
        // Bereken de richting op basis van de hoek van Tom1
        // Herberekening van de vuurhoek: We moeten 180 graden AFTREKKEN omdat Tom1 
        // 180 graden gedraaid is ten opzichte van de cursor
        const originalAngle = mainTomAngle;
        // Tom1 kijkt 180 graden weg van de cursor, dus we moeten de vuurhoek omdraaien
        const fireAngle = (originalAngle + 180) % 360;
        const fireAngleRad = fireAngle * (Math.PI / 180);
        
        // Bereken startpositie uit de juiste kant van Tom1's gezicht
        const offsetDistance = 60; // pixels
        // We gebruiken de originele fireAngle voor de positie
        const startX = centerX + Math.cos(fireAngleRad) * offsetDistance;
        const startY = centerY + Math.sin(fireAngleRad) * offsetDistance;
        
        // Tommie opties - snelheid in de richting waar Tom1 naartoe kijkt
        const tommieOptions = {
            element: tommie,
            x: startX,
            y: startY,
            vx: Math.cos(fireAngleRad) * BULLET_SPEED,
            vy: Math.sin(fireAngleRad) * BULLET_SPEED,
            angle: fireAngle,
            isOwn: true  // Markeer deze als "eigen" spit om friendlyfire te voorkomen
        };
        
        // Pas de grootte aan op basis van de huidige spitSizeMultiplier
        const currentSize = HEAD_SIZE * spitSizeMultiplier;
        
        // Voeg de Tommie toe aan de container met de spit-afbeelding
        tommie.style.backgroundImage = `url(${spitImage})`;
        tommie.style.left = `${startX}px`;
        tommie.style.top = `${startY}px`;
        tommie.style.width = `${currentSize}px`;
        tommie.style.height = `${currentSize}px`;
        tommie.style.zIndex = '2';
        tommie.style.transform = `rotate(${fireAngle}deg)`;
        gameContainer.appendChild(tommie);
        
        // Voeg de Tommie toe aan de bullets array
        bulletHeads.push(tommieOptions);
    }
    
    // Functie om een salvo van Tommies af te vuren (level 2) - nu in één rechte lijn
    function fireTommieSalvo() {
        // In plaats van een waaier, vuren we nu 10 Tommies in één rechte lijn af
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                fireBulletTommie();
            }, i * 100); // Kleine vertraging tussen elke Tommie
        }
    }
    
    // Functie om een explosie animatie te tonen
    function showExplosion(x, y) {
        // Speel het explosie-geluid af
        splodeSound.currentTime = 0;
        splodeSound.play().catch(error => {
            console.error('Kan splodeSound niet afspelen:', error);
        });
        
        const explosion = document.createElement('div');
        explosion.className = 'splode';
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
        gameContainer.appendChild(explosion);
        
        // Verwijder de explosie na 3 frames (ongeveer 50ms per frame)
        setTimeout(() => {
            explosion.remove();
        }, 150);
    }
    
    // Functie om een hoofd te laten praten
    function makeHeadTalk(head) {
        // Voorkom dubbele animaties
        if (head.isTalking) {
            clearTimeout(head.talkingTimeout);
        }
        
        // Controleer of het een bullet (spit) is, zo ja, niet veranderen naar talking
        if (head.element.dataset.type === 'bullet') {
            return; // Behoud de spit-afbeelding voor bulletHeads
        }
        
        // Verander naar pratende animatie
        head.isTalking = true;
        head.element.style.backgroundImage = `url(${talkingImage})`;
        
        // Na 1 seconde weer terug naar idle
        head.talkingTimeout = setTimeout(() => {
            head.isTalking = false;
            head.element.style.backgroundImage = `url(${idleImage})`;
        }, 1000);
    }
    
    // Functie om te controleren of twee Tommies botsen
    function checkTommiesCollision(tommie1, tommie2) {
        // Bereken de afstand tussen de middelpunten
        const tommie1Size = tommie1.element.offsetWidth;
        const tommie2Size = tommie2.element.offsetWidth;
        
        const tommie1CenterX = tommie1.x + tommie1Size/2;
        const tommie1CenterY = tommie1.y + tommie1Size/2;
        const tommie2CenterX = tommie2.x + tommie2Size/2;
        const tommie2CenterY = tommie2.y + tommie2Size/2;
        
        const dx = tommie1CenterX - tommie2CenterX;
        const dy = tommie1CenterY - tommie2CenterY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Gebruik 40% van de werkelijke grootte voor nauwkeurigere cirkel-gebaseerde collision detection
        const tommie1Radius = tommie1Size * 0.4;
        const tommie2Radius = tommie2Size * 0.4;
        
        return distance < (tommie1Radius + tommie2Radius);
    }
    
    // Functie om te controleren of twee elementen botsen (cirkel-gebaseerd)
    function isColliding(obj1, obj2) {
        // Bereken de werkelijke grootte, rekening houdend met schaling
        const obj1Size = obj1.element.offsetWidth;
        const obj2Size = obj2.element.offsetWidth;
        
        // Bereken de middelpunten van beide elementen
        const obj1CenterX = obj1.x + obj1Size/2;
        const obj1CenterY = obj1.y + obj1Size/2;
        const obj2CenterX = obj2.x + obj2Size/2;
        const obj2CenterY = obj2.y + obj2Size/2;
        
        // Bereken de afstand tussen de middelpunten
        const dx = obj1CenterX - obj2CenterX;
        const dy = obj1CenterY - obj2CenterY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Bereken de radius van elke cirkel - gebruik 40% van de werkelijke grootte
        // voor een nauwkeurigere hit detection (Tom-hoofden zijn meer een cirkel in het midden)
        const obj1Radius = obj1Size * 0.4;
        const obj2Radius = obj2Size * 0.4;
        
        // Debug info
        /*
        console.log(`Collision check:
            Distance: ${distance}
            Obj1 radius: ${obj1Radius}
            Obj2 radius: ${obj2Radius}
            Sum: ${obj1Radius + obj2Radius}
        `);
        */
        
        // Er is een botsing als de afstand kleiner is dan de som van de stralen
        return distance < (obj1Radius + obj2Radius);
    }
    
    // Functie om te controleren of een Tommie Tom1 raakt
    function checkTomCollision(tommie) {
        // Eigen projectielen kunnen Tom1 niet raken
        if (tommie.isOwn) {
            return false;
        }
        
        // Bereken de huidige grootte van Tom1 op basis van de gezondheid
        const tomSize = 200 * (tomHealth / MAX_HEALTH);
        
        // Bereken de afstand tussen de middelpunten
        const tomCenterX = window.innerWidth / 2;
        const tomCenterY = window.innerHeight / 2;
        const tommieCenterX = tommie.x + tommie.element.offsetWidth/2;
        const tommieCenterY = tommie.y + tommie.element.offsetWidth/2;
        
        const dx = tomCenterX - tommieCenterX;
        const dy = tomCenterY - tommieCenterY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Gebruik 40% van de werkelijke grootte voor nauwkeurigere cirkel-gebaseerde collision detection
        const tomRadius = tomSize * 0.4;
        const tommieRadius = tommie.element.offsetWidth * 0.4;
        
        return distance < (tomRadius + tommieRadius);
    }
    
    // Functie om een Tommie te verwijderen
    function removeTommie(tommie, array) {
        // Als het een stuiterende Tommie is, toon een explosie en tel hit
        if (array === bounceHeads) {
            showExplosion(tommie.x, tommie.y);
            hitCount++;
        }
        
        // Verwijder het element uit de DOM
        tommie.element.remove();
        
        // Verwijder de Tommie uit de array
        const index = array.indexOf(tommie);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
    
    // Event listeners voor snelheidsknoppen
    speedUpButton.addEventListener('click', () => {
        currentSpeedMultiplier = Math.min(currentSpeedMultiplier + 0.2, 3.0);
    });
    
    speedDownButton.addEventListener('click', () => {
        currentSpeedMultiplier = Math.max(currentSpeedMultiplier - 0.2, 0.2);
    });
    
    // Pas canvas grootte aan bij venstergrootte wijziging
    window.addEventListener('resize', () => {
        // Update mobile device status en HEAD_SIZE
        detectMobileDevice();
        
        // Beperk hoofden tot het nieuwe schermformaat
        for (const head of bounceHeads.concat(bulletHeads)) {
            head.x = Math.min(head.x, window.innerWidth - HEAD_SIZE);
            head.y = Math.min(head.y, window.innerHeight - HEAD_SIZE);
            head.element.style.left = `${head.x}px`;
            head.element.style.top = `${head.y}px`;
            
            // Pas ook de afmetingen van de elementen aan
            if (isMobileDevice) {
                head.element.style.width = `${HEAD_SIZE}px`;
                head.element.style.height = `${HEAD_SIZE}px`;
            }
        }
    });

    // Detecteer of het een mobiel apparaat is
    function detectMobileDevice() {
        isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        
        // Update de HEAD_SIZE op basis van apparaattype
        HEAD_SIZE = isMobileDevice ? MOBILE_HEAD_SIZE : DESKTOP_HEAD_SIZE;
        
        // Update de configuratiewaardes op basis van apparaattype
        CLOUD_COUNT = isMobileDevice ? MOBILE_CLOUD_COUNT : DESKTOP_CLOUD_COUNT;
        MAX_BOUNCING_HEADS = isMobileDevice ? 10 : 100; // Veel hogere limiet voor desktop
        MAX_BULLET_HEADS = isMobileDevice ? 15 : 50; // Hogere limiet voor desktop
        UPDATE_INTERVAL = isMobileDevice ? 24 : 16;
        
        // Controleer of gyroscoop beschikbaar is
        gyroscopeAvailable = isMobileDevice && window.DeviceOrientationEvent;
        
        // Debug info
        console.log(`Apparaat gedetecteerd als: ${isMobileDevice ? 'mobiel' : 'desktop'}`);
        console.log(`Gyroscoop beschikbaar: ${gyroscopeAvailable}`);
        console.log(`HEAD_SIZE ingesteld op: ${HEAD_SIZE}px`);
        console.log(`CLOUD_COUNT ingesteld op: ${CLOUD_COUNT}`);
        console.log(`MAX_BOUNCING_HEADS ingesteld op: ${MAX_BOUNCING_HEADS}`);
        console.log(`MAX_BULLET_HEADS ingesteld op: ${MAX_BULLET_HEADS}`);
        console.log(`UPDATE_INTERVAL ingesteld op: ${UPDATE_INTERVAL}ms`);
    }
    
    // Voer detectie uit bij het laden
    detectMobileDevice();
    
    // Voeg de speciale touchstart handler toe aan mainTom, als deze nog niet is toegevoegd
    // We doen dit buiten detectMobileDevice zodat het maar één keer gebeurt
    if (isMobileDevice) {
        // Als mainTom bestaat (tijdens initialisatie), voeg de handler toe
        if (mainTom) {
            // Verwijder eerst eventuele bestaande handlers om dubbele toevoeging te voorkomen
            mainTom.removeEventListener('touchstart', mainTomTouchHandler);
            
            // Voeg de handler opnieuw toe
            mainTom.addEventListener('touchstart', mainTomTouchHandler, { passive: false });
            
            console.log('Speciale touchstart handler toegevoegd aan mainTom');
        }
    }
    
    window.addEventListener('resize', detectMobileDevice);
    
    // Definieer de touchstart handler functie voor mainTom
    function mainTomTouchHandler(e) {
        // Voorkom de standaard touchevent en bubble naar handleTouchStart
        e.stopPropagation(); // Stop propagatie zodat handleTouchStart niet wordt aangeroepen
        e.preventDefault();
        
        // Simuleer een muisklik op Tom1 om nieuwe Tommies te spawnen
        const clickEvent = new MouseEvent('click', {
            bubbles: false, // Zet op false om te voorkomen dat het zich verder verspreidt
            cancelable: true,
            view: window
        });
        mainTom.dispatchEvent(clickEvent);
    }

    // Controleer of een bullet een head raakt
    function checkBulletHeadCollisions() {
        for (let i = bulletHeads.length - 1; i >= 0; i--) {
            // Controleer of de index nog geldig is
            if (i >= bulletHeads.length) continue;
            
            const bullet = bulletHeads[i];
            let collisionDetected = false;
            
            for (let j = bounceHeads.length - 1; j >= 0; j--) {
                // Controleer of de index nog geldig is
                if (j >= bounceHeads.length) continue;
                
                const head = bounceHeads[j];
                
                if (isColliding(bullet, head)) {
                    // Verhoog de hitCount
                    hitCount++;
                    
                    // Update de score weergave
                    updateScore();
                    
                    // Toon explosie animatie
                    showExplosion(head.x, head.y);
                    
                    // Verwijder de bullet en head
                    bullet.element.remove();
                    head.element.remove();
                    
                    // Verwijder de bullet en head uit de arrays
                    bulletHeads.splice(i, 1);
                    bounceHeads.splice(j, 1);
                    
                    collisionDetected = true;
                    break;
                }
            }
            
            // Als er een botsing is gedetecteerd, ga dan naar de volgende bullet
            if (collisionDetected) {
                continue;
            }
        }
    }

    // Functie om een spit-vs-spit botsingsanimatie te tonen
    function showSpitVsSpitCollision(x, y) {
        // Speel het explosie-geluid af
        splodeSound.currentTime = 0;
        splodeSound.play().catch(error => {
            console.error('Kan splodeSound niet afspelen:', error);
        });
        
        const collision = document.createElement('div');
        collision.className = 'spit-collision';
        collision.style.backgroundImage = `url(${spitVsSpitImage})`;
        collision.style.left = `${x}px`;
        collision.style.top = `${y}px`;
        collision.style.width = `${HEAD_SIZE}px`;
        collision.style.height = `${HEAD_SIZE}px`;
        gameContainer.appendChild(collision);
        
        // Verwijder de animatie na 3 frames (ongeveer 50ms per frame)
        setTimeout(() => {
            collision.remove();
        }, 150);
    }
    
    // Functie om te controleren of spits met elkaar botsen
    function checkSpitCollisions() {
        for (let i = bulletHeads.length - 1; i >= 0; i--) {
            // Controleer of de index nog geldig is (kan veranderd zijn door eerdere verwijderingen)
            if (i >= bulletHeads.length) continue;
            
            const spit1 = bulletHeads[i];
            
            // Sla eigen spits over die net zijn afgevuurd (gedurende een korte tijd)
            if (spit1.isOwn) {
                continue;
            }
            
            let collisionDetected = false;
            
            for (let j = i - 1; j >= 0; j--) {
                // Controleer of de index nog geldig is
                if (j >= bulletHeads.length) continue;
                
                const spit2 = bulletHeads[j];
                
                // Controleer of één van de spits nog steeds "eigen" is en net is afgevuurd
                if (spit2.isOwn) {
                continue;
            }
            
                // Controleer of de spits elkaar raken
                if (isColliding(spit1, spit2)) {
                    // Bereken het middelpunt van de botsing
                    const collisionX = (spit1.x + spit2.x) / 2;
                    const collisionY = (spit1.y + spit2.y) / 2;
                    
                    // Toon de botsingsanimatie
                    showSpitVsSpitCollision(collisionX, collisionY);
                    
                    // Verwijder beide spits
                    spit1.element.remove();
                    spit2.element.remove();
                    
                    // Verwijder ze uit de array - eerst de hogere index verwijderen
                    // om te voorkomen dat de indices verschuiven
                    bulletHeads.splice(i, 1);
                    bulletHeads.splice(j, 1);
                    
                    collisionDetected = true;
                    break;
                }
            }
            
            // Als er een botsing is gedetecteerd, ga dan naar de volgende i-iteratie
            if (collisionDetected) {
                continue;
            }
        }
    }
}); 