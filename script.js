const Utils = (() => {
  const lerp = (a,b,t) => a + (b-a)*t;
  const clamp = (v,min,max) => Math.max(min, Math.min(max, v));
  const rand = (min,max) => Math.random()*(max-min)+min;
  return { lerp, clamp, rand };
})();

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 700);
});

const CursorFX = (() => {
  const el = document.getElementById('cursor');
  if(window.matchMedia('(hover:none)').matches) return;
  let mx = window.innerWidth/2, my = window.innerHeight/2, cx = mx, cy = my;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.querySelectorAll('.glass-btn, .coral-node, .audio-toggle, a').forEach(node => {
    node.addEventListener('mouseenter', () => el.classList.add('expand'));
    node.addEventListener('mouseleave', () => el.classList.remove('expand'));
  });
  (function tick(){
    cx = Utils.lerp(cx, mx, .18);
    cy = Utils.lerp(cy, my, .18);
    el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  })();
  return { get x(){return mx}, get y(){return my} };
})();

(() => {
  const btn = document.getElementById('audio-toggle');
  let on = false;
  btn.addEventListener('click', () => {
    on = !on;
    btn.textContent = on ? '🔊' : '🔈';
    btn.style.borderColor = on ? 'var(--glow-cyan)' : 'rgba(255,255,255,.25)';
    btn.style.color = on ? 'var(--glow-cyan)' : 'var(--ink-1)';
  });
})();

(() => {
  const targets = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if(en.isIntersecting){ en.target.classList.add('in-view'); }
    });
  }, { threshold: .35 });
  targets.forEach(t => io.observe(t));
})();

const ScrollDepth = (() => {
  const fill = document.getElementById('progress-fill');
  const readout = document.getElementById('depth-value');
  const maxMeters = 10935; // Mariana Trench depth
  let ticking = false;

  function update(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Utils.clamp(docHeight > 0 ? scrollTop / docHeight : 0, 0, 1);

    document.documentElement.style.setProperty('--depth', progress.toFixed(4));
    fill.style.height = (progress*100).toFixed(2) + '%';
    readout.textContent = Math.round(progress*progress*maxMeters).toLocaleString() + ' m';

    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }, { passive:true });
  update();
  return { update };
})();

(() => {
  const scenes = document.querySelectorAll('.scene-bg');
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - .5);
    my = (e.clientY / window.innerHeight - .5);
  });
  function tick(){
    scenes.forEach((s,i) => {
      const depth = (i % 3 + 1) * 6;
      s.style.transform = `translate(${mx*depth}px, ${my*depth}px)`;
    });
    requestAnimationFrame(tick);
  }
  tick();
})();

(() => {
  const path = document.querySelector('#wave-svg path');
  if(!path) return;
  let t = 0;
  function animateWave(){
    t += 0.015;
    const o1 = Math.sin(t)*10;
    const o2 = Math.cos(t*1.3)*10;
    path.setAttribute('d', `M0 ${30+o1} Q 100 ${o2} 200 ${30+o1} T 400 ${30+o1} T 600 ${30+o1} T 800 ${30+o1} T 1000 ${30+o1} T 1200 ${30+o1} T 1400 ${30+o1} T 1600 ${30+o1} V60 H0 Z`);
    requestAnimationFrame(animateWave);
  }
  animateWave();
})();

