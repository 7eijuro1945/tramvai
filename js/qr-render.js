(function (global) {
  function drawModules(qr, ctx, size, quiet, dark, light) {
    const count = qr.getModuleCount();
    const cells = count + quiet * 2;
    const cell = size / cells;
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = dark;
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (!qr.isDark(row, col)) continue;
        const x = Math.floor((col + quiet) * cell);
        const y = Math.floor((row + quiet) * cell);
        const w = Math.ceil((col + quiet + 1) * cell) - x;
        const h = Math.ceil((row + quiet + 1) * cell) - y;
        ctx.fillRect(x, y, w, h);
      }
    }
    return { count, cell, quiet };
  }

  function clearCenter(ctx, size, ratio, fill) {
    const hole = size * ratio;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, hole / 2, 0, Math.PI * 2);
    ctx.fill();
    return hole;
  }

  function makeQr(text, level) {
    const api = global.qrcode;
    if (typeof api !== "function") {
      throw new Error("qrcode library is missing");
    }
    const qr = api(0, level);
    qr.addData(String(text));
    qr.make();
    return qr;
  }

  function renderQrCanvas(canvas, text, options = {}) {
    const size = options.size || 512;
    const quiet = options.quiet == null ? 2 : options.quiet;
    const centerRatio = options.centerRatio == null ? 0.28 : options.centerRatio;
    const level = options.level || "M";
    const invert = Boolean(options.invert);
    const dark = invert ? "#f2f2f7" : "#111111";
    const light = invert ? "#1c1c1e" : "#ffffff";

    const qr = makeQr(text, level);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    drawModules(qr, ctx, size, quiet, dark, light);
    if (centerRatio > 0) clearCenter(ctx, size, centerRatio, light);
    return canvas;
  }

  function renderQrBadge(canvas, text, options = {}) {
    const size = options.size || 128;
    renderQrCanvas(canvas, text, {
      size,
      quiet: 1,
      centerRatio: 0,
      level: options.level || "L",
      invert: options.invert,
    });
    return canvas;
  }

  global.renderQrCanvas = renderQrCanvas;
  global.renderQrBadge = renderQrBadge;
})(window);
