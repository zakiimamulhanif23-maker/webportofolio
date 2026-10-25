(() => {
  const root = document.documentElement;
  if (!root.classList.contains('intro-pending')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) {
    root.classList.remove('intro-pending');
    return;
  }

  const timingElement = getComputedStyle(root);
  const readDuration = name => Number.parseFloat(timingElement.getPropertyValue(name)) || 0;
  const blackout = readDuration('--intro-blackout');
  const focus = readDuration('--intro-focus');
  const nameDuration = readDuration('--intro-name');
  const curtainDuration = readDuration('--intro-curtain');
  const heroDelay = readDuration('--intro-hero-delay');
  const totalDuration = blackout + focus + nameDuration + curtainDuration;
  const letterStagger = readDuration('--intro-letter-stagger');
  const intro = document.createElement('div');
  intro.className = 'cinematic-intro';

  const backdrop = document.createElement('div');
  backdrop.className = 'intro-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');

  const aurora = document.createElement('div');
  aurora.className = 'intro-aurora';
  aurora.setAttribute('aria-hidden', 'true');

  const stage = document.createElement('div');
  stage.className = 'intro-stage';
  stage.setAttribute('aria-hidden', 'true');

  const artFrame = document.createElement('div');
  artFrame.className = 'intro-art';
  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 506;
  artFrame.append(canvas);

  const name = document.createElement('div');
  name.className = 'intro-name';
  const heading = document.querySelector('.hero h1');
  const nameText = heading ? heading.innerText.replace(/\s+/g, ' ').trim() : '';
  const segmenter = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;
  const characters = segmenter
    ? Array.from(segmenter.segment(nameText), item => item.segment)
    : Array.from(nameText);

  let letterIndex = 0;
  characters.forEach(character => {
    if (character === ' ') {
      const space = document.createElement('span');
      space.className = 'intro-space';
      name.append(space);
      return;
    }

    const mask = document.createElement('span');
    mask.className = 'intro-letter-mask';
    const letter = document.createElement('span');
    letter.className = 'intro-letter';
    letter.textContent = character;
    letter.style.transitionDelay = `${letterIndex * letterStagger}ms`;
    letterIndex += 1;
    mask.append(letter);
    name.append(mask);
  });

  stage.append(artFrame, name);

  const counter = document.createElement('div');
  counter.className = 'intro-counter';
  counter.setAttribute('aria-hidden', 'true');
  const counterValue = document.createElement('span');
  counterValue.textContent = '000';
  const counterTrack = document.createElement('span');
  counterTrack.className = 'intro-counter-track';
  const counterProgress = document.createElement('span');
  counterProgress.className = 'intro-counter-progress';
  counterTrack.append(counterProgress);
  counter.append(counterValue, counterTrack);

  const skip = document.createElement('button');
  skip.className = 'intro-skip';
  skip.type = 'button';
  skip.textContent = 'Skip ›';
  skip.setAttribute('aria-label', 'Skip intro');

  const curtainLeft = document.createElement('div');
  curtainLeft.className = 'intro-curtain intro-curtain-left';
  curtainLeft.setAttribute('aria-hidden', 'true');
  const curtainRight = document.createElement('div');
  curtainRight.className = 'intro-curtain intro-curtain-right';
  curtainRight.setAttribute('aria-hidden', 'true');

  intro.append(backdrop, aurora, stage, counter, skip, curtainLeft, curtainRight);

  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = canvas.width;
  sourceCanvas.height = canvas.height;
  const sourceContext = sourceCanvas.getContext('2d');
  const displayContext = canvas.getContext('2d');
  const pixelCanvas = document.createElement('canvas');
  pixelCanvas.width = canvas.width;
  pixelCanvas.height = canvas.height;
  const pixelContext = pixelCanvas.getContext('2d');

  if (!sourceContext || !displayContext || !pixelContext || !heading) {
    console.warn('The cinematic intro could not initialize its canvas or hero heading.');
    root.classList.remove('intro-pending');
    return;
  }

  function themeColor(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function drawArtwork() {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const surface = themeColor('--surface');
    const surfaceTwo = themeColor('--surface-2');
    const border = themeColor('--border');
    const borderStrong = themeColor('--border-strong');
    const accent = themeColor('--accent');
    const accentSoft = themeColor('--accent-soft');
    const text = themeColor('--text');
    const success = themeColor('--success');

    sourceContext.clearRect(0, 0, width, height);
    sourceContext.fillStyle = surface;
    sourceContext.beginPath();
    sourceContext.roundRect(1, 1, width - 2, height - 2, 30);
    sourceContext.fill();
    sourceContext.strokeStyle = border;
    sourceContext.lineWidth = 2;
    sourceContext.stroke();

    sourceContext.fillStyle = accentSoft;
    sourceContext.beginPath();
    sourceContext.arc(width * .52, height * .46, width * .37, 0, Math.PI * 2);
    sourceContext.fill();

    sourceContext.strokeStyle = borderStrong;
    sourceContext.lineWidth = 2;
    sourceContext.beginPath();
    sourceContext.ellipse(width * .5, height * .49, width * .32, height * .26, -.36, 0, Math.PI * 2);
    sourceContext.stroke();
    sourceContext.setLineDash([5, 8]);
    sourceContext.beginPath();
    sourceContext.ellipse(width * .5, height * .49, width * .24, height * .19, .52, 0, Math.PI * 2);
    sourceContext.stroke();
    sourceContext.setLineDash([]);

    sourceContext.save();
    sourceContext.translate(width * .5, height * .46);
    sourceContext.rotate(-.52);
    sourceContext.fillStyle = accent;
    sourceContext.beginPath();
    sourceContext.moveTo(-70, -72);
    sourceContext.bezierCurveTo(20, -102, 96, -38, 74, 42);
    sourceContext.bezierCurveTo(54, 100, -54, 93, -80, 35);
    sourceContext.bezierCurveTo(-102, -10, -104, -48, -70, -72);
    sourceContext.fill();
    sourceContext.strokeStyle = border;
    sourceContext.lineWidth = 2;
    sourceContext.beginPath();
    sourceContext.ellipse(0, 0, 45, 29, .52, 0, Math.PI * 2);
    sourceContext.stroke();
    sourceContext.restore();

    sourceContext.fillStyle = text;
    sourceContext.font = '500 14px "DM Mono", monospace';
    sourceContext.textBaseline = 'top';
    sourceContext.fillText('DESIGN / DEVELOP', 34, 34);
    sourceContext.fillStyle = success;
    sourceContext.beginPath();
    sourceContext.arc(width - 38, 42, 5, 0, Math.PI * 2);
    sourceContext.fill();

    sourceContext.fillStyle = surfaceTwo;
    sourceContext.fillRect(34, height - 142, width - 68, 1);
    sourceContext.fillStyle = text;
    sourceContext.font = '800 25px Manrope, sans-serif';
    sourceContext.fillText('Ideas into', 34, height - 116);
    sourceContext.fillText('experiences.', 34, height - 84);
    sourceContext.fillStyle = borderStrong;
    sourceContext.font = '500 12px "DM Mono", monospace';
    sourceContext.fillText('DH—01', width - 82, height - 42);
  }

  drawArtwork();

  function renderPixelated(progress) {
    const block = Math.max(1, Math.round(1 + 35 * (1 - progress) ** 2));
    const pixelWidth = Math.max(1, Math.ceil(canvas.width / block));
    const pixelHeight = Math.max(1, Math.ceil(canvas.height / block));

    pixelContext.imageSmoothingEnabled = false;
    pixelContext.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);
    pixelContext.drawImage(sourceCanvas, 0, 0, pixelWidth, pixelHeight);

    displayContext.imageSmoothingEnabled = false;
    displayContext.clearRect(0, 0, canvas.width, canvas.height);
    displayContext.drawImage(
      pixelCanvas,
      0, 0, pixelWidth, pixelHeight,
      0, 0, canvas.width, canvas.height
    );
    artFrame.style.transform = `scale(${(1.06 - .06 * progress).toFixed(4)})`;
    counterValue.textContent = String(Math.floor(progress * 100)).padStart(3, '0');
    counterProgress.style.transform = `scaleX(${progress})`;
  }

  renderPixelated(0);
  root.classList.remove('intro-pending');
  root.classList.add('intro-playing');
  document.body.append(intro);

  const previousScrollY = window.scrollY;
  const timers = [];
  let animationFrame = 0;
  let completed = false;

  function schedule(callback, delay) {
    timers.push(window.setTimeout(callback, delay));
  }

  function finishIntro() {
    if (completed) return;
    completed = true;
    timers.forEach(window.clearTimeout);
    window.cancelAnimationFrame(animationFrame);
    window.removeEventListener('click', onPageClick, true);
    window.removeEventListener('keydown', onEscape, true);
    root.classList.remove('intro-pending', 'intro-playing', 'intro-opening', 'intro-hero-entering');
    intro.remove();
    window.scrollTo(0, previousScrollY);
  }

  function onPageClick() {
    finishIntro();
  }

  function onEscape(event) {
    if (event.key === 'Escape') finishIntro();
  }

  window.addEventListener('click', onPageClick, true);
  window.addEventListener('keydown', onEscape, true);
  skip.addEventListener('click', finishIntro);

  const startedAt = performance.now();
  function animate(timestamp) {
    if (completed) return;
    const elapsed = timestamp - startedAt;
    const progress = Math.max(0, Math.min(1, (elapsed - blackout) / focus));
    renderPixelated(progress);
    if (progress < 1) animationFrame = window.requestAnimationFrame(animate);
  }
  animationFrame = window.requestAnimationFrame(animate);

  schedule(() => intro.classList.add('intro-phase-one'), blackout);
  schedule(() => {
    counterValue.textContent = '100';
    intro.classList.add('intro-phase-name');
  }, blackout + focus);
  schedule(() => {
    intro.classList.add('intro-opening');
    root.classList.add('intro-opening');
  }, blackout + focus + nameDuration);
  schedule(() => root.classList.add('intro-hero-entering'), blackout + focus + nameDuration + heroDelay);
  schedule(finishIntro, totalDuration);
})();
