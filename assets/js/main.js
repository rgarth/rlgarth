// R.L. Garth Website - Main JavaScript

// ============================================
// CONSTANTS
// ============================================

const CONFIG = {
    // Section boundaries (scroll percentage)
    sections: [
        { start: 0, end: 0.22, id: 'section0' },
        { start: 0.22, end: 0.45, id: 'section1' },
        { start: 0.45, end: 0.72, id: 'section2' },
        { start: 0.72, end: 1, id: 'section3' }
    ],
    
    // Dark zone thresholds
    dark: {
        start: 0.38,
        peak: 0.55,
        end: 0.72
    },
    
    // Fairy spawn zones
    fairyZone: { start: 0.15, end: 0.38 },
    wraithZone: { start: 0.42, end: 0.68 },
    
    // Foliage counts
    foliage: {
        mobile: { bgLeaves: 10, midLeaves: 15, fgLeaves: 8, flowers: 4, trunks: 8, webs: 4, bones: 2 },
        desktop: { bgLeaves: 30, midLeaves: 40, fgLeaves: 25, flowers: 10, trunks: 20, webs: 12, bones: 5 }
    },
    
    // Animation settings
    spreadMultiplier: { mobile: 60, desktop: 120 },
    zoomMultiplier: { mobile: 0.6, desktop: 1.2 },
    darkSpread: { mobile: 15, desktop: 30 },
    scaleMultiplier: { mobile: 0.1, desktop: 0.2 }
};

const SKY_STOPS = [
    { pos: 0, color: '#f8f4ef' },
    { pos: 0.2, color: '#e8f0e8' },
    { pos: 0.35, color: '#d0e0d0' },
    { pos: 0.45, color: '#4a5060' },
    { pos: 0.55, color: '#1a1a28' },
    { pos: 0.65, color: '#1a1a28' },
    { pos: 0.75, color: '#5a6070' },
    { pos: 0.85, color: '#e0e8e0' },
    { pos: 1, color: '#f8f4ef' }
];

// ============================================
// INITIALIZATION
// ============================================

// Force scroll to top on page load/reload
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Detect mobile for simplified experience
const isMobile = window.innerWidth <= 600;

// DOM elements
const viewport = document.getElementById('viewport');
const sky = document.getElementById('sky');
const progress = document.getElementById('progress');
const scrollHint = document.getElementById('scrollHint');
const entryScreen = document.getElementById('entryScreen');
const navBar = document.getElementById('navBar');

// Set current year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Nav link click handlers
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const sectionIndex = parseInt(e.target.dataset.section);
        const section = CONFIG.sections[sectionIndex];
        const targetPercent = (section.start + section.end) / 2;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: targetPercent * maxScroll, behavior: 'smooth' });
    });
});

// ============================================
// FOLIAGE SYSTEM
// ============================================

const foliageElements = [];
const counts = isMobile ? CONFIG.foliage.mobile : CONFIG.foliage.desktop;

function createFoliageItem(src, opts) {
    const el = document.createElement('div');
    el.className = 'foliage-item';
    
    const size = opts.sizeRange[0] + Math.random() * (opts.sizeRange[1] - opts.sizeRange[0]);
    let x, y, rotation = Math.random() * 360;
    
    if (opts.coverage === 'full') {
        x = -10 + Math.random() * 120;
        y = -10 + Math.random() * 120;
    } else if (opts.coverage === 'edges') {
        const edge = Math.random();
        if (edge < 0.3) { x = -5 + Math.random() * 30; y = Math.random() * 100; }
        else if (edge < 0.6) { x = 70 + Math.random() * 35; y = Math.random() * 100; }
        else if (edge < 0.8) { x = Math.random() * 100; y = -5 + Math.random() * 30; }
        else { x = Math.random() * 100; y = 70 + Math.random() * 35; }
    } else if (opts.coverage === 'vertical') {
        x = -10 + Math.random() * 120;
        y = 20 + Math.random() * 80;
        rotation = -10 + Math.random() * 20;
    } else if (opts.coverage === 'corners') {
        const corner = Math.floor(Math.random() * 4);
        if (corner === 0) { x = -5 + Math.random() * 25; y = -5 + Math.random() * 25; }
        else if (corner === 1) { x = 75 + Math.random() * 30; y = -5 + Math.random() * 25; }
        else if (corner === 2) { x = -5 + Math.random() * 25; y = 75 + Math.random() * 30; }
        else { x = 75 + Math.random() * 30; y = 75 + Math.random() * 30; }
        rotation = Math.random() * 360;
    } else {
        x = 5 + Math.random() * 90;
        y = 5 + Math.random() * 90;
    }
    
    el.style.cssText = `
        width: ${size}px;
        height: ${opts.coverage === 'vertical' ? size * 2.5 : size}px;
        left: ${x}%; top: ${y}%;
        z-index: ${Math.floor(opts.z * 10)};
        opacity: ${opts.opacity};
        filter: blur(${opts.blur || 0}px);
        transform: rotate(${rotation}deg);
    `;
    
    const img = document.createElement('img');
    img.src = src;
    el.appendChild(img);
    
    foliageElements.push({
        el, baseX: x, baseY: y, z: opts.z, rotation, size,
        baseOpacity: opts.opacity, isFlower: src.includes('flower'), isDark: opts.isDark || false
    });
    
    viewport.insertBefore(el, viewport.firstChild);
}

