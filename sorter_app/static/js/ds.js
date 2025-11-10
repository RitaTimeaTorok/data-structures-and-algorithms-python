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

function createNodeWrap(node, isHead = false) {
  const wrap = document.createElement("div");
  wrap.className = "ds-node-wrap";
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.alignItems = "center";
  wrap.style.position = "relative";

  if (isHead) {
    const badge = document.createElement("div");
    badge.textContent = "HEAD";
    badge.className = "ds-head-badge";
    badge.style.position = "absolute";
    badge.style.top = "-18px";
    badge.style.fontSize = "10px";
    badge.style.fontWeight = "800";
    badge.style.letterSpacing = "0.3px";
    badge.style.color = "#e6e8f0";
    badge.style.opacity = "0.9";
    wrap.appendChild(badge);
  }

  wrap.appendChild(node);
  return wrap;
}

function getLinkedRow() {
  return document.querySelector("#ds-canvas .ds-linked-list");
}
function getLinkedWraps() {
  const row = getLinkedRow();
  if (!row) return [];
  return Array.from(row.querySelectorAll(".ds-node-wrap"));
}

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
    const wrap = createNodeWrap(node, isHead);
    row.appendChild(wrap);
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
// DS: LINKED LIST ANIMATION (steps from backend)
// Supported steps: insert {index, value}, delete {index, value}, noop
// ==============================

async function visualizeLinkedSteps(steps, finalState) {
  if (!getLinkedRow()) renderLinkedList(linkedState);

  for (const step of steps) {
    if (step.type === "insert") {
      const row = getLinkedRow();
      if (!row) continue;

      // build new node wrap
      const isHead = step.index === 0;
      const node = createDSNode(step.value, isHead);
      const wrap = createNodeWrap(node, isHead);
      wrap.style.transform = "scale(0.85)";
      wrap.style.opacity = "0.0";

      // compute insertion point in DOM:
      // row children are alternating: [wrap, link, wrap, link, ...]
      // index k => position = k*2
      const insertPos = Math.max(0, step.index * 2);
      const children = Array.from(row.children);

      if (insertPos < children.length) {
        row.insertBefore(wrap, children[insertPos]);
        row.insertBefore(createLink(), children[insertPos + 1] || null);
      } else {
        // append to end: if last child is a link, ensure we place correctly
        const lastIsLink =
          children.length &&
          children[children.length - 1].classList.contains("ds-link");
        if (children.length && !lastIsLink) row.appendChild(createLink());
        row.appendChild(wrap);
      }

      // entrance animation
      await delay(10);
      wrap.style.opacity = "1.0";
      wrap.style.transform = "scale(1)";
      node.style.backgroundColor = mergeWrite;
      await delay(animationSpeed * 0.9);
      node.style.backgroundColor = isHead ? keyColor : normal;

      // refresh head highlight if head changed
      refreshLinkedHeadStyles();
    }

    if (step.type === "delete") {
      const row = getLinkedRow();
      if (!row) continue;
      const wraps = getLinkedWraps();
      const idx = Math.min(Math.max(0, step.index), wraps.length - 1);
      const victim = wraps[idx];
      if (victim) {
        const node = victim.querySelector(".ds-node");
        if (node) node.style.backgroundColor = highlight;
        await delay(animationSpeed * 0.5);

        // remove neighbor arrow to the RIGHT if present, otherwise to the LEFT
        const nextSibling = victim.nextElementSibling;
        if (nextSibling && nextSibling.classList.contains("ds-link")) {
          nextSibling.remove();
        } else {
          const prevSibling = victim.previousElementSibling;
          if (prevSibling && prevSibling.classList.contains("ds-link")) {
            prevSibling.remove();
          }
        }

        victim.style.opacity = "0.0";
        victim.style.transform = "translateY(-10px) scale(0.95)";
        await delay(animationSpeed * 0.6);
        victim.remove();
      }
      refreshLinkedHeadStyles();
    }

    if (step.type === "noop") {
      setStatus("Linked List is empty — nothing to delete.");
      await delay(animationSpeed * 0.7);
    }
  }

  // snap to backend-authoritative state to avoid drift
  renderLinkedList(finalState);
}

function refreshLinkedHeadStyles() {
  const wraps = getLinkedWraps();
  wraps.forEach((wrap, i) => {
    const node = wrap.querySelector(".ds-node");
    const badge = wrap.querySelector(".ds-head-badge");
    if (!node) return;

    if (i === 0) {
      node.style.background = keyColor;
      if (badge) badge.style.display = "block";
    } else {
      node.style.background = normal;
      if (badge) badge.style.display = "none";
    }
  });
}
