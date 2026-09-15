const KEYS = {
  trolleybus: "vehicle-trolleybus",
  tram: "vehicle-tram",
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
  quote: "— залишайтеся людьми і кричіть, що ви живі. Я живий!",
  validMs: 60 * 60 * 1000,
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatPurchased(date) {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `Purchased ${monthNames[date.getMonth()]} ${date.getDate()} in ${hour12}:${minutes} ${suffix}`;
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

function init() {
  const kind = document.body.dataset.kind || "trolleybus";
  const label = LABELS[kind];
  const otherKind = kind === "tram" ? "trolleybus" : "tram";
  const purchasedAt = new Date();
  const expiresAt = purchasedAt.getTime() + TICKET.validMs;

  document.getElementById("quote").textContent = TICKET.quote;
  document.getElementById("transport").textContent = label;
  document.getElementById("purchased").textContent = formatPurchased(purchasedAt);
  document.getElementById("amount").textContent = `${TICKET.count} ticket`;
  document.getElementById("transport-label").textContent = label;
  document.getElementById("number").innerHTML =
    `Number: <strong>${TICKET.number}</strong>`;

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
      timer.textContent = "00:00";
      statusText.textContent = "Ticket expired — ";
      status.classList.add("is-expired");
      return;
    }
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

  const otherPages = {
    tram: {
      local: "tram.html",
      live: "https://e-tramvai-tram.netlify.app/",
    },
    trolleybus: {
      local: "index.html",
      live: "https://e-tramvai-trolleybus.netlify.app/",
    },
  };
  const otherTicket = otherPages[otherKind];
  document.getElementById("other-ticket").href =
    location.hostname.includes("netlify.app") ? otherTicket.live : otherTicket.local;
  document.getElementById("other-ticket").textContent =
    `Квиток: ${LABELS[otherKind]}`;
}

init();