(() => {

  function el(tag, cls, styleObj){
    const n = document.createElement(tag);
    if(cls) n.className = cls;
    if(styleObj) Object.assign(n.style, styleObj);
    return n;
  }

  const fishSVG = (color) => `<svg width="34" height="18" viewBox="0 0 34 18">
      <path d="M0 9 Q10 0 26 5 L34 2 L28 9 L34 16 L26 13 Q10 18 0 9 Z" fill="${color}"/>
    </svg>`;

  const sunlightBg = document.getElementById('sunlight-bg');
  for(let i=0;i<6;i++){
    const ray = el('div','light-ray',{
      left: (10 + i*15) + '%',
      transform: `rotate(${Utils.rand(-8,8)}deg)`,
      animation: `pulseSoft ${Utils.rand(5,8)}s ease-in-out infinite`,
      opacity: .5
    });
    sunlightBg.appendChild(ray);
  }
  for(let i=0;i<10;i++){
    const grass = el('div','seagrass',{
      left: (Utils.rand(2,96)) + '%',
      height: Utils.rand(40,90)+'px',
      animation: `swayGrass ${Utils.rand(3,5)}s ease-in-out infinite`,
      animationDelay: Utils.rand(0,3)+'s'
    });
    sunlightBg.appendChild(grass);
  }
  const fishColors = ['#ffb15e','#5be8ff','#ff8e8e','#ffe38a','#8effc7'];
  for(let i=0;i<7;i++){
    const f = el('div','fish',{
      top: Utils.rand(20,75)+'%',
      left: '-80px',
      animation: `swimAcross ${Utils.rand(14,26)}s linear infinite`,
      animationDelay: Utils.rand(0,10)+'s',
      transform: Math.random()>.5 ? 'scaleX(-1)' : 'none'
    });
    f.innerHTML = fishSVG(fishColors[i % fishColors.length]);
    sunlightBg.appendChild(f);
  }
  for(let i=0;i<3;i++){
    const jelly = el('div','glow-blob',{
      position:'absolute', width:'26px', height:'34px', borderRadius:'50% 50% 45% 45%',
      left: Utils.rand(10,85)+'%', top: Utils.rand(15,55)+'%',
      background:'rgba(255,255,255,.5)', color:'#bff', 
      animation:`drift ${Utils.rand(6,10)}s ease-in-out infinite`
    });
    sunlightBg.appendChild(jelly);
  }

  const coralBg = document.getElementById('coral-bg');
  const coralFacts = [
    'Coral reefs cover less than 1% of the ocean floor but support 25% of marine species.',
    'A single reef can be thousands of years old, built by generations of tiny polyps.',
    'Clownfish are immune to the sting of the anemones they call home.',
    'Some corals glow under UV light using natural fluorescent proteins.'
  ];
  const coralColors = ['#0e8f8a','#1fae86','#0a6f78','#166f5a'];
  for(let i=0;i<7;i++){
    const c = el('div','coral',{
      left: (i*13 + Utils.rand(-3,3))+'%',
      width: Utils.rand(40,90)+'px',
      height: Utils.rand(70,150)+'px',
      background: coralColors[i % coralColors.length],
      opacity: .85
    });
    coralBg.appendChild(c);
  }
  for(let i=0;i<4;i++){
    const node = el('div','coral-node',{ left: (12+i*22)+'%', bottom: Utils.rand(20,55)+'%' });
    const chip = el('div','fact-chip');
    chip.textContent = coralFacts[i % coralFacts.length];
    node.appendChild(chip);
    coralBg.appendChild(node);
  }
  for(let i=0;i<5;i++){
    const f = el('div','fish',{
      top: Utils.rand(15,70)+'%', left:'-80px',
      animation:`swimAcross ${Utils.rand(16,28)}s linear infinite`,
      animationDelay: Utils.rand(0,12)+'s',
      transform: Math.random()>.5 ? 'scaleX(-1)' : 'none'
    });
    f.innerHTML = fishSVG(fishColors[(i+2) % fishColors.length]);
    coralBg.appendChild(f);
  }

  const predatorBg = document.getElementById('predator-bg');
  predatorBg.appendChild(el('div','whale-shadow',{
    width:'340px', height:'110px', borderRadius:'50%', background:'#000',
    top:'20%', left:'55%'
  }));
  for(let i=0;i<2;i++){
    const shark = el('div','shark',{
      top: Utils.rand(35,65)+'%', left:'-140px',
      animation:`swimAcross ${Utils.rand(20,30)}s linear infinite`,
      animationDelay: (i*8)+'s'
    });
    shark.innerHTML = `<svg width="120" height="48" viewBox="0 0 120 48">
        <path d="M0 30 C20 14 60 10 120 20 C90 24 70 30 60 40 C50 30 40 26 20 30 Z" fill="#0a1830"/>
        <path d="M55 10 L68 20 L50 22 Z" fill="#0a1830"/>
      </svg>`;
    predatorBg.appendChild(shark);
  }
  for(let i=0;i<10;i++){
    predatorBg.appendChild(el('div','debris',{
      width:'3px', height:'3px', top:Utils.rand(10,90)+'%', left:Utils.rand(5,95)+'%',
      animation:`drift ${Utils.rand(5,9)}s ease-in-out infinite`
    }));
  }

  const shipBg = document.getElementById('ship-bg');
  shipBg.appendChild(el('div','lantern-glow',{ width:'26px', height:'26px', left:'34%', top:'46%' }));
  shipBg.appendChild(el('div','chain',{
    width:'2px', height:'70px', background:'#3a4a5c', top:'10%', left:'40%'
  }));
  shipBg.appendChild(el('div','chain',{
    width:'2px', height:'50px', background:'#3a4a5c', top:'8%', left:'62%', animationDelay:'1s'
  }));
  for(let i=0;i<4;i++){
    const f = el('div','fish',{
      top: Utils.rand(35,55)+'%', left:'-80px',
      animation:`swimAcross ${Utils.rand(18,26)}s linear infinite`,
      animationDelay: Utils.rand(0,10)+'s'
    });
    f.innerHTML = fishSVG('#2ee6a8');
    shipBg.appendChild(f);
  }

  const abyssBg = document.getElementById('abyss-bg');
  const svgNS = 'http://www.w3.org/2000/svg';
  const tsvg = document.createElementNS(svgNS,'svg');
  tsvg.setAttribute('width','100%'); tsvg.setAttribute('height','100%');
  tsvg.style.position='absolute'; tsvg.style.inset='0';
  const tentaclePaths = [
    'M-20 200 Q100 100 60 400 Q40 550 160 620',
    'M-40 500 Q80 420 140 620 Q170 700 260 760'
  ];
  tentaclePaths.forEach(d => {
    const p = document.createElementNS(svgNS,'path');
    p.setAttribute('d', d); p.setAttribute('class','tentacle');
    tsvg.appendChild(p);
  });
  abyssBg.appendChild(tsvg);
  for(let i=0;i<8;i++){
    abyssBg.appendChild(el('div','glow-blob',{
      position:'absolute', width:'8px', height:'8px',
      left: Utils.rand(5,95)+'%', top: Utils.rand(10,90)+'%',
      background:'var(--glow-purple)', color:'#b581ff',
      animation:`pulseSoft ${Utils.rand(3,6)}s ease-in-out infinite`
    }));
  }
  abyssBg.appendChild(el('div','deep-shadow',{ width:'280px', height:'160px', top:'30%', left:'60%' }));

  const spotlight = document.getElementById('spotlight');
  function driftSpot(){
    const t = Date.now()/4000;
    spotlight.style.width = spotlight.style.height = '420px';
    spotlight.style.left = (50 + Math.sin(t)*14) + '%';
    spotlight.style.top = (45 + Math.cos(t*.8)*14) + '%';
    spotlight.style.transform = 'translate(-50%,-50%)';
    requestAnimationFrame(driftSpot);
  }
  driftSpot();

  const trenchBg = document.getElementById('trench-bg');
  trenchBg.appendChild(el('div','vent',{ width:'40px', height:'50%', left:'30%' }));
  trenchBg.appendChild(el('div','vent',{ width:'26px', height:'35%', left:'68%' }));
  const bioColors = ['#5ee6c9','#5be8ff','#b581ff'];
  for(let i=0;i<16;i++){
    const size = Utils.rand(3,7);
    trenchBg.appendChild(el('div','bio-dot',{
      width:size+'px', height:size+'px',
      left: Utils.rand(2,98)+'%', top: Utils.rand(5,95)+'%',
      background: bioColors[i%3], boxShadow:`0 0 10px 2px ${bioColors[i%3]}`,
      animationDelay: Utils.rand(0,4)+'s'
    }));
  }

  const unknownBg = document.getElementById('unknown-bg');
  for(let i=0;i<3;i++){
    unknownBg.appendChild(el('div','ghost-form',{
      width: Utils.rand(160,320)+'px', height: Utils.rand(200,380)+'px',
      left: Utils.rand(-10,70)+'%', top: Utils.rand(-10,50)+'%',
      background:'radial-gradient(circle, rgba(181,129,255,.5), rgba(181,129,255,0) 70%)',
      animation:`drift ${Utils.rand(10,16)}s ease-in-out infinite`
    }));
  }

  const finalBg = document.getElementById('final-bg');
  for(let i=0;i<24;i++){
    const size = Utils.rand(1,3);
    finalBg.appendChild(el('div','bio-dot',{
      width:size+'px', height:size+'px',
      left: Utils.rand(0,100)+'%', top: Utils.rand(0,100)+'%',
      background:'#5be8ff', boxShadow:'0 0 6px 1px #5be8ff',
      animationDuration: Utils.rand(3,6)+'s',
      position:'absolute'
    }));
  }

})();

