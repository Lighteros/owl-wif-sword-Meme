(function(){
  var C = window.SITE_CONFIG || {};
  var X_URL = C.X_URL || '#';
  var CA = (C.CA || 'Coming soon').trim();
  var SYMBOL = C.SYMBOL || '$SWORDOWL';
  var LIVE = CA && !/coming soon/i.test(CA) && CA.length > 20;

  var DEX_URL = LIVE ? 'https://dexscreener.com/solana/' + CA : 'https://dexscreener.com/solana';
  var EMBED_URL = 'https://dexscreener.com/solana/' + CA + '?embed=1&theme=dark&trades=0&info=0';
  var BUY_URL = LIVE ? 'https://swap.pump.fun/?input=So11111111111111111111111111111111111111112&output=' + CA : 'https://swap.pump.fun/';

  function all(s){return Array.prototype.slice.call(document.querySelectorAll(s));}
  all('.js-x').forEach(function(a){a.href = X_URL;});
  all('.js-dex').forEach(function(a){a.href = DEX_URL;});
  all('.js-buy').forEach(function(a){a.href = BUY_URL;});
  all('.js-ca').forEach(function(el){el.textContent = CA;});

  // chart
  if (LIVE) {
    var frame = document.getElementById('chartFrame');
    frame.innerHTML = '<iframe src="' + EMBED_URL + '" title="' + SYMBOL + ' chart on DexScreener" loading="lazy" allow="clipboard-write"></iframe>';
  }

  // copy
  var toast = document.getElementById('toast');
  function showToast(t){toast.textContent = t; toast.classList.add('show'); clearTimeout(showToast._t); showToast._t = setTimeout(function(){toast.classList.remove('show');}, 1800);}
  function copyText(t){
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    return new Promise(function(res){var ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta);res();});
  }
  all('.js-copy').forEach(function(b){
    b.addEventListener('click', function(){
      copyText(CA).then(function(){
        b.textContent = 'Copied'; setTimeout(function(){b.textContent='Copy';}, 1600);
        showToast(LIVE ? 'Contract address copied' : 'Copied: contract coming soon');
      });
    });
  });

  // marquee
  var mq = document.getElementById('marquee');
  var words = [SYMBOL, 'owl wif sword', 'Wisdom', SYMBOL, 'Courage', 'Forged on Solana', SYMBOL, 'Raise the Blade'];
  var html = words.map(function(w){return '<span>' + w + '<i></i></span>';}).join('');
  mq.innerHTML = html + html + html + html;

  // nav
  var nav = document.getElementById('nav'), burger = document.getElementById('burger'), links = document.getElementById('navLinks');
  burger.addEventListener('click', function(){var o = links.classList.toggle('open'); burger.classList.toggle('open', o); burger.setAttribute('aria-expanded', o);});
  all('#navLinks a').forEach(function(a){a.addEventListener('click', function(){links.classList.remove('open'); burger.classList.remove('open'); burger.setAttribute('aria-expanded', false);});});

  // reveal + slash
  var io = new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in'); io.unobserve(e.target);}});}, {threshold:0.15, rootMargin:'0px 0px -40px 0px'});
  all('.reveal, .slash').forEach(function(el, i){el.style.transitionDelay = ((i % 4) * 0.08) + 's'; io.observe(el);});

  // parallax + nav state
  var px = all('[data-depth]');
  var ticking = false;
  function onScroll(){
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 30);
    px.forEach(function(el){
      var d = parseFloat(el.getAttribute('data-depth'));
      if (el.classList.contains('castles')) el.style.transform = 'translateY(' + (y * d) + 'px)';
      else el.style.translate = '0 ' + (y * d * -0.3) + 'px';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function(){if(!ticking){requestAnimationFrame(onScroll); ticking = true;}}, {passive:true});
  onScroll();

  var fine = window.matchMedia('(pointer:fine)').matches;
  // tilt
  if (fine) all('.tilt').forEach(function(el){
    el.addEventListener('mousemove', function(e){
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(900px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg) scale(1.02)';
    });
    el.addEventListener('mouseleave', function(){el.style.transform = '';});
  });

  // cursor glow + trail
  var glow = document.getElementById('cursor-glow');
  if (fine) {
    var last = 0;
    window.addEventListener('mousemove', function(e){
      glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px';
      var now = performance.now();
      if (now - last > 40) {
        last = now;
        var t = document.createElement('div'); t.className = 'trail';
        t.style.left = (e.clientX - 3) + 'px'; t.style.top = (e.clientY - 3) + 'px';
        document.body.appendChild(t); setTimeout(function(){t.remove();}, 800);
      }
    }, {passive:true});
  } else glow.style.display = 'none';

  // lore strip drag
  var strip = document.getElementById('loreStrip'), down = false, sx = 0, sl = 0;
  strip.addEventListener('mousedown', function(e){down = true; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('drag');});
  window.addEventListener('mouseup', function(){down = false; strip.classList.remove('drag');});
  strip.addEventListener('mousemove', function(e){if(!down) return; e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx) * 1.4;});

  // embers canvas
  var cv = document.getElementById('embers'), ctx = cv.getContext('2d'), W, H, P = [];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(){var dpr = Math.min(window.devicePixelRatio || 1, 1.5); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';}
  size(); window.addEventListener('resize', size);
  var N = innerWidth < 700 ? 45 : 110;
  function spawn(p, init){
    p.x = Math.random() * W; p.y = init ? Math.random() * H : H + 20;
    p.r = Math.random() * 2.2 + 0.6; p.vy = -(Math.random() * 0.7 + 0.25); p.vx = (Math.random() - 0.5) * 0.3;
    p.life = 0; p.max = 400 + Math.random() * 500; p.ph = Math.random() * 6.28; p.hue = 32 + Math.random() * 18;
    return p;
  }
  for (var i = 0; i < N; i++) P.push(spawn({}, true));
  var visible = true;
  document.addEventListener('visibilitychange', function(){visible = !document.hidden;});
  function frame(){
    if (visible) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.life++; p.ph += 0.03;
        p.x += p.vx + Math.sin(p.ph) * 0.35; p.y += p.vy;
        var a = Math.sin(Math.PI * Math.min(p.life / p.max, 1)) * 0.9;
        if (p.y < -20 || p.life > p.max) spawn(p, false);
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, 'hsla(' + p.hue + ',100%,75%,' + a + ')');
        g.addColorStop(1, 'hsla(' + p.hue + ',100%,50%,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 6.283); ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) frame();
})();
