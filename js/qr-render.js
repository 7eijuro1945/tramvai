(function (global) {
  function makeQr(text, level) {
    const api = global.qrcode;
    if (typeof api !== "function") {
      throw new Error("qrcode library is missing");
    }
    const qr = api(0, level || "M");
    qr.addData(String(text));
    qr.make();
    return qr;
  }

  function paint(canvas, text, options) {
    if (!canvas) return null;
    const size = options.size || 640;
    const quiet = options.quiet == null ? 2 : options.quiet;
    const level = options.level || "M";
    const dark = "#111111";
    const light = "#ffffff";
    const qr = makeQr(text, level);
    const count = qr.getModuleCount();
    const cells = count + quiet * 2;
    const cell = size / cells;

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
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

    const hole = size * (options.centerRatio == null ? 0.26 : options.centerRatio);
    if (hole > 0) {
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, hole / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    return canvas;
  }

  global.renderQrCanvas = paint;
  global.renderQrBadge = paint;
  global.renderQrImage = paint;
})(window);
