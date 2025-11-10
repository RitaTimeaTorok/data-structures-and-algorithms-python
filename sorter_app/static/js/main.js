let selectedAlgorithm = "bubble";
let animationSpeed = 300; // ms

// NEW: track mode + which DS is active
let currentMode = "sort"; // "sort" | "ds"
let currentDS = null; // "stack" | "queue" | "linked-list"

// Keep local DS states (start from server-provided data-attrs)
let stackState = [];
let queueState = [];
let linkedState = [];

// ---------- DOM helpers ----------

function getArrayElements() {
  return Array.from(document.querySelectorAll(".array-element"));
}

function getArrayValues() {
  return getArrayElements().map((el) => parseInt(el.dataset.value, 10));
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function setStatus(text) {
  const statusEl = document.getElementById("status-text");
  if (statusEl) statusEl.textContent = text;
}

// Theme colors
const normal = "#5050a1";
const highlight = "#91aafaff";
const keyColor = "#a0b3ff"; // HEAD / emphasis
const mergeLeft = "#99baff";
const mergeRight = "#7189ff";
const mergeWrite = "#8db1ff";
const finalColor = "#7fa6ff";
const pivotColor = "#00a3c4ff";

// -------- DS rendering helpers ----------

function clearDSCanvas() {
  const dsCanvas = document.getElementById("ds-canvas");
  if (dsCanvas) dsCanvas.innerHTML = "";
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

function createDSItem(value) {
  const item = document.createElement("div");
  item.className = "ds-item";
  item.style.background = normal;
  item.style.color = "#fff";
  item.style.fontWeight = "700";
  item.style.borderRadius = "6px";
  item.style.display = "flex";
  item.style.alignItems = "center";
  item.style.justifyContent = "center";
  item.style.minWidth = "48px";
  item.style.minHeight = "36px";
  item.style.padding = "6px 10px";
  item.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35)";
  item.style.transition =
    "transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease";
  item.textContent = String(value);
  item.dataset.value = String(value);
  return item;
}

function getStackContainer() {
  return document.querySelector("#ds-canvas .ds-stack");
}

function getStackItems() {
  const col = getStackContainer();
  if (!col) return [];
  return Array.from(col.querySelectorAll(".ds-item"));
}

function updateDSControlsVisibility() {
  const dsControls = document.getElementById("ds-controls");
  if (!dsControls) return;
  if (currentMode === "ds" && currentDS === "stack") {
    dsControls.classList.remove("hidden");
  } else {
    dsControls.classList.add("hidden");
  }
}

function renderStack(values) {
  const dsCanvas = document.getElementById("ds-canvas");
  if (!dsCanvas) return;
  clearDSCanvas();

  const col = document.createElement("div");
  col.className = "ds-stack";
  col.style.display = "flex";
  col.style.flexDirection = "column-reverse"; // <-- was "column"
  col.style.alignItems = "center";
  col.style.justifyContent = "flex-start";
  col.style.gap = "8px";
  col.style.padding = "16px";

  values.forEach((v) => col.appendChild(createDSItem(v)));
  dsCanvas.appendChild(col);
}

function renderQueue(values) {
  const dsCanvas = document.getElementById("ds-canvas");
  if (!dsCanvas) return;
  clearDSCanvas();

  const row = document.createElement("div");
  row.className = "ds-queue";
  row.style.display = "flex";
  row.style.flexDirection = "row";
  row.style.alignItems = "center";
  row.style.justifyContent = "center";
  row.style.gap = "8px";
  row.style.padding = "16px";

  values.forEach((v) => row.appendChild(createDSItem(v)));
  dsCanvas.appendChild(row);
}

// ---- Linked List render ----
function createDSNode(value, isHead = false) {
  const node = document.createElement("div");
  node.className = "ds-node";
  node.style.background = isHead ? keyColor : normal; // head highlighted
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
  row.style.flexWrap = "wrap"; // if it overflows

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

    if (idx < values.length - 1) {
      row.appendChild(createLink());
    }
  });

  dsCanvas.appendChild(row);
}

