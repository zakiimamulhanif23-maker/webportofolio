(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (reducedMotion.matches) return;

  const heroHeading = document.querySelector('.hero h1');
  if (heroHeading) {
    const accessibleName = heroHeading.innerText.replace(/\s+/g, ' ').trim();
    heroHeading.setAttribute('aria-label', accessibleName);

    const textNodes = [];
    const walker = document.createTreeWalker(heroHeading, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim()) textNodes.push(walker.currentNode);
    }

    let letterIndex = 0;
    textNodes.forEach(textNode => {
      const fragment = document.createDocumentFragment();
      Array.from(textNode.textContent).forEach(character => {
        const letter = document.createElement('span');
        letter.className = 'kinetic-char';
        letter.setAttribute('aria-hidden', 'true');
        letter.style.setProperty('--letter-index', letterIndex++);
        letter.textContent = character;
        fragment.append(letter);
      });
      textNode.replaceWith(fragment);
    });
  }

  const enableMotion = () => {
    root.classList.add('motion-ready');
  };

  if (root.classList.contains('intro-pending') || root.classList.contains('intro-playing')) {
    const introObserver = new MutationObserver(() => {
      if (!root.classList.contains('intro-pending') && !root.classList.contains('intro-playing')) {
        introObserver.disconnect();
        enableMotion();
      }
    });
    introObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
  } else {
    enableMotion();
  }

  const visualStage = document.querySelector('.visual-stage');
  if (visualStage && 'IntersectionObserver' in window) {
    let observerResponded = false;
    const portraitFallback = window.setTimeout(() => {
      if (!observerResponded) visualStage.classList.add('portrait-revealed');
    }, 1200);
    const portraitObserver = new IntersectionObserver(entries => {
      observerResponded = true;
      window.clearTimeout(portraitFallback);
      if (entries.some(entry => entry.isIntersecting)) {
        visualStage.classList.add('portrait-revealed');
        portraitObserver.disconnect();
      }
    }, { threshold: 0.15 });
    portraitObserver.observe(visualStage);
  } else if (visualStage) {
    visualStage.classList.add('portrait-revealed');
  }

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!finePointer.matches) return;

  const cursorElements = ['cursor-dot', 'cursor-ring', 'cursor-ring cursor-ring-wide'].map(className => {
    const cursorElement = document.createElement('span');
    cursorElement.className = `cursor-trail ${className}`;
    cursorElement.setAttribute('aria-hidden', 'true');
    document.body.append(cursorElement);
    return cursorElement;
  });
  root.classList.add('has-custom-cursor');

  let pointerX = -100;
  let pointerY = -100;
  let isPointerVisible = false;

  window.addEventListener('pointermove', event => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    isPointerVisible = true;
    cursorElements.forEach(cursorElement => cursorElement.classList.add('is-visible'));
    cursorElements[0].style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
    cursorElements[1].style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
    cursorElements[2].style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;

    const target = event.target instanceof Element ? event.target.closest('a, button') : null;
    cursorElements[0].classList.toggle('is-active', Boolean(target));
  }, { passive: true });

  document.addEventListener('pointerout', event => {
    if (event.relatedTarget === null) {
      isPointerVisible = false;
      cursorElements.forEach(cursorElement => cursorElement.classList.remove('is-visible', 'is-active'));
    }
  });

  const magneticButtons = document.querySelectorAll('.btn');
  magneticButtons.forEach(button => {
    button.addEventListener('pointermove', event => {
      const bounds = button.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
      const y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
      button.style.setProperty('--magnet-x', `${(x * 6).toFixed(2)}px`);
      button.style.setProperty('--magnet-y', `${(y * 6).toFixed(2)}px`);
    }, { passive: true });
    button.addEventListener('pointerleave', () => {
      button.style.removeProperty('--magnet-x');
      button.style.removeProperty('--magnet-y');
    });
  });

  document.querySelectorAll('.project-card').forEach(card => {
    const artWindow = card.querySelector('.art-window');
    card.addEventListener('pointermove', event => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      card.style.setProperty('--card-tilt-x', `${(x * 3).toFixed(2)}deg`);
      card.style.setProperty('--card-tilt-y', `${(y * -3).toFixed(2)}deg`);
      if (artWindow) {
        artWindow.style.setProperty('--art-shift-x', `${(x * 8).toFixed(2)}px`);
        artWindow.style.setProperty('--art-shift-y', `${(y * 8).toFixed(2)}px`);
      }
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--card-tilt-x');
      card.style.removeProperty('--card-tilt-y');
      if (artWindow) {
        artWindow.style.removeProperty('--art-shift-x');
        artWindow.style.removeProperty('--art-shift-y');
      }
    });
  });

  if (visualStage && 'IntersectionObserver' in window) {
    let scrollFrame = 0;
    const updateParallax = () => {
      scrollFrame = 0;
      if (!visualStage.isConnected) return;
      const bounds = visualStage.getBoundingClientRect();
      const offset = (bounds.top + bounds.height / 2 - window.innerHeight / 2) / window.innerHeight;
      const shift = Math.max(-6, Math.min(6, offset * -6));
      visualStage.style.setProperty('--scroll-shift', `${shift.toFixed(2)}px`);
    };

    window.addEventListener('scroll', () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateParallax);
    }, { passive: true });
    updateParallax();
  }

  if (!isPointerVisible) cursorElements.forEach(cursorElement => cursorElement.classList.remove('is-visible'));
})();