// Create foliage layers
for (let i = 0; i < counts.bgLeaves; i++) createFoliageItem('assets/img/leaves.svg', { sizeRange: [80, 150], z: 0.5 + Math.random() * 0.5, opacity: 0.4 + Math.random() * 0.2, blur: isMobile ? 0 : 1 + Math.random() * 2, coverage: 'full', isDark: false });
for (let i = 0; i < counts.midLeaves; i++) createFoliageItem('assets/img/leaves.svg', { sizeRange: [120, 220], z: 1 + Math.random() * 1, opacity: 0.6 + Math.random() * 0.2, blur: 0, coverage: 'full', isDark: false });
for (let i = 0; i < counts.fgLeaves; i++) createFoliageItem('assets/img/leaves.svg', { sizeRange: [180, 320], z: 2 + Math.random() * 1.5, opacity: 0.8 + Math.random() * 0.2, blur: 0, coverage: 'edges', isDark: false });
for (let i = 0; i < counts.flowers; i++) createFoliageItem('assets/img/flower-pink.svg', { sizeRange: [35, 60], z: 2.5 + Math.random() * 1, opacity: 0.9, blur: 0, coverage: 'scattered', isDark: false });
for (let i = 0; i < Math.floor(counts.flowers * 0.8); i++) createFoliageItem('assets/img/flower-yellow.svg', { sizeRange: [30, 50], z: 2.5 + Math.random() * 1, opacity: 0.9, blur: 0, coverage: 'scattered', isDark: false });
for (let i = 0; i < Math.floor(counts.flowers * 0.8); i++) createFoliageItem('assets/img/flower-blue.svg', { sizeRange: [32, 55], z: 2.5 + Math.random() * 1, opacity: 0.9, blur: 0, coverage: 'scattered', isDark: false });
for (let i = 0; i < counts.trunks; i++) createFoliageItem('assets/img/dark-trunk.svg', { sizeRange: [200, 450], z: 0.5 + Math.random() * 2.5, opacity: 0, blur: 0, coverage: 'vertical', isDark: true });
for (let i = 0; i < counts.webs; i++) createFoliageItem('assets/img/spider-web.svg', { sizeRange: [100, 200], z: 1 + Math.random() * 2, opacity: 0, blur: 0, coverage: 'corners', isDark: true });
for (let i = 0; i < counts.bones; i++) createFoliageItem('assets/img/bone.svg', { sizeRange: [60, 120], z: 1.5 + Math.random() * 1.5, opacity: 0, blur: 0, coverage: 'scattered', isDark: true });

// ============================================
// SKY COLOR SYSTEM
// ============================================

function hexToRgb(hex) {
    return { r: parseInt(hex.slice(1,3), 16), g: parseInt(hex.slice(3,5), 16), b: parseInt(hex.slice(5,7), 16) };
}

function interpolateColor(stops, pos) {
    let lower = stops[0], upper = stops[stops.length-1];
    for (let i = 0; i < stops.length - 1; i++) {
        if (pos >= stops[i].pos && pos <= stops[i+1].pos) { lower = stops[i]; upper = stops[i+1]; break; }
    }
    const t = upper.pos === lower.pos ? 0 : (pos - lower.pos) / (upper.pos - lower.pos);
    const c1 = hexToRgb(lower.color), c2 = hexToRgb(upper.color);
    return `rgb(${Math.round(c1.r + (c2.r - c1.r) * t)},${Math.round(c1.g + (c2.g - c1.g) * t)},${Math.round(c1.b + (c2.b - c1.b) * t)})`;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getScrollPercent() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(1, Math.max(0, window.scrollY / maxScroll));
}

function isInZone(scrollPercent, zone) {
    return scrollPercent >= zone.start && scrollPercent <= zone.end;
}

// ============================================
// MAIN UPDATE LOOP
// ============================================

