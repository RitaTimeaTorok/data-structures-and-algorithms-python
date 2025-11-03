let selectedAlgorithm = "bubble";
let animationSpeed = 300; // ms

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
const keyColor = "#a0b3ff";
const mergeLeft = "#99baff";
const mergeRight = "#7189ff";
const mergeWrite = "#8db1ff";
const finalColor = "#7fa6ff";
const pivotColor = "#00a3c4ff";

// -------- setup ----------
document.addEventListener("DOMContentLoaded", () => {
  // Set initial bar heights from data-value
  getArrayElements().forEach((el) => {
    const val = parseInt(el.dataset.value, 10);
    el.style.height = val * 2 + "px";
  });

  // Algorithm selector buttons
  const algoButtons = document.querySelectorAll(".algo-btn");
  algoButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedAlgorithm = btn.dataset.algo;
      algoButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      setStatus(`Selected: ${btn.textContent}`);
    });
  });

  // Mark Bubble as active on initial load
  const defaultBtn = document.querySelector('.algo-btn[data-algo="bubble"]');
  if (defaultBtn) defaultBtn.classList.add("active");

  // Start visualization
  document
    .getElementById("start-btn")
    .addEventListener("click", startVisualization);
});

// ---------- visualization control ----------
async function startVisualization() {
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
    console.log(`${selectedAlgorithm} trace:`, data.steps);

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

// ---------- Bubble Sort ----------
async function visualizeBubble(steps) {
  const elements = getArrayElements();
  setStatus("Starting Bubble Sort...");

  let stepNum = 1;
  const total = steps.length;

  for (const { i, j, swap } of steps) {
    setStatus(
      `Step ${stepNum++}/${total}: Comparing index ${i} (${
        elements[i].textContent
      }) ` +
        `and ${j} (${elements[j].textContent})${
          swap ? " → swapping" : " → no swap"
        }`
    );

    const el1 = elements[i];
    const el2 = elements[j];

    el1.style.backgroundColor = highlight;
    el2.style.backgroundColor = highlight;
    await delay(animationSpeed);

    if (swap) {
      // swap dataset values
      const tempVal = el1.dataset.value;
      el1.dataset.value = el2.dataset.value;
      el2.dataset.value = tempVal;

      // swap text and height
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

// ---------- Insertion Sort ----------
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
      el.style.backgroundColor = highlight;
      await delay(animationSpeed);
      el.style.backgroundColor = normal;
    }
  }

  setStatus("Insertion Sort complete!");
  for (const el of elements) el.style.backgroundColor = finalColor;
  await delay(400);
  for (const el of elements) el.style.backgroundColor = normal;
}

// ---------- Merge Sort ----------
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

// ---------- Quick Sort ----------
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

      // swap dataset values
      const tempVal = el1.dataset.value;
      el1.dataset.value = el2.dataset.value;
      el2.dataset.value = tempVal;

      // swap text & height
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
      elements[step.index].style.backgroundColor = keyColor; // violet for finalized pivot
      await delay(animationSpeed);
    }
  }

  setStatus("Quick Sort complete!");
  for (const el of elements) el.style.backgroundColor = finalColor;
  await delay(400);
  for (const el of elements) el.style.backgroundColor = normal;
}

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

// Replace the bar elements with a new array of values
function renderArray(values) {
  const display = document.querySelector(".array-display");
  if (!display) return;

  // Build new children: one div per value
  const frag = document.createDocumentFragment();
  values.forEach((val) => {
    const el = document.createElement("div");
    el.className = "array-element";
    el.dataset.value = String(val);
    el.textContent = String(val);
    el.style.height = val * 2 + "px"; // keep your 2x scale factor
    frag.appendChild(el);
  });

  // Clear and append
  display.innerHTML = "";
  display.appendChild(frag);

  // Optional: reset status text
  setStatus("Array updated. Pick an algorithm and press Start Visualization.");
}

// Handle custom array submission
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

    // Clear error, render new bars
    errorEl.textContent = "";
    renderArray(value);
  });

  // Enter key submits as well
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

      // success: re-render bars
      renderArray(data.array);
      setStatus(data.message || "File uploaded successfully!");
      fileError.style.color = "#8fff8f"; // green success text
      fileError.textContent = data.message || "Upload successful!";

      // clear file input
      fileInput.value = "";
    } catch (err) {
      fileError.style.color = "#ff8f8f";
      fileError.textContent = err.message;
      setStatus("Error: " + err.message);
    }
  });
}