// -------- Stack step visualization ----------
// Steps we handle: highlight {index}, append {value}, pop {value}, top {index}, noop {reason}
async function visualizeStackSteps(steps, finalState) {
  // ensure we have a stack container in the canvas
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
      // create an item, drop it in with a small 'pop' animation
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
      // fade out the last child (top)
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
      // optional: pulse the new top
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

  // snap to final state to avoid drift
  renderStack(finalState);
}

// -------- setup ----------

document.addEventListener("DOMContentLoaded", () => {
  // Set initial bar heights from data-value (sorting area)
  getArrayElements().forEach((el) => {
    const val = parseInt(el.dataset.value, 10);
    el.style.height = val * 2 + "px";
  });

  // View sections for toggling
  const sortUI = document.getElementById("sort-ui");
  const dsCanvas = document.getElementById("ds-canvas");
  const customArrayPanel = document.getElementById("custom-array-panel");
  const fileUploadPanel = document.getElementById("file-upload-panel");

  // NEW: DS controls (push/pop/value)
  const dsControls = document.getElementById("ds-controls");
  const dsPushBtn = document.getElementById("ds-push-btn");
  const dsPopBtn = document.getElementById("ds-pop-btn");
  const dsValueInput = document.getElementById("ds-push-value");

  // Pre-read initial DS data from server
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
    setStatus(`Sorting mode: ${name}`);
  }

  function showForDS(name) {
    currentMode = "ds";
    if (sortUI) sortUI.classList.add("hidden");
    if (customArrayPanel) customArrayPanel.classList.remove("hidden");
    if (fileUploadPanel) fileUploadPanel.classList.remove("hidden");
    if (dsCanvas) dsCanvas.classList.remove("hidden");
    if (dsControls) dsControls.classList.remove("hidden"); // show controls in DS
    setStatus(`Data Structure mode: ${name}`);
  }

  // Toolbar buttons
  const algoButtons = document.querySelectorAll(".algo-btn");
  algoButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      algoButtons.forEach((b) => b.classList.remove("active", "selected"));
      btn.classList.add("active", "selected");

      const type = btn.getAttribute("data-type"); // "sort" | "ds"
      const algo = btn.getAttribute("data-algo"); // "bubble", "stack", etc.

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

  // Default: Bubble
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
    setStatus("Pick an item from the toolbar");
  }

  // Start visualization (sorting)
  const startBtnEl = document.getElementById("start-btn");
  if (startBtnEl) startBtnEl.addEventListener("click", startVisualization);

  // -------- DS Controls: Stack push/pop --------
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
      // accept numbers or text; if numeric, coerce to Number
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
        stackState = data.new_state; // sync local
        setStatus("Push complete.");
        if (dsValueInput) dsValueInput.value = "";
      } catch (err) {
        setStatus("Error: " + err.message);
        console.error(err);
      }
    });
  }

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
        stackState = data.new_state; // sync
        setStatus("Pop complete.");
      } catch (err) {
        setStatus("Error: " + err.message);
        console.error(err);
      }
    });
  }
});

// ---------- visualization control (sorting) ----------

