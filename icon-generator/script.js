(function(){
  const CANVAS_SIZE = 1024;
  const canvas = document.getElementById('previewCanvas');
  const ctx = canvas.getContext('2d');

  // ---- DOM references ----
  const stage = document.getElementById('stage');
  const fileInput = document.getElementById('fileInput');
  const drop = document.getElementById('drop');
  const filenameEl = document.getElementById('filename');
  const downloadBtn = document.getElementById('downloadBtn');
  const imageResetBtn = document.getElementById('imageResetBtn');
  const resetBtn = document.getElementById('resetBtn');
  const bgFillEnabledInput = document.getElementById('bgFillEnabled');
  const bgColorInput = document.getElementById('bgColor');

  const DEFAULTS = {
    roundness: 4.5,
    padding: 6,
    shadowOpacity: 35,
    shadowBlur: 40,
    shadowOffset: 18,
    bgFillEnabled: false,
    bgColor: '#ffffff'
  };

  // Slider controls, each paired with its value label and default key.
  const controls = [
    { key: 'roundness', input: document.getElementById('roundness'), valEl: document.getElementById('roundnessVal'), format: v => parseFloat(v).toFixed(1) },
    { key: 'padding', input: document.getElementById('padding'), valEl: document.getElementById('paddingVal'), format: v => v + '%' },
    { key: 'shadowOpacity', input: document.getElementById('shadowOpacity'), valEl: document.getElementById('shadowOpacityVal'), format: v => v + '%' },
    { key: 'shadowBlur', input: document.getElementById('shadowBlur'), valEl: document.getElementById('shadowBlurVal'), format: v => v + 'px' },
    { key: 'shadowOffset', input: document.getElementById('shadowOffset'), valEl: document.getElementById('shadowOffsetVal'), format: v => v + 'px' }
  ];

  let img = null;
  let imgName = 'icon';

  // ---- Superellipse (squircle) path builder ----
  // |x/a|^n + |y/a|^n = 1, sampled and traced as a canvas path.
  function squirclePath(ctx, cx, cy, size, n, steps) {
    steps = steps || 200;
    const a = size / 2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const ct = Math.cos(t), st = Math.sin(t);
      const x = Math.sign(ct) * Math.pow(Math.abs(ct), 2 / n) * a;
      const y = Math.sign(st) * Math.pow(Math.abs(st), 2 / n) * a;
      const px = cx + x, py = cy + y;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  // ---- Rendering ----
  function draw() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (!img) return;

    const n = parseFloat(controls[0].input.value); // roundness
    const paddingPct = parseFloat(controls[1].input.value) / 100;
    const shadowOpacity = parseFloat(controls[2].input.value) / 100;
    const shadowBlur = parseFloat(controls[3].input.value);
    const shadowOffset = parseFloat(controls[4].input.value);

    const shapeSize = CANVAS_SIZE * (1 - paddingPct * 2);
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    // 1. Draw shadow: fill the squircle shape with a soft shadow, offscreen (invisible fill, visible shadow)
    if (shadowOpacity > 0) {
      ctx.save();
      ctx.shadowColor = `rgba(0,0,0,${shadowOpacity})`;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetY = shadowOffset;
      ctx.fillStyle = 'rgba(0,0,0,1)';
      squirclePath(ctx, cx, cy, shapeSize, n);
      ctx.fill();
      ctx.restore();

      // Erase the solid fill itself, keeping only the shadow, by clipping outside the shape
      // (the fill drawn above sits at full opacity within the shape; we redraw the shape
      // area as transparent using destination-out so only the drop shadow remains there)
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      squirclePath(ctx, cx, cy, shapeSize, n);
      ctx.fill();
      ctx.restore();
    }

    // 2. Clip to squircle and draw the image, covering the shape (like object-fit: cover)
    ctx.save();
    squirclePath(ctx, cx, cy, shapeSize, n);
    ctx.clip();

    // Fill transparent areas of the source image with a solid background color
    if (bgFillEnabledInput.checked) {
      ctx.fillStyle = bgColorInput.value;
      ctx.fillRect(cx - shapeSize / 2, cy - shapeSize / 2, shapeSize, shapeSize);
    }

    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(shapeSize / iw, shapeSize / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = cx - dw / 2, dy = cy - dh / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  function refreshLabels() {
    controls.forEach(c => { c.valEl.textContent = c.format(c.input.value); });
  }

  // ---- Image loading ----
  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    imgName = file.name.replace(/\.[^.]+$/, '') || 'icon';
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => {
        img = image;
        downloadBtn.disabled = false;
        filenameEl.textContent = file.name;
        stage.classList.remove('empty');
        draw();
      };
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function resetImage() {
    img = null;
    imgName = 'icon';
    fileInput.value = '';
    filenameEl.textContent = '';
    downloadBtn.disabled = true;
    stage.classList.add('empty');
    draw();
  }

  // ---- Event bindings ----
  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) loadFile(e.target.files[0]);
  });

  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('dragover');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('dragover');
    if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
  });

  imageResetBtn.addEventListener('click', resetImage);

  controls.forEach(c => {
    c.input.addEventListener('input', () => {
      refreshLabels();
      draw();
    });
  });

  [bgFillEnabledInput, bgColorInput].forEach(el => {
    el.addEventListener('input', draw);
  });

  resetBtn.addEventListener('click', () => {
    controls.forEach(c => { c.input.value = DEFAULTS[c.key]; });
    bgFillEnabledInput.checked = DEFAULTS.bgFillEnabled;
    bgColorInput.value = DEFAULTS.bgColor;
    refreshLabels();
    draw();
  });

  downloadBtn.addEventListener('click', () => {
    if (!img) return;
    const link = document.createElement('a');
    link.download = imgName + '-squircle.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // ---- Init ----
  draw();
})();
