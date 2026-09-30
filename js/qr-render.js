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

  function toSvg(qr, options = {}) {
    const cell = options.cellSize || 12;
    const quiet = options.quiet == null ? 2 : options.quiet;
    const invert = Boolean(options.invert);
    const dark = invert ? "#f5f5f7" : "#111111";
    const light = invert ? "#111111" : "#ffffff";
    const count = qr.getModuleCount();
    const size = (count + quiet * 2) * cell;
    const parts = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">`,
      `<rect width="100%" height="100%" fill="${light}"/>`,
    ];
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (!qr.isDark(row, col)) continue;
        parts.push(
          `<rect x="${(col + quiet) * cell}" y="${(row + quiet) * cell}" width="${cell}" height="${cell}" fill="${dark}"/>`
        );
      }
    }
    parts.push("</svg>");
    return parts.join("");
  }

  function toDataUri(svg) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function applyQr(target, text, options = {}) {
    if (!target) return null;
    const qr = makeQr(text, options.level);
    const uri = toDataUri(toSvg(qr, options));

    if (target.tagName === "IMG") {
      target.alt = target.alt || "QR-код";
      target.src = uri;
      return target;
    }

    if (target.tagName === "CANVAS") {
      const size = options.size || 640;
      const img = new Image();
      img.onload = () => {
        target.width = size;
        target.height = size;
        const ctx = target.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = options.invert ? "#111111" : "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
      };
      img.src = uri;
      return target;
    }

    target.innerHTML = toSvg(qr, options);
    const el = target.firstElementChild;
    if (el) {
      el.style.width = "100%";
      el.style.height = "auto";
      el.style.display = "block";
    }
    return target;
  }

  global.renderQrCanvas = function (el, text, options) {
    return applyQr(el, text, options);
  };
  global.renderQrBadge = function (el, text, options) {
    return applyQr(el, text, options);
  };
  global.renderQrImage = function (el, text, options) {
    return applyQr(el, text, options);
  };
})(window);