async function startVisualization() {
  const allowedSorts = new Set(["bubble", "insertion", "merge", "quick"]);
  if (!selectedAlgorithm || !allowedSorts.has(selectedAlgorithm)) {
    setStatus("Please select a sorting algorithm.");
    return;
  }

  const arr = getArrayValues();
  const startBtn = document.getElementById("start-btn");
  startBtn.disabled = true;
  startBtn.textContent = `Running ${selectedAlgorithm}...`;
  setStatus("Fetching steps from backend...");

  try {
    const res = await fetch(`/sort/${selectedAlgorithm}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ array: arr }),
    });
    if (!res.ok) throw new Error("Request failed");

    const data = await res.json();

    if (selectedAlgorithm === "bubble") {
      await visualizeBubble(data.steps);
    } else if (selectedAlgorithm === "insertion") {
      await visualizeInsertion(data.steps);
    } else if (selectedAlgorithm === "merge") {
      await visualizeMerge(data.steps);
    } else if (selectedAlgorithm === "quick") {
      await visualizeQuick(data.steps);
    }
    setStatus("Sorting complete!");
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
    setStatus("Error: " + err.message);
  } finally {
    startBtn.disabled = false;
    startBtn.textContent = "Start Visualization";
  }
}

// ---------- Sorting visualizers (unchanged) ----------

async function visualizeBubble(steps) {
  const elements = getArrayElements();
  setStatus("Starting Bubble Sort...");

  let stepNum = 1;
  const total = steps.length;

  for (const { i, j, swap } of steps) {
    setStatus(
      `Step ${stepNum++}/${total}: Comparing index ${i} (${
        elements[i].textContent
      }) and ${j} (${elements[j].textContent})${
        swap ? " → swapping" : " → no swap"
      }`
    );

    const el1 = elements[i];
    const el2 = elements[j];

    el1.style.backgroundColor = highlight;
    el2.style.backgroundColor = highlight;
    await delay(animationSpeed);

    if (swap) {
      const tempVal = el1.dataset.value;
      el1.dataset.value = el2.dataset.value;
      el2.dataset.value = tempVal;

      const tempText = el1.textContent;
      el1.textContent = el2.textContent;
      el2.textContent = tempText;

      const tempHeight = el1.style.height;
      el1.style.height = el2.style.height;
      el2.style.height = tempHeight;
    }

    el1.style.backgroundColor = normal;
    el2.style.backgroundColor = normal;
    await delay(Math.max(80, animationSpeed * 0.4));
  }

  setStatus("Bubble Sort complete!");
  for (const el of elements) el.style.backgroundColor = finalColor;
  await delay(400);
  for (const el of elements) el.style.backgroundColor = normal;
}

async function visualizeInsertion(steps) {
  const elements = getArrayElements();
  setStatus("Starting Insertion Sort...");

  let stepNum = 1;
  const total = steps.length;

  for (const step of steps) {
    if (step.type === "key") {
      setStatus(
        `Step ${stepNum++}/${total}: Inserting value ${
          step.value
        } (key at index ${step.i})`
      );
      const el = elements[step.i];
      el.style.backgroundColor = keyColor;
      await delay(animationSpeed * 1.5);
    }

    if (step.type === "compare") {
      setStatus(
        `Step ${stepNum++}/${total}: Comparing index ${step.i} and ${step.j}`
      );
      const el1 = elements[step.i];
      const el2 = elements[step.j];
      el1.style.backgroundColor = highlight;
      el2.style.backgroundColor = highlight;
      await delay(animationSpeed);
      el1.style.backgroundColor = normal;
      el2.style.backgroundColor = normal;
    }

    if (step.type === "shift") {
      setStatus(
        `Step ${stepNum++}/${total}: Shifting element from ${step.from} → ${
          step.to
        }`
      );
      const elFrom = elements[step.from];
      const elTo = elements[step.to];
      elTo.textContent = elFrom.textContent;
      elTo.dataset.value = elFrom.dataset.value;
      elTo.style.height = elFrom.style.height;
      elFrom.textContent = "";
      elFrom.style.height = "0px";
      await delay(animationSpeed);
    }

    if (step.type === "insert") {
      setStatus(
        `Step ${stepNum++}/${total}: Placing ${step.value} at position ${
          step.index
        }`
      );
      const el = elements[step.index];
      el.textContent = step.value;
      el.dataset.value = step.value;
      el.style.height = step.value * 2 + "px";
      el.style.backgroundColor = mergeWrite;
      await delay(animationSpeed);
      el.style.backgroundColor = normal;
    }
  }

  setStatus("Insertion Sort complete!");
  for (const el of elements) el.style.backgroundColor = finalColor;
  await delay(400);
  for (const el of elements) el.style.backgroundColor = normal;
}

async function visualizeMerge(steps) {
  const elements = getArrayElements();
  setStatus("Starting Merge Sort...");

  let stepNum = 1;
  const total = steps.length;

  for (const step of steps) {
    if (step.type === "split") {
      setStatus(`Step ${stepNum++}/${total}: Splitting subarray...`);
      const { start, mid, end } = step;
      for (let i = start; i < mid; i++)
        elements[i].style.backgroundColor = mergeLeft;
      for (let i = mid; i < end; i++)
        elements[i].style.backgroundColor = mergeRight;
      await delay(animationSpeed * 1.3);
      for (let i = start; i < end; i++)
        elements[i].style.backgroundColor = normal;
    }

    if (step.type === "compare") {
      setStatus(
        `Step ${stepNum++}/${total}: Comparing index ${step.i} and ${step.j}`
      );
      const el1 = elements[step.i];
      const el2 = elements[step.j];
      el1.style.backgroundColor = highlight;
      el2.style.backgroundColor = highlight;
      await delay(animationSpeed);
      el1.style.backgroundColor = normal;
      el2.style.backgroundColor = normal;
    }

    if (step.type === "overwrite") {
      setStatus(
        `Step ${stepNum++}/${total}: Merging value ${
          step.value
        } into position ${step.index}`
      );
      const el = elements[step.index];
      el.textContent = step.value;
      el.dataset.value = step.value;
      el.style.height = step.value * 2 + "px";
      el.style.backgroundColor = mergeWrite;
      await delay(animationSpeed * 0.9);
      el.style.backgroundColor = normal;
    }
  }

  setStatus("Merge Sort complete!");
  for (const el of elements) el.style.backgroundColor = finalColor;
  await delay(400);
  for (const el of elements) el.style.backgroundColor = normal;
}

async function visualizeQuick(steps) {
  const elements = getArrayElements();
  setStatus("Starting Quick Sort...");

  let stepNum = 1;
  const total = steps.length;

  for (const step of steps) {
    if (step.type === "pivot") {
      setStatus(
        `Step ${stepNum++}/${total}: Selecting pivot at index ${step.index}`
      );
      elements[step.index].style.backgroundColor = pivotColor;
      await delay(animationSpeed * 1.2);
    }

    if (step.type === "compare") {
      setStatus(
        `Step ${stepNum++}/${total}: Comparing index ${step.i} with pivot`
      );
      const el = elements[step.i];
      const pivotEl = elements[step.pivot_index];
      el.style.backgroundColor = highlight;
      pivotEl.style.backgroundColor = pivotColor;
      await delay(animationSpeed);
      el.style.backgroundColor = normal;
    }

    if (step.type === "swap") {
      setStatus(
        `Step ${stepNum++}/${total}: Swapping index ${step.i} ↔ ${step.j}`
      );
      const el1 = elements[step.i];
      const el2 = elements[step.j];

      const tempVal = el1.dataset.value;
      el1.dataset.value = el2.dataset.value;
      el2.dataset.value = tempVal;

      const tempText = el1.textContent;
      el1.textContent = el2.textContent;
      el2.textContent = tempText;

      const tempHeight = el1.style.height;
      el1.style.height = el2.style.height;
      el2.style.height = tempHeight;

      el1.style.backgroundColor = highlight;
      el2.style.backgroundColor = highlight;
      await delay(animationSpeed * 0.9);
      el1.style.backgroundColor = normal;
      el2.style.backgroundColor = normal;
    }

    if (step.type === "done") {
      setStatus(
        `Step ${stepNum++}/${total}: Pivot placed at index ${step.index}`
      );
      elements[step.index].style.backgroundColor = keyColor;
      await delay(animationSpeed);
    }
  }

  setStatus("Quick Sort complete!");
  for (const el of elements) el.style.backgroundColor = finalColor;
  await delay(400);
  for (const el of elements) el.style.backgroundColor = normal;
}

// ---------- Custom Array Input & File Upload ----------

// Parse and validate comma-separated input into a number array
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

// Replace the bar elements with a new array of values (sorting UI)
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

// ---- Manual input handler ----
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

    // branch by mode
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
    if (e.key === "Enter") {
      applyBtn.click();
    }
  });
}

// ---- File upload handler ----
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
