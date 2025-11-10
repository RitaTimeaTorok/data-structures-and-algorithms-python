// ==============================
// CONFIG & STATE
// ==============================

let selectedAlgorithm = "bubble";
let animationSpeed = 300;

let currentMode = "sort"; // "sort" | "ds"
let currentDS = null; // "stack" | "queue" | "linked-list"

let stackState = [];
let queueState = [];
let linkedState = [];

// theme colors
const normal = "#5050a1";
const highlight = "#91aafaff";
const keyColor = "#a0b3ff";
const mergeLeft = "#99baff";
const mergeRight = "#7189ff";
const mergeWrite = "#8db1ff";
const finalColor = "#7fa6ff";
const pivotColor = "#00a3c4ff";

// ==============================
// GENERIC DOM & UTILS
// ==============================

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function setStatus(text) {
  const statusEl = document.getElementById("status-text");
  if (statusEl) statusEl.textContent = text;
}

function getArrayElements() {
  return Array.from(document.querySelectorAll(".array-element"));
}

function getArrayValues() {
  return getArrayElements().map((el) => parseInt(el.dataset.value, 10));
}

function parseInitData(attrValue) {
  try {
    if (!attrValue) return [];
    const arr = JSON.parse(attrValue);
    return Array.isArray(arr) ? arr.map((n) => Number(n)) : [];
  } catch {
    return [];
  }
}

// ==============================
// SORTING: RENDER & INPUT
// (visualization handlers for sorts live in sort.js; we only render array here)
// ==============================

function renderArray(values) {
  const display = document.querySelector(".array-display");
  if (!display) return;

  const frag = document.createDocumentFragment();
  values.forEach((val) => {
    const el = document.createElement("div");
    el.className = "array-element";
    el.dataset.value = String(val);
    el.textContent = String(val);
    el.style.height = val * 2 + "px";
    frag.appendChild(el);
  });

  display.innerHTML = "";
  display.appendChild(frag);
  setStatus("Array updated. Pick an algorithm and press Start Visualization.");
}

function parseArrayInput(text) {
  if (typeof text !== "string")
    return { ok: false, error: "Input must be text." };

  const parts = text
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (parts.length === 0)
    return { ok: false, error: "Please enter at least one number." };

  const nums = parts.map((n) => Number(n));
  if (nums.some((n) => !Number.isFinite(n))) {
    return {
      ok: false,
      error: "All items must be valid numbers (use commas to separate).",
    };
  }
  return { ok: true, value: nums };
}

// ==============================
// DS: SHARED CANVAS HELPERS
// ==============================

function clearDSCanvas() {
  const dsCanvas = document.getElementById("ds-canvas");
  if (dsCanvas) dsCanvas.innerHTML = "";
}

function createDSItem(value) {
  const item = document.createElement("div");
  item.className = "ds-item";
  item.textContent = String(value);
  item.dataset.value = String(value);
  return item;
}

// ==============================
// DS: STACK RENDER & HELPERS
// ==============================

function getStackContainer() {
  return document.querySelector("#ds-canvas .ds-stack");
}
function getStackItems() {
  const col = getStackContainer();
  if (!col) return [];
  return Array.from(col.querySelectorAll(".ds-item"));
}

function renderStack(values) {
  const dsCanvas = document.getElementById("ds-canvas");
  if (!dsCanvas) return;
  clearDSCanvas();

  const col = document.createElement("div");
  col.className = "ds-stack";
  col.style.display = "flex";
  col.style.flexDirection = "column-reverse"; // top at the visual top
  col.style.alignItems = "center";
  col.style.justifyContent = "flex-start";
  col.style.gap = "8px";
  col.style.padding = "16px";

  values.forEach((v) => col.appendChild(createDSItem(v)));
  dsCanvas.appendChild(col);
}

// ==============================
// DS: QUEUE RENDER & HELPERS
// ==============================

function getQueueContainer() {
  return document.querySelector("#ds-canvas .ds-queue");
}
function getQueueItems() {
  const row = getQueueContainer();
  if (!row) return [];
  return Array.from(row.querySelectorAll(".ds-item"));
}