const ParticleField = (() => {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = window.innerWidth < 720 ? 46 : 90;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function makeParticle(){
    return {
      x: Utils.rand(0,W),
      y: Utils.rand(0,H),
      r: Utils.rand(.6,3.2),
      speed: Utils.rand(.15,.6),
      drift: Utils.rand(-.25,.25),
      alpha: Utils.rand(.15,.6)
    };
  }
  for(let i=0;i<COUNT;i++) particles.push(makeParticle());

  const stops = [
    [95,232,255],   
    [70,190,220],
    [80,140,230],
    [110,100,220],
    [140,90,220],
    [90,60,160],
    [40,30,70]      
  ];
  function colorAtDepth(depth){
    const seg = depth * (stops.length-1);
    const i = Math.min(Math.floor(seg), stops.length-2);
    const t = seg - i;
    const a = stops[i], b = stops[i+1];
    return [
      Math.round(Utils.lerp(a[0],b[0],t)),
      Math.round(Utils.lerp(a[1],b[1],t)),
      Math.round(Utils.lerp(a[2],b[2],t))
    ];
  }

  function tick(){
    ctx.clearRect(0,0,W,H);
    const depth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--depth')) || 0;
    const [r,g,b] = colorAtDepth(depth);
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      if(p.y < -10){ p.y = H+10; p.x = Utils.rand(0,W); }
      if(p.x < -10) p.x = W+10;
      if(p.x > W+10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  tick();
})();

document.getElementById('explore-again').addEventListener('click', () => {
  window.scrollTo({ top:0, behavior:'smooth' });
});