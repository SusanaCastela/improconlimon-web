const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
menu.addEventListener('click', e => {
  if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
});

document.getElementById('year').textContent = new Date().getFullYear();

const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.card, .cast article, .stats li, .section h2, form').forEach(el => {
  el.classList.add('reveal');
  io.observe(el);
});

// Solo fechas que figuren en Atrápalo; las pasadas se ocultan solas.
const SHOWS = [
  { date: '2026-11-26T20:00', title: 'Impro con limón', venue: 'Café Teatre Tinta Roja', address: 'C/ Creu dels Molers, 17 · Poble Sec, Barcelona', price: '10 € con reserva · 15 € en taquilla', url: 'https://www.tinta-roja.cat/es/espectaculos/impro-con-limon-261' },
  { date: '2027-01-28T20:00', title: 'Impro con limón', venue: 'Café Teatre Tinta Roja', address: 'C/ Creu dels Molers, 17 · Poble Sec, Barcelona', price: '10 € con reserva · 15 € en taquilla', url: 'https://www.tinta-roja.cat/es/espectaculos/impro-con-limon-261' },
  { date: '2027-02-25T20:00', title: 'Impro con limón', venue: 'Café Teatre Tinta Roja', address: 'C/ Creu dels Molers, 17 · Poble Sec, Barcelona', price: '10 € con reserva · 15 € en taquilla', url: 'https://www.tinta-roja.cat/es/espectaculos/impro-con-limon-261' },
  { date: '2027-03-18T20:00', title: 'Impro con limón', venue: 'Café Teatre Tinta Roja', address: 'C/ Creu dels Molers, 17 · Poble Sec, Barcelona', price: '10 € con reserva · 15 € en taquilla', url: 'https://www.tinta-roja.cat/es/espectaculos/impro-con-limon-261' },
  { date: '2027-04-22T20:00', title: 'Impro con limón', venue: 'Café Teatre Tinta Roja', address: 'C/ Creu dels Molers, 17 · Poble Sec, Barcelona', price: '10 € con reserva · 15 € en taquilla', url: 'https://www.tinta-roja.cat/es/espectaculos/impro-con-limon-261' },
  { date: '2027-05-20T20:00', title: 'Impro con limón', venue: 'Café Teatre Tinta Roja', address: 'C/ Creu dels Molers, 17 · Poble Sec, Barcelona', price: '10 € con reserva · 15 € en taquilla', url: 'https://www.tinta-roja.cat/es/espectaculos/impro-con-limon-261' },
];
const datesEl = document.getElementById('dates');
const upcoming = SHOWS.filter(s => new Date(s.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
const fmt = (o, d) => new Intl.DateTimeFormat('es-ES', o).format(d);
upcoming.forEach(s => {
  const d = new Date(s.date);
  const a = document.createElement('article');
  a.className = 'date-card';
  a.innerHTML = `
    <div class="date-box"><b>${fmt({ day: 'numeric' }, d)}</b><span>${fmt({ month: 'short' }, d).replace('.', '')}</span><small>${fmt({ weekday: 'long' }, d)}</small></div>
    <div class="date-info"><h3></h3><p class="when"></p><p class="where"></p><p class="price"></p></div>
    <a class="btn" target="_blank" rel="noopener">Comprar entradas</a>`;
  a.querySelector('h3').textContent = s.title;
  a.querySelector('.when').textContent = fmt({ hour: '2-digit', minute: '2-digit' }, d) + ' h';
  a.querySelector('.where').textContent = s.venue + ' · ' + s.address;
  a.querySelector('.price').textContent = s.price;
  a.querySelector('a').href = s.url;
  datesEl.appendChild(a);
});
if (!upcoming.length) document.getElementById('dates-empty').hidden = false;


// Scroll por secciones: la rueda salta al inicio de la siguiente sección.
// En secciones más altas que la pantalla se hace scroll normal hasta el final.
(() => {
  const panels = [...document.querySelectorAll('.hero, .section, footer')];
  if (!panels.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // offsetTop ignora transforms (la animación de aparición desplaza las secciones unos px)
  const top = el => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
  const bottom = el => top(el) + el.offsetHeight;
  let locked = false, lastWheel = 0, unlockAt = 0;
  const go = y => {
    locked = true;
    unlockAt = performance.now() + 800;
    scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };
  addEventListener('wheel', e => {
    // Firefox envía la rueda del ratón en "líneas" (deltaMode 1), no en píxeles
    const dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    if (e.ctrlKey || Math.abs(dy) < 4 || innerWidth < 820 || innerWidth < innerHeight) return;
    const now = performance.now();
    // Bloqueado hasta que termine la animación y cese la inercia de la rueda/trackpad
    if (locked) {
      if (now > unlockAt && now - lastWheel > 120) locked = false;
      else { lastWheel = now; e.preventDefault(); return; }
    }
    lastWheel = now;
    const vh = innerHeight;
    let i = 0;
    panels.forEach((p, n) => { if (top(p) <= scrollY + 2) i = n; });
    const cur = panels[i];
    const tall = bottom(cur) - top(cur) > vh + 60;
    if (dy > 0) {
      const rem = bottom(cur) - (scrollY + vh);
      if (rem > 60) {
        // sección alta: scroll normal, pero sin pasarse del final
        if (tall && rem < dy) { e.preventDefault(); scrollTo({ top: bottom(cur) - vh, behavior: 'smooth' }); }
        return;
      }
      if (i === panels.length - 1) return;
      e.preventDefault();
      go(top(panels[i + 1]));
    } else {
      const above = scrollY - top(cur);
      if (tall && above > 60) {
        if (above < -dy) { e.preventDefault(); scrollTo({ top: top(cur), behavior: 'smooth' }); }
        return;
      }
      if (above > 4) { e.preventDefault(); return go(top(cur)); }
      if (i === 0) return;
      e.preventDefault();
      const prev = panels[i - 1];
      const prevTall = bottom(prev) - top(prev) > vh + 60;
      go(prevTall ? bottom(prev) - vh : top(prev));
    }
  }, { passive: false });
})();

// Actores: miniaturas a la izquierda, actor destacado a la derecha.
// Opcional: data-photos="url1,url2" en un <article> añade una tira de fotos extra.
(() => {
  const cast = document.querySelector('.cast');
  const arts = [...cast.children];
  for (let i = arts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arts[i], arts[j]] = [arts[j], arts[i]];
  }
  const wrap = document.createElement('div');
  wrap.className = 'cast-wrap';
  cast.before(wrap);
  const feat = document.createElement('div');
  feat.className = 'feature';
  feat.setAttribute('aria-live', 'polite');
  wrap.append(cast, feat);
  const bg = document.createElement('div');
  bg.className = 'cast-bg';
  document.getElementById('actores').prepend(bg);
  const polas = document.createElement('div');
  polas.className = 'polas';
  wrap.append(polas);
  const show = a => {
    arts.forEach(x => x.classList.toggle('sel', x === a));
    const src = a.querySelector('img');
    const extra = ((src && src.dataset.photos) || a.dataset.photos || '').split(',').filter(Boolean);
    // Mientras no haya 3 fotos reales, se rellenan con recortes de la primera
    const fill = [{ z: 1, p: '50% 20%' }, { z: 1.9, p: '50% 12%' }, { z: 1.6, p: '50% 60%' }];
    const real = { z: 1, p: '50% 20%' };
    const photos = src
      ? [src.src, ...extra].slice(0, 3).map((u, n) => (extra.length ? { u, ...real } : { u, ...fill[n] }))
      : [];
    if (src && !extra.length) while (photos.length < 3) photos.push({ u: src.src, ...fill[photos.length] });
    const im = p => '<img src="' + p.u + '" alt="' + (src ? src.alt : '') + '" style="transform:scale(' + p.z + ');object-position:' + p.p + '">';
    const nm = a.querySelector('h4').textContent;
    const nick = a.querySelector('.nick').textContent;
    const stage = '<div class="head"><h3>' + nm + '</h3><p class="nick">' + nick + '</p></div>';
    document.getElementById('actores').style.setProperty('--cast-bg', (src && src.dataset.bg) || '#fff');
    bg.dataset.who = src ? (src.getAttribute('src').split('/')[1] || '') : '';
    bg.innerHTML = src ? im(photos[0]) : '<div class="noimg">' + a.querySelector('.noimg').textContent + '</div>';
    polas.innerHTML = src
      ? photos.slice(1).map((p, n) => '<button type="button" class="pola p' + (n + 1) + '" aria-label="Ver foto ' + (n + 2) + '"><span class="ph">' + im(p) + '</span></button>').join('')
      : '';
    feat.innerHTML = stage + '<div class="bio">' + a.querySelector('ul').outerHTML + '</div>';
    if (src) {
      polas.querySelectorAll('.pola').forEach(btn => btn.onclick = () => {
        const mi = bg.querySelector('img'), si = btn.querySelector('img');
        [mi.src, si.src] = [si.src, mi.src];
        [mi.style.cssText, si.style.cssText] = [si.style.cssText, mi.style.cssText];
      });
    }
    feat.classList.remove('swap'); void feat.offsetWidth; feat.classList.add('swap');
    if (cast.scrollWidth > cast.clientWidth) cast.scrollTo({ left: a.offsetLeft - (cast.clientWidth - a.offsetWidth) / 2, behavior: first ? 'auto' : 'smooth' });
    first = false;
  };
  let first = true;
  arts.forEach(a => {
    cast.appendChild(a);
    const t = document.createElement('div');
    t.className = 'txt';
    t.append(a.querySelector('h4'), a.querySelector('.nick'));
    a.insertBefore(t, a.querySelector('ul'));
    a.tabIndex = 0;
    a.setAttribute('role', 'button');
    a.addEventListener('click', () => show(a));
    a.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(a); } });
  });
  cast.classList.add('js');
  show(arts[0]);
  const ml = document.createElement('div');
  ml.className = 'm-list';
  ml.innerHTML = arts.map(a => {
    const im = a.querySelector('img');
    const pic = im ? '<img class="m-pic" loading="lazy" src="' + im.src + '" alt="' + im.alt + '">' : '<div class="m-pic noimg">' + a.querySelector('.noimg').textContent + '</div>';
    return '<article class="m-item"><h3>' + a.querySelector('h4').textContent + '</h3><p class="nick">' + a.querySelector('.nick').textContent + '</p>' + pic + '<div class="m-text">' + a.querySelector('ul').outerHTML + '</div></article>';
  }).join('');
  document.getElementById('actores').append(ml);
})();

// Espectáculos: lista a la izquierda, espectáculo destacado a la derecha (el primero por defecto)
(() => {
  const sec = document.getElementById('espectaculos');
  const cards = [...sec.querySelectorAll('.card')];
  if (!cards.length) return;
  const data = cards.map(c => ({
    img: c.querySelector('img').src,
    alt: c.querySelector('img').alt,
    tag: c.querySelector('.tag').textContent,
    title: c.querySelector('h3').textContent,
    text: [...c.querySelectorAll('.card-body p')].map(p => p.outerHTML).join(''),
    link: c.querySelector('.link').outerHTML
  }));
  const bg = document.createElement('div');
  bg.className = 'show-bg';
  const wrap = document.createElement('div');
  wrap.className = 'show-wrap';
  const list = document.createElement('div');
  list.className = 'show-list';
  const feat = document.createElement('div');
  feat.className = 'show-feature';
  feat.setAttribute('aria-live', 'polite');
  wrap.append(list, feat);
  sec.querySelector('.cards').hidden = true;
  sec.prepend(bg);
  sec.append(wrap);
  const buttons = data.map((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<img src="' + d.img + '" alt=""><span>' + d.title + '</span>';
    b.onclick = () => show(i);
    list.appendChild(b);
    return b;
  });
  const show = i => {
    const d = data[i];
    buttons.forEach((b, n) => b.classList.toggle('sel', n === i));
    sec.style.setProperty('--show-bg', /lemons/.test(d.img) ? '#601219' : '#111');
    bg.innerHTML = '<img src="' + d.img + '" alt="' + d.alt + '">';
    feat.innerHTML = '<img class="show-pic" src="' + d.img + '" alt="' + d.alt + '"><span class="show-tag">' + d.tag + '</span><h3>' + d.title + '</h3><div class="show-text">' + d.text + d.link + '</div>';
    feat.classList.remove('swap'); void feat.offsetWidth; feat.classList.add('swap');
  };
  show(0);
  const ml = document.createElement('div');
  ml.className = 'm-list';
  ml.innerHTML = data.map(d => '<article class="m-item"><h3>' + d.title + '</h3><span class="show-tag">' + d.tag + '</span><img class="m-pic" loading="lazy" src="' + d.img + '" alt="' + d.alt + '"><div class="m-text show-text">' + d.text + d.link + '</div></article>').join('');
  sec.append(ml);
})();

/* Teléfonos: en ordenador copian el número */
document.querySelectorAll('a.cbtn[href^="tel:"]').forEach(a=>{
  a.addEventListener('click',e=>{
    if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches||!navigator.clipboard)return;
    e.preventDefault();
    const n=a.getAttribute('href').slice(4);
    const txt=a.lastChild;const orig=txt.textContent;
    navigator.clipboard.writeText(n).then(()=>{
      txt.textContent='¡Copiado!';
      setTimeout(()=>{txt.textContent=orig},1500);
    });
  });
});

/* Formulario: envío por Formspree (sin recargar). Si no está configurado, abre el correo. */
(() => {
  const form = document.getElementById('form'), msg = document.getElementById('form-msg');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = new FormData(form);
    if (form.action.includes('REEMPLAZAR')) {
      location.href = 'mailto:improconlimon@gmail.com?subject=' + encodeURIComponent('Contratación: ' + d.get('nombre')) +
        '&body=' + encodeURIComponent(d.get('mensaje') + '\n\n' + d.get('nombre') + ' · ' + d.get('email') + ' · ' + (d.get('telefono') || ''));
      return;
    }
    const btn = form.querySelector('button'); btn.disabled = true; msg.textContent = 'Enviando…';
    try {
      const r = await fetch(form.action, { method: 'POST', body: d, headers: { Accept: 'application/json' } });
      if (!r.ok) throw 0;
      form.reset(); msg.textContent = '¡Mensaje enviado! Te responderemos muy pronto.';
    } catch { msg.textContent = 'No se ha podido enviar. Escríbenos a improconlimon@gmail.com'; }
    btn.disabled = false;
  });
})();
