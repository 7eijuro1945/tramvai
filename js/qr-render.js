(function (global) {
  function drawModules(qr, ctx, size, quiet) {
    const count = qr.getModuleCount();
    const cells = count + quiet * 2;
    const cell = size / cells;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#111";
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (!qr.isDark(row, col)) continue;
        ctx.fillRect(
          (col + quiet) * cell,
          (row + quiet) * cell,
          Math.ceil(cell),
          Math.ceil(cell)
        );
      }
    }
    return { count, cell, quiet };
  }

  function clearCenter(ctx, size, ratio) {
    const hole = size * ratio;
    const x = (size - hole) / 2;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, hole / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, hole / 2, 0, Math.PI * 2);
    ctx.fill();
    return hole;
  }

  function renderQrCanvas(canvas, text, options = {}) {
    if (typeof qrcode !== "function") {
      throw new Error("qrcode library is missing");
    }
    const size = options.size || 512;
    const quiet = options.quiet == null ? 2 : options.quiet;
    const centerRatio = options.centerRatio == null ? 0.28 : options.centerRatio;
    const level = options.level || "M";

    const qr = qrcode(0, level);
    qr.addData(String(text));
    qr.make();

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    drawModules(qr, ctx, size, quiet);
    if (centerRatio > 0) clearCenter(ctx, size, centerRatio);
    return canvas;
  }

  function renderQrBadge(canvas, text, options = {}) {
    const size = options.size || 128;
    renderQrCanvas(canvas, text, {
      size,
      quiet: 1,
      centerRatio: 0,
      level: options.level || "L",
    });
    return canvas;
  }

  global.renderQrCanvas = renderQrCanvas;
  global.renderQrBadge = renderQrBadge;
})(window);
