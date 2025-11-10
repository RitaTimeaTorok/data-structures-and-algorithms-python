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

  const linkedControls = document.getElementById("linked-controls");
  const llInsertBtn = document.getElementById("ll-insert-btn");
  const llDeleteBtn = document.getElementById("ll-delete-btn");
  const llIndexInput = document.getElementById("ll-index");
  const llValueInput = document.getElementById("ll-value");

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

    if (dsControls) dsControls.classList.add("hidden"); // stack
    if (queueControls) queueControls.classList.add("hidden"); // queue
    if (linkedControls) linkedControls.classList.add("hidden"); // linked

    setStatus(`Sorting mode: ${name}`);
  }

  function showForDS(name) {
    currentMode = "ds";

    if (sortUI) sortUI.classList.add("hidden");
    if (customArrayPanel) customArrayPanel.classList.remove("hidden");
    if (fileUploadPanel) fileUploadPanel.classList.remove("hidden");
    if (dsCanvas) dsCanvas.classList.remove("hidden");

    if (dsControls)
      dsControls.classList.toggle("hidden", currentDS !== "stack");
    if (queueControls)
      queueControls.classList.toggle("hidden", currentDS !== "queue");
    if (linkedControls)
      linkedControls.classList.toggle("hidden", currentDS !== "linked-list");

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

  if (linkedControls) {
    if (currentDS === "linked-list") linkedControls.classList.remove("hidden");
    else linkedControls.classList.add("hidden");
  }

  // linked list: insert_at
  if (llInsertBtn) {
    llInsertBtn.addEventListener("click", async () => {
      if (currentMode !== "ds" || currentDS !== "linked-list") {
        setStatus("Switch to Linked List to use Insert.");
        return;
      }
      const idxRaw = (llIndexInput?.value ?? "").trim();
      const valRaw = (llValueInput?.value ?? "").trim();
      if (!idxRaw.length || !valRaw.length) {
        setStatus("Provide both index and value.");
        return;
      }
      const index = Number.isFinite(Number(idxRaw)) ? Number(idxRaw) : 0;
      const value = Number.isFinite(Number(valRaw)) ? Number(valRaw) : valRaw;

      try {
        setStatus("Inserting into linked list...");
        const res = await fetch("/ds/linked-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            state: linkedState,
            action: "insert_at",
            index,
            value,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Insert failed");
        await visualizeLinkedSteps(data.steps, data.new_state);
        linkedState = data.new_state.slice();
        setStatus("Insert complete.");
        if (llValueInput) llValueInput.value = "";
      } catch (err) {
        setStatus("Error: " + err.message);
        console.error(err);
      }
    });
  }

  // linked list: delete_at
  if (llDeleteBtn) {
    llDeleteBtn.addEventListener("click", async () => {
      if (currentMode !== "ds" || currentDS !== "linked-list") {
        setStatus("Switch to Linked List to use Delete.");
        return;
      }
      const idxRaw = (llIndexInput?.value ?? "").trim();
      if (!idxRaw.length) {
        setStatus("Provide an index to delete.");
        return;
      }
      const index = Number.isFinite(Number(idxRaw)) ? Number(idxRaw) : 0;

      try {
        setStatus("Deleting from linked list...");
        const res = await fetch("/ds/linked-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            state: linkedState,
            action: "delete_at",
            index,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Delete failed");
        await visualizeLinkedSteps(data.steps, data.new_state);
        linkedState = data.new_state.slice();
        setStatus("Delete complete.");
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
