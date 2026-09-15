const KEYS = {
  trolleybus: "vehicle-trolleybus",
  tram: "vehicle-tram",
  session: {
    trolleybus: "ticket-session-trolleybus",
    tram: "ticket-session-tram",
  },
};

const LABELS = {
  trolleybus: "Тролейбус",
  tram: "Трамвай",
};

const DEFAULTS = {
  trolleybus: "009",
  tram: "001",
};

const TICKET = {
  count: 1,
  number: "244 197",
  quotes: [
    "— залишайтеся людьми і кричіть, що ви живі. Я живий!",
    "Життя — цікаве",
  ],
  validMs: 60 * 60 * 1000,
};

const monthNames = [
  "січня", "лютого", "березня", "квітня", "травня", "червня",
  "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
];

function formatPurchased(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `Придбано ${date.getDate()} ${monthNames[date.getMonth()]} о ${hours}:${minutes}`;
}

function formatRemain(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 4);
}

function normalizeVehicle(value, fallback) {
  const digits = digitsOnly(value);
  if (!digits) return fallback;
  return digits.padStart(Math.max(3, digits.length), "0");
}

function readVehicle(kind) {
  return normalizeVehicle(localStorage.getItem(KEYS[kind]), DEFAULTS[kind]);
}

function writeVehicle(kind, value) {
  const next = normalizeVehicle(value, DEFAULTS[kind]);
  localStorage.setItem(KEYS[kind], next);
  return next;
}

function readSession(kind) {
  try {
    const raw = localStorage.getItem(KEYS.session[kind]);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const purchasedAt = Number(data.purchasedAt);
    const expiresAt = Number(data.expiresAt);
    if (!purchasedAt || !expiresAt) return null;
    return { purchasedAt, expiresAt };
  } catch {
    return null;
  }
}

function writeSession(kind, purchasedAt, expiresAt) {
  localStorage.setItem(
    KEYS.session[kind],
    JSON.stringify({ purchasedAt, expiresAt })
  );
}

function getSession(kind) {
  const saved = readSession(kind);
  if (saved) return saved;
  const purchasedAt = Date.now();
  const expiresAt = purchasedAt + TICKET.validMs;
  writeSession(kind, purchasedAt, expiresAt);
  return { purchasedAt, expiresAt };
}

function init() {
  const kind = document.body.dataset.kind || "trolleybus";
  const label = LABELS[kind];
  const otherKind = kind === "tram" ? "trolleybus" : "tram";
  const session = getSession(kind);
  const purchasedAt = new Date(session.purchasedAt);
  const expiresAt = session.expiresAt;

  const quoteParts = TICKET.quotes
    .map((text) => `<span>${text}</span>`)
    .join('<span class="quote-sep">◆</span>');
  document.getElementById("quote").innerHTML = `${quoteParts}<span class="quote-sep">◆</span>${quoteParts}`;
  document.getElementById("transport").textContent = label;
  document.getElementById("purchased").textContent = formatPurchased(purchasedAt);
  document.getElementById("amount").textContent = `${TICKET.count} квиток`;
  document.getElementById("transport-label").textContent = label;
  document.getElementById("number").innerHTML =
    `Номер: <strong>${TICKET.number}</strong>`;

  const vehicleInput = document.getElementById("vehicle-input");
  const trolleyField = document.getElementById("trolley-number");
  const tramField = document.getElementById("tram-number");

  const syncFields = () => {
    const trolley = readVehicle("trolleybus");
    const tram = readVehicle("tram");
    vehicleInput.value = kind === "tram" ? tram : trolley;
    trolleyField.value = trolley;
    tramField.value = tram;
  };

  syncFields();

  vehicleInput.addEventListener("input", () => {
    vehicleInput.value = digitsOnly(vehicleInput.value);
  });

  vehicleInput.addEventListener("blur", () => {
    vehicleInput.value = writeVehicle(kind, vehicleInput.value);
    syncFields();
  });

  const bindSheetField = (field, fieldKind) => {
    field.addEventListener("input", () => {
      field.value = digitsOnly(field.value);
    });
    field.addEventListener("blur", () => {
      field.value = writeVehicle(fieldKind, field.value);
      syncFields();
    });
  };

  bindSheetField(trolleyField, "trolleybus");
  bindSheetField(tramField, "tram");

  const timer = document.getElementById("timer");
  const status = document.getElementById("status");
  const statusText = document.getElementById("status-text");

  const tick = () => {
    const remain = expiresAt - Date.now();
    if (remain <= 0) {
      document.body.classList.add("is-expired");
      status.classList.add("is-expired");
      statusText.textContent = "😔  Квиток недійсний";
      timer.textContent = "";
      return;
    }
    statusText.textContent = "Квиток дійсний — ";
    timer.textContent = formatRemain(remain);
    requestAnimationFrame(() => setTimeout(tick, 250));
  };
  tick();

  const overlay = document.getElementById("overlay");
  document.getElementById("info-btn").addEventListener("click", () => {
    syncFields();
    overlay.classList.add("is-open");
  });
  document.getElementById("close-info").addEventListener("click", () => {
    writeVehicle("trolleybus", trolleyField.value);
    writeVehicle("tram", tramField.value);
    syncFields();
    overlay.classList.remove("is-open");
  });
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) overlay.classList.remove("is-open");
  });

  document.getElementById("other-ticket").href =
    otherKind === "tram" ? "tram.html" : "index.html";
  document.getElementById("other-ticket").textContent =
    `Квиток: ${LABELS[otherKind]}`;
}

init();
