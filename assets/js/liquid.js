class LiquidCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.points = [];
    this.cols = 18;
    this.rows = 12;
    this.mouse = { x: -1000, y: -1000, radius: 180 };
    this.isMobile = window.innerWidth <= 768;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.running = false;
    this.visible = true;
    this.calmFrames = 0;
    this.lastTime = 0;

    this.init();
    this.bindEvents();
    this.wake();
  }

  init() {
    this.resize();
    this.createMesh();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.cols = 10;
      this.rows = 8;
      this.mouse.radius = 120;
    } else {
      this.cols = 18;
      this.rows = 12;
      this.mouse.radius = 180;
    }
  }

  createMesh() {
    this.points = [];
    const spacingX = this.width / (this.cols - 1);
    const spacingY = this.height / (this.rows - 1);

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const baseX = i * spacingX;
        const baseY = j * spacingY;
        this.points.push({ x: baseX, y: baseY, baseX, baseY, vx: 0, vy: 0 });
      }
    }
  }

  bindEvents() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resize();
        this.createMesh();
        this.wake();
      }, 150);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.wake();
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
        this.wake();
      }
    }, { passive: true });

    // Berhenti menggambar saat tab tidak aktif atau hero sudah tidak terlihat
    document.addEventListener('visibilitychange', () => {
      this.visible = !document.hidden;
      if (this.visible) this.wake();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        this.visible = entries[0].isIntersecting && !document.hidden;
        if (this.visible) this.wake();
      }).observe(this.canvas);
    }
  }

  // Jalankan loop animasi hanya kalau memang ada yang perlu digerakkan
  wake() {
    this.calmFrames = 0;
    if (this.running || !this.visible) return;
    this.running = true;
    requestAnimationFrame((t) => this.animate(t));
  }

  animate(time) {
    if (!this.visible) {
      this.running = false;
      return;
    }

    // Batasi ~45 fps supaya ringan dan stabil di laptop biasa
    if (time - this.lastTime < 22) {
      requestAnimationFrame((t) => this.animate(t));
      return;
    }
    this.lastTime = time;

    if (this.isMobile && this.mouse.x === -1000) {
      const t = Date.now() * 0.002;
      this.mouse.x = this.width / 2 + Math.cos(t) * 100;
      this.mouse.y = this.height / 2 + Math.sin(t) * 100;
    }

    const radius = this.mouse.radius;
    const radiusSq = radius * radius;
    let motion = 0;

    for (const p of this.points) {
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < radiusSq) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / radius) * 15;
        const angle = Math.atan2(dy, dx);
        p.vx -= Math.cos(angle) * force;
        p.vy -= Math.sin(angle) * force;
      }

      p.vx += (p.baseX - p.x) * 0.05;
      p.vy += (p.baseY - p.y) * 0.05;
      p.vx *= 0.85;
      p.vy *= 0.85;

      p.x += p.vx;
      p.y += p.vy;

      motion += Math.abs(p.vx) + Math.abs(p.vy);
    }

    this.draw();

    // Kalau jaring sudah diam, hentikan loop (dibangunkan lagi saat mouse bergerak)
    if (motion < 0.05 && !this.isMobile) {
      this.calmFrames++;
      if (this.calmFrames > 20 || this.reduceMotion) {
        this.running = false;
        return;
      }
    } else {
      this.calmFrames = 0;
    }

    requestAnimationFrame((t) => this.animate(t));
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 82, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let i = 0; i < this.points.length; i++) {
      if (i % this.rows !== 0) {
        const prev = this.points[i - 1];
        const p = this.points[i];
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LiquidCanvas('liquidCanvas');
});