function renderQueue(values) {
  const dsCanvas = document.getElementById("ds-canvas");
  if (!dsCanvas) return;
  clearDSCanvas();

  const row = document.createElement("div");
  row.className = "ds-queue";
  row.style.display = "flex";
  row.style.flexDirection = "row"; // left = front, right = rear
  row.style.alignItems = "center";
  row.style.justifyContent = "center";
  row.style.gap = "8px";
  row.style.padding = "16px";

  values.forEach((v) => row.appendChild(createDSItem(v)));
  dsCanvas.appendChild(row);
}

// ==============================
// DS: LINKED LIST RENDER
// ==============================

function createDSNode(value, isHead = false) {
  const node = document.createElement("div");
  node.className = "ds-node";
  node.style.background = isHead ? keyColor : normal;
  node.style.color = "#fff";
  node.style.fontWeight = "700";
  node.style.borderRadius = "10px";
  node.style.display = "flex";
  node.style.alignItems = "center";
  node.style.justifyContent = "center";
  node.style.minWidth = "56px";
  node.style.minHeight = "42px";
  node.style.padding = "6px 12px";
  node.style.boxShadow = "0 2px 10px rgba(0,0,0,0.35)";
  node.style.position = "relative";
  node.textContent = String(value);
  return node;
}

function createLink() {
  const link = document.createElement("div");
  link.className = "ds-link";
  link.textContent = "→";
  link.style.opacity = "0.7";
  link.style.fontWeight = "800";
  link.style.fontSize = "20px";
  link.style.margin = "0 6px";
  link.style.userSelect = "none";
  return link;
}

function renderLinkedList(values) {
  const dsCanvas = document.getElementById("ds-canvas");
  if (!dsCanvas) return;
  clearDSCanvas();

  const row = document.createElement("div");
  row.className = "ds-linked-list";
  row.style.display = "flex";
  row.style.flexDirection = "row";
  row.style.alignItems = "center";
  row.style.justifyContent = "center";
  row.style.gap = "6px";
  row.style.padding = "16px";
  row.style.flexWrap = "wrap";

  values.forEach((v, idx) => {
    const isHead = idx === 0;
    const node = createDSNode(v, isHead);

    if (isHead) {
      const badge = document.createElement("div");
      badge.textContent = "HEAD";
      badge.style.position = "absolute";
      badge.style.top = "-18px";
      badge.style.fontSize = "10px";
      badge.style.fontWeight = "800";
      badge.style.letterSpacing = "0.3px";
      badge.style.color = "#e6e8f0";
      badge.style.opacity = "0.9";

      const wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.flexDirection = "column";
      wrap.style.alignItems = "center";
      wrap.style.marginRight = "6px";

      wrap.appendChild(badge);
      wrap.appendChild(node);
      row.appendChild(wrap);
    } else {
      row.appendChild(node);
    }

    if (idx < values.length - 1) row.appendChild(createLink());
  });

  dsCanvas.appendChild(row);
}

// ==============================
// DS: STACK ANIMATION (steps from backend)
// ==============================

async function visualizeStackSteps(steps, finalState) {
  if (!getStackContainer()) renderStack(stackState);

  for (const step of steps) {
    if (step.type === "highlight" && typeof step.index === "number") {
      const items = getStackItems();
      const node = items[step.index];
      if (node) {
        node.style.backgroundColor = highlight;
        await delay(animationSpeed * 0.8);
        node.style.backgroundColor = normal;
      }
    }

    if (step.type === "append") {
      const col = getStackContainer();
      if (!col) continue;
      const el = createDSItem(step.value);
      el.style.transform = "translateY(-12px)";
      el.style.opacity = "0.0";
      col.appendChild(el);
      await delay(20);
      el.style.opacity = "1.0";
      el.style.transform = "translateY(0)";
      el.style.backgroundColor = mergeWrite;
      await delay(animationSpeed * 0.8);
      el.style.backgroundColor = normal;
    }

    if (step.type === "pop") {
      const items = getStackItems();
      const top = items[items.length - 1];
      if (top) {
        top.style.backgroundColor = highlight;
        await delay(animationSpeed * 0.6);
        top.style.opacity = "0.0";
        top.style.transform = "translateY(-10px)";
        await delay(animationSpeed * 0.6);
        top.remove();
      }
    }

    if (step.type === "top") {
      const items = getStackItems();
      const idx = step.index;
      if (typeof idx === "number" && items[idx]) {
        const topEl = items[idx];
        topEl.style.boxShadow = "0 0 0 2px rgba(160,179,255,0.6) inset";
        await delay(animationSpeed * 0.8);
        topEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35)";
      }
    }

    if (step.type === "noop") {
      setStatus("Stack is empty — nothing to pop.");
      await delay(animationSpeed * 0.8);
    }
  }

  renderStack(finalState);
}