function update() {
    const scrollPercent = getScrollPercent();
    const { dark } = CONFIG;
    const spreadMult = isMobile ? CONFIG.spreadMultiplier.mobile : CONFIG.spreadMultiplier.desktop;

    progress.style.width = (scrollPercent * 100) + '%';
    entryScreen.classList.toggle('hidden', scrollPercent > 0.01);
    navBar.classList.toggle('dark', scrollPercent > 0.4 && scrollPercent < 0.7);
    scrollHint.classList.toggle('visible', scrollPercent > 0.15 && scrollPercent < 0.85);
    sky.style.background = interpolateColor(SKY_STOPS, scrollPercent);

    const spread = scrollPercent * spreadMult;
    const inDarkZone = scrollPercent > dark.start && scrollPercent < dark.end;
    
    let darkIntensity = 0;
    if (scrollPercent >= dark.start && scrollPercent <= dark.peak) {
        darkIntensity = (scrollPercent - dark.start) / (dark.peak - dark.start);
    } else if (scrollPercent > dark.peak && scrollPercent <= dark.end) {
        darkIntensity = 1 - (scrollPercent - dark.peak) / (dark.end - dark.peak);
    }

    const zoomMult = isMobile ? CONFIG.zoomMultiplier.mobile : CONFIG.zoomMultiplier.desktop;
    const darkSpread = isMobile ? CONFIG.darkSpread.mobile : CONFIG.darkSpread.desktop;
    const scaleMult = isMobile ? CONFIG.scaleMultiplier.mobile : CONFIG.scaleMultiplier.desktop;

    foliageElements.forEach(item => {
        const xFromCenter = item.baseX - 50, yFromCenter = item.baseY - 50;
        const distFromCenter = Math.sqrt(xFromCenter * xFromCenter + yFromCenter * yFromCenter);
        const spreadMultiplier = 0.5 + distFromCenter / 70;
        let moveX, moveY, scale;
        
        if (item.isDark) {
            scale = 0.3 + darkIntensity * item.z * zoomMult;
            moveX = xFromCenter * darkIntensity * darkSpread * item.z / 50;
            moveY = yFromCenter * darkIntensity * darkSpread * item.z / 50;
            item.el.style.opacity = darkIntensity * 0.85;
        } else {
            moveX = xFromCenter * spread * item.z * spreadMultiplier / 50;
            moveY = yFromCenter * spread * item.z * spreadMultiplier / 50;
            scale = 1 + scrollPercent * item.z * scaleMult;
            item.el.style.opacity = inDarkZone ? (item.isFlower ? 0.05 : (1 - darkIntensity) * 0.4) : (item.baseOpacity || '');
        }
        
        item.el.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale}) rotate(${item.rotation}deg)`;
    });

    CONFIG.sections.forEach((sec, index) => {
        const el = document.getElementById(sec.id);
        const center = (sec.start + sec.end) / 2;
        const range = (sec.end - sec.start) / 2 * 0.85;
        let isActive = Math.abs(scrollPercent - center) < range;
        if (index === CONFIG.sections.length - 1 && scrollPercent > 0.85) isActive = true;
        el.classList.toggle('active', isActive);
    });
}

// ============================================
// FAIRY SPAWNING SYSTEM
// ============================================

const fairyImages = ['assets/img/fairy-pink.png', 'assets/img/fairy-yellow.png'];
let fairyActive = false, fairyTimeout = null;

function spawnFairy() {
    const scrollPercent = getScrollPercent();
    if (fairyActive || !isInZone(scrollPercent, CONFIG.fairyZone)) {
        if (isInZone(scrollPercent, CONFIG.fairyZone)) scheduleNextFairy();
        return;
    }
    fairyActive = true;
    
    const fairy = document.createElement('img');
    fairy.src = fairyImages[Math.floor(Math.random() * fairyImages.length)];
    const goingLeft = Math.random() > 0.5;
    const startY = 5 + Math.random() * 90;
    const size = 30 + Math.random() * 20;
    const duration = 7 + Math.random() * 4;
    
    fairy.style.width = size + 'px';
    fairy.style.setProperty('--duration', duration + 's');
    fairy.style.top = startY + 'vh';
    fairy.style.zIndex = Math.floor(1 + Math.random() * 25);
    fairy.className = goingLeft ? 'fairy right-to-left' : 'fairy left-to-right';
    
    viewport.appendChild(fairy);
    setTimeout(() => { fairy.remove(); fairyActive = false; scheduleNextFairy(); }, (duration + 0.5) * 1000);
}

function scheduleNextFairy() {
    if (fairyTimeout) clearTimeout(fairyTimeout);
    if (!isInZone(getScrollPercent(), CONFIG.fairyZone)) return;
    fairyTimeout = setTimeout(spawnFairy, 2000 + Math.random() * 6000);
}

function stopFairies() {
    if (fairyTimeout) { clearTimeout(fairyTimeout); fairyTimeout = null; }
    document.querySelectorAll('.fairy').forEach(f => {
        f.style.transition = 'opacity 0.4s ease-out';
        f.style.opacity = '0';
        setTimeout(() => f.remove(), 400);
    });
    fairyActive = false;
}

// ============================================
// DARK FAIRY (WRAITH) SPAWNING SYSTEM
// ============================================

const darkFairyImages = ['assets/img/dark-fairy.png', 'assets/img/dark-fairy-2.png'];
let wraithActive = false, wraithTimeout = null;

function spawnWraith() {
    const scrollPercent = getScrollPercent();
    if (wraithActive || !isInZone(scrollPercent, CONFIG.wraithZone)) {
        if (isInZone(scrollPercent, CONFIG.wraithZone)) scheduleNextWraith();
        return;
    }
    wraithActive = true;
    
    const wraith = document.createElement('img');
    wraith.src = darkFairyImages[Math.floor(Math.random() * darkFairyImages.length)];
    const goingLeft = Math.random() > 0.5;
    const angle = (Math.random() - 0.5) * 60;
    const verticalOffset = Math.tan(angle * Math.PI / 180) * 100;
    const startY = 20 + Math.random() * 50;
    const endY = Math.max(5, Math.min(85, startY + verticalOffset));
    const size = 30 + Math.random() * 20;
    const duration = 7.5 + Math.random() * 4.5;
    
    wraith.style.width = size + 'px';
    wraith.style.setProperty('--duration', duration + 's');
    wraith.style.setProperty('--start-y', startY + 'vh');
    wraith.style.setProperty('--end-y', endY + 'vh');
    wraith.style.setProperty('--scale', 0.8 + Math.random() * 0.5);
    wraith.style.zIndex = Math.floor(5 + Math.random() * 25);
    wraith.className = `wraith ${goingLeft ? 'right-to-left' : 'left-to-right'}`;
    
    viewport.appendChild(wraith);
    setTimeout(() => { wraith.remove(); wraithActive = false; scheduleNextWraith(); }, (duration + 0.5) * 1000);
}

function scheduleNextWraith() {
    if (wraithTimeout) clearTimeout(wraithTimeout);
    if (!isInZone(getScrollPercent(), CONFIG.wraithZone)) return;
    wraithTimeout = setTimeout(spawnWraith, 3000 + Math.random() * 7000);
}

function stopWraiths() {
    if (wraithTimeout) { clearTimeout(wraithTimeout); wraithTimeout = null; }
    document.querySelectorAll('.wraith').forEach(w => w.remove());
    wraithActive = false;
}

// ============================================
// EXCERPT MODAL
// ============================================

function openExcerpt(excerptName) {
    const modal = document.getElementById('excerptModal');
    const content = document.getElementById('excerptContent');
    
    fetch(`/assets/content/excerpt-${excerptName}.html`)
        .then(r => {
            if (!r.ok) throw new Error('Excerpt not found');
            return r.text();
        })
        .then(html => {
            content.innerHTML = html;
            content.scrollTop = 0;
            content.style.background = excerptName.includes('bone-eaters') ? '#0d0d14' : '#fefdfb';
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        })
        .catch(err => {
            console.error('Failed to load excerpt:', err);
            content.innerHTML = '<div class="excerpt-body"><p>Sorry, this excerpt could not be loaded.</p></div>';
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
}

function closeExcerpt() {
    document.getElementById('excerptModal').classList.remove('open');
    document.body.style.overflow = '';
}

// Expose to window for onclick handlers
window.openExcerpt = openExcerpt;
window.closeExcerpt = closeExcerpt;

// ============================================
// CONSOLIDATED SCROLL HANDLER
// ============================================

let ticking = false;
let wasInFairyZone = false;
let wasInWraithZone = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            update();
            
            // Fairy zone management
            const scrollPercent = getScrollPercent();
            const inFairyZone = isInZone(scrollPercent, CONFIG.fairyZone);
            const inWraithZone = isInZone(scrollPercent, CONFIG.wraithZone);
            
            if (inFairyZone && !wasInFairyZone) {
                fairyTimeout = setTimeout(spawnFairy, 1000);
            } else if (!inFairyZone && wasInFairyZone) {
                stopFairies();
            }
            
            if (inWraithZone && !wasInWraithZone) {
                wraithTimeout = setTimeout(spawnWraith, 1500);
            } else if (!inWraithZone && wasInWraithZone) {
                stopWraiths();
            }
            
            wasInFairyZone = inFairyZone;
            wasInWraithZone = inWraithZone;
            
            ticking = false;
        });
        ticking = true;
    }
});

// Escape key closes excerpt
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeExcerpt(); });

// Initialize
update();