// ==============================
// DS: QUEUE ANIMATION (steps from backend)
// ==============================

async function visualizeQueueSteps(steps, finalState) {
  if (!getQueueContainer()) renderQueue(queueState);

  for (const step of steps) {
    if (step.type === "front") {
      const items = getQueueItems();
      const idx = step.index;
      if (typeof idx === "number" && items[idx]) {
        const el = items[idx];
        el.style.boxShadow = "0 0 0 2px rgba(160,179,255,0.6) inset";
        await delay(animationSpeed * 0.6);
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35)";
      }
      await delay(30);
    }

    if (step.type === "rear") {
      const items = getQueueItems();
      const idx = step.index;
      if (typeof idx === "number" && items[idx]) {
        const el = items[idx];
        el.style.boxShadow = "0 0 0 2px rgba(141,177,255,0.6) inset";
        await delay(animationSpeed * 0.6);
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35)";
      }
      await delay(30);
    }

    if (step.type === "highlight") {
      const items = getQueueItems();
      const idx = step.index;
      if (typeof idx === "number" && items[idx]) {
        const el = items[idx];
        el.style.backgroundColor = highlight;
        await delay(animationSpeed * 0.7);
        el.style.backgroundColor = normal;
      }
    }

    if (step.type === "append") {
      const row = getQueueContainer();
      if (!row) continue;
      const el = createDSItem(step.value);
      el.style.transform = "translateY(-10px)";
      el.style.opacity = "0.0";
      row.appendChild(el);
      await delay(20);
      el.style.opacity = "1.0";
      el.style.transform = "translateY(0)";
      el.style.backgroundColor = mergeWrite;
      await delay(animationSpeed * 0.7);
      el.style.backgroundColor = normal;
    }

    if (step.type === "popleft") {
      const items = getQueueItems();
      const first = items[0];
      if (first) {
        first.style.backgroundColor = highlight;
        await delay(animationSpeed * 0.5);
        first.style.opacity = "0.0";
        first.style.transform = "translateY(-10px)";
        await delay(animationSpeed * 0.5);
        first.remove();
      }
    }

    if (step.type === "noop") {
      setStatus("Queue is empty — nothing to dequeue.");
      await delay(animationSpeed * 0.7);
    }
  }

  renderQueue(finalState);
}

// ==============================
// PAGE BOOTSTRAP & EVENT WIRING
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  // initial bar heights for sorting area
  getArrayElements().forEach((el) => {
    const val = parseInt(el.dataset.value, 10);
    el.style.height = val * 2 + "px";
  });

  const sortUI = document.getElementById("sort-ui");
  const dsCanvas = document.getElementById("ds-canvas");
  const customArrayPanel = document.getElementById("custom-array-panel");
  const fileUploadPanel = document.getElementById("file-upload-panel");

  const dsControls = document.getElementById("ds-controls"); // stack controls
  const dsPushBtn = document.getElementById("ds-push-btn");
  const dsPopBtn = document.getElementById("ds-pop-btn");
  const dsValueInput = document.getElementById("ds-push-value");

  const queueControls = document.getElementById("queue-controls");
  const qEnqBtn = document.getElementById("queue-enqueue-btn");
  const qDeqBtn = document.getElementById("queue-dequeue-btn");
  const qValueInput = document.getElementById("queue-enqueue-value");

  // initial DS state from data-attrs
  stackState = parseInitData(dsCanvas?.dataset.stack);
  queueState = parseInitData(dsCanvas?.dataset.queue);
  linkedState = parseInitData(dsCanvas?.dataset.linked);

  function showForSort(name) {
    currentMode = "sort";
    currentDS = null;

    if (sortUI) sortUI.classList.remove("hidden");
    if (customArrayPanel) customArrayPanel.classList.remove("hidden");
    if (fileUploadPanel) fileUploadPanel.classList.remove("hidden");

    if (dsCanvas) {
      dsCanvas.classList.add("hidden");
      clearDSCanvas();
    }

    if (dsControls) dsControls.classList.add("hidden");
    if (queueControls) queueControls.classList.add("hidden");

    setStatus(`Sorting mode: ${name}`);
  }

  function showForDS(name) {
    currentMode = "ds";

    if (sortUI) sortUI.classList.add("hidden");
    if (customArrayPanel) customArrayPanel.classList.remove("hidden");
    if (fileUploadPanel) fileUploadPanel.classList.remove("hidden");
    if (dsCanvas) dsCanvas.classList.remove("hidden");

    if (dsControls) {
      if (currentDS === "stack") dsControls.classList.remove("hidden");
      else dsControls.classList.add("hidden");
    }
    if (queueControls) {
      if (currentDS === "queue") queueControls.classList.remove("hidden");
      else queueControls.classList.add("hidden");
    }

    setStatus(`Data Structure mode: ${name}`);
  }

  // toolbar
  const algoButtons = document.querySelectorAll(".algo-btn");
  algoButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      algoButtons.forEach((b) => b.classList.remove("active", "selected"));
      btn.classList.add("active", "selected");

      const type = btn.getAttribute("data-type");
      const algo = btn.getAttribute("data-algo");

      if (type === "sort") {
        selectedAlgorithm = algo;
        showForSort(btn.textContent.trim());
      } else {
        selectedAlgorithm = null;
        currentDS = algo;
        showForDS(btn.textContent.trim());

        if (algo === "stack") {
          renderStack(stackState);
          setStatus("Stack: initial values from server.");
        } else if (algo === "queue") {
          renderQueue(queueState);
          setStatus("Queue: initial values from server.");
        } else if (algo === "linked-list") {
          renderLinkedList(linkedState);
          setStatus(
            "Linked List: initial values from server (head highlighted)."
          );
        } else {
          clearDSCanvas();
        }
      }
    });
  });

  // default selection
  const defaultBtn = document.querySelector('.algo-btn[data-algo="bubble"]');
  if (defaultBtn) {
    defaultBtn.classList.add("active", "selected");
    showForSort(defaultBtn.textContent.trim());
  } else {
    if (sortUI) sortUI.classList.add("hidden");
    if (dsCanvas) dsCanvas.classList.add("hidden");
    if (customArrayPanel) customArrayPanel.classList.add("hidden");
    if (fileUploadPanel) fileUploadPanel.classList.add("hidden");
    if (dsControls) dsControls.classList.add("hidden");
    if (queueControls) queueControls.classList.add("hidden");
    setStatus("Pick an item from the toolbar");
  }

  // sorting start button (startVisualization is defined in sort.js)
  const startBtnEl = document.getElementById("start-btn");
  if (startBtnEl) startBtnEl.addEventListener("click", startVisualization);

  // stack: push
  if (dsPushBtn) {
    dsPushBtn.addEventListener("click", async () => {
      if (currentMode !== "ds" || currentDS !== "stack") {
        setStatus("Switch to Stack to use Push.");
        return;
      }
      const raw = (dsValueInput?.value ?? "").trim();
      if (!raw.length) {
        setStatus("Enter a value to push.");
        return;
      }
      const value = Number.isFinite(Number(raw)) ? Number(raw) : raw;

      try {
        setStatus("Pushing on stack...");
        const res = await fetch("/ds/stack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: stackState, action: "push", value }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Push failed");
        await visualizeStackSteps(data.steps, data.new_state);
        stackState = data.new_state;
        setStatus("Push complete.");
        if (dsValueInput) dsValueInput.value = "";
      } catch (err) {
        setStatus("Error: " + err.message);
        console.error(err);
      }
    });
  }

  // stack: pop
  if (dsPopBtn) {
    dsPopBtn.addEventListener("click", async () => {
      if (currentMode !== "ds" || currentDS !== "stack") {
        setStatus("Switch to Stack to use Pop.");
        return;
      }
      try {
        setStatus("Popping from stack...");
        const res = await fetch("/ds/stack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: stackState, action: "pop" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Pop failed");
        await visualizeStackSteps(data.steps, data.new_state);
        stackState = data.new_state;
        setStatus("Pop complete.");
      } catch (err) {
        setStatus("Error: " + err.message);
        console.error(err);
      }
    });
  }

  // queue: enqueue
  if (qEnqBtn) {
    qEnqBtn.addEventListener("click", async () => {
      if (currentMode !== "ds" || currentDS !== "queue") {
        setStatus("Switch to Queue to use Enqueue.");
        return;
      }
      const raw = (qValueInput?.value ?? "").trim();
      if (!raw.length) {
        setStatus("Enter a value to enqueue.");
        return;
      }
      const value = Number.isFinite(Number(raw)) ? Number(raw) : raw;

      try {
        setStatus("Enqueuing...");
        const res = await fetch("/ds/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: queueState, action: "enqueue", value }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Enqueue failed");
        await visualizeQueueSteps(data.steps, data.new_state);
        queueState = data.new_state.slice();
        setStatus("Enqueue complete.");
        if (qValueInput) qValueInput.value = "";
      } catch (err) {
        setStatus("Error: " + err.message);
        console.error(err);
      }
    });
  }

  // queue: dequeue
  if (qDeqBtn) {
    qDeqBtn.addEventListener("click", async () => {
      if (currentMode !== "ds" || currentDS !== "queue") {
        setStatus("Switch to Queue to use Dequeue.");
        return;
      }
      try {
        setStatus("Dequeuing...");
        const res = await fetch("/ds/queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: queueState, action: "dequeue" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Dequeue failed");
        await visualizeQueueSteps(data.steps, data.new_state);
        queueState = data.new_state.slice();
        setStatus("Dequeue complete.");
      } catch (err) {
        setStatus("Error: " + err.message);
        console.error(err);
      }
    });
  }

  // manual input (works for both sort & ds)
  const applyBtn = document.getElementById("apply-array");
  const inputEl = document.getElementById("array-input");
  const errorEl = document.getElementById("array-error");

  if (applyBtn && inputEl && errorEl) {
    applyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const { ok, value, error } = parseArrayInput(inputEl.value);

      if (!ok) {
        errorEl.textContent = error || "Invalid input.";
        return;
      }
      errorEl.textContent = "";

      if (currentMode === "sort") {
        renderArray(value);
      } else if (currentMode === "ds") {
        if (currentDS === "stack") {
          stackState = value.slice();
          renderStack(stackState);
        } else if (currentDS === "queue") {
          queueState = value.slice();
          renderQueue(queueState);
        } else if (currentDS === "linked-list") {
          linkedState = value.slice();
          renderLinkedList(linkedState);
        }
        setStatus(`Updated ${currentDS || "data structure"} from input.`);
      }
    });

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyBtn.click();
    });
  }

  // file upload (works for both sort & ds)
  const uploadBtn = document.getElementById("upload-array");
  const fileInput = document.getElementById("array-file");
  const fileError = document.getElementById("file-error");

  if (uploadBtn && fileInput && fileError) {
    uploadBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      fileError.textContent = "";

      if (!fileInput.files || fileInput.files.length === 0) {
        fileError.textContent = "Please choose a file first.";
        return;
      }

      const fd = new FormData();
      fd.append("file", fileInput.files[0]);

      try {
        setStatus("Uploading file...");
        const res = await fetch("/array/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed.");

        const values = data.array || [];

        if (currentMode === "sort") {
          renderArray(values);
        } else if (currentMode === "ds") {
          if (currentDS === "stack") {
            stackState = values.slice();
            renderStack(stackState);
          } else if (currentDS === "queue") {
            queueState = values.slice();
            renderQueue(queueState);
          } else if (currentDS === "linked-list") {
            linkedState = values.slice();
            renderLinkedList(linkedState);
          }
        }

        setStatus(data.message || "File uploaded successfully!");
        fileError.style.color = "#8fff8f";
        fileError.textContent = data.message || "Upload successful!";
        fileInput.value = "";
      } catch (err) {
        fileError.style.color = "#ff8f8f";
        fileError.textContent = err.message;
        setStatus("Error: " + err.message);
      }
    });
  }
});
