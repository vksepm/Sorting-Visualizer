// =====================
// State
// =====================
let array       = [];
let highlights  = {};   // index -> css class name
let sortedSet   = new Set();
let sorting     = false;
let paused      = false;
let speedLevel  = 5;    // 1–10

let stats = { comparisons: 0, swaps: 0, accesses: 0 };

// =====================
// Delay
// =====================
const DELAYS = [0, 320, 160, 80, 40, 18, 8, 4, 2, 1, 0];
function getDelay() { return DELAYS[speedLevel]; }
function sleep(ms)  { return new Promise(r => setTimeout(r, ms)); }

// =====================
// Array Generation
// =====================
function generateArray() {
  const n    = parseInt(document.getElementById('size-slider').value);
  const type = document.getElementById('array-type').value;

  array = Array.from({ length: n }, (_, i) => {
    switch (type) {
      case 'nearly-sorted': {
        const base = Math.round(((i + 1) / n) * 290) + 10;
        return Math.max(10, Math.min(300, base + Math.floor(Math.random() * 24) - 12));
      }
      case 'reversed':
        return Math.round(((n - i) / n) * 290) + 10;
      case 'few-unique':
        return [30, 80, 140, 200, 270][Math.floor(Math.random() * 5)];
      default:
        return Math.floor(Math.random() * 290) + 10;
    }
  });

  highlights = {};
  sortedSet  = new Set();
  resetStats();
  render();
}

// =====================
// Rendering
// =====================
function render() {
  const container = document.getElementById('visualization');
  const n         = array.length;

  // Rebuild DOM if size changed
  if (container.children.length !== n) {
    container.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      container.appendChild(bar);
    }
  }

  const maxVal = Math.max(...array);
  const bars   = container.querySelectorAll('.bar');

  bars.forEach((bar, i) => {
    bar.style.height = `${(array[i] / maxVal) * 100}%`;
    bar.className = 'bar';
    if (sortedSet.has(i)) {
      bar.classList.add('sorted');
    } else if (highlights[i]) {
      bar.classList.add(highlights[i]);
    }
  });
}

// =====================
// Stats
// =====================
function resetStats() {
  stats = { comparisons: 0, swaps: 0, accesses: 0 };
  updateStatsDisplay();
  setStatus('Ready');
}

function updateStatsDisplay() {
  document.getElementById('comparisons').textContent = stats.comparisons.toLocaleString();
  document.getElementById('swaps').textContent       = stats.swaps.toLocaleString();
  document.getElementById('accesses').textContent    = stats.accesses.toLocaleString();
}

function setStatus(text) {
  document.getElementById('status-text').textContent = text;
}

// =====================
// UI State Helpers
// =====================
function setControlsEnabled(sorting) {
  document.getElementById('sort-btn').disabled     = sorting;
  document.getElementById('generate-btn').disabled = sorting;
  document.getElementById('size-slider').disabled  = sorting;
  document.getElementById('array-type').disabled   = sorting;
  document.getElementById('pause-btn').disabled    = !sorting;
  document.querySelectorAll('.tab').forEach(t => t.disabled = sorting);
}

// =====================
// Apply one generator step
// =====================
function applyStep(step) {
  highlights = {};

  switch (step.type) {
    case 'compare':
      step.indices.forEach(i => { highlights[i] = 'compare'; });
      stats.comparisons++;
      stats.accesses += 2;
      break;
    case 'swap':
      step.indices.forEach(i => { highlights[i] = 'swap'; });
      stats.swaps++;
      stats.accesses += 4;
      break;
    case 'overwrite':
      step.indices.forEach(i => { highlights[i] = 'overwrite'; });
      stats.accesses++;
      break;
    case 'pivot':
      step.indices.forEach(i => { highlights[i] = 'pivot'; });
      break;
    case 'active':
      step.indices.forEach(i => { highlights[i] = 'active'; });
      break;
    case 'sorted':
      step.indices.forEach(i => sortedSet.add(i));
      break;
  }
}

// =====================
// Main Sort Runner
// =====================
async function runSort() {
  if (sorting) return;

  const algo = document.querySelector('.tab.active').dataset.algo;

  sorting = true;
  paused  = false;
  sortedSet = new Set();
  highlights = {};
  resetStats();
  setStatus('Sorting…');
  setControlsEnabled(true);

  const generators = {
    bubble:    () => bubbleSort(),
    selection: () => selectionSort(),
    insertion: () => insertionSort(),
    merge:     () => mergeSort(0, array.length),
    quick:     () => quickSort(0, array.length - 1),
    heap:      () => heapSort(),
  };

  const gen = generators[algo]();
  let result = gen.next();

  while (!result.done && sorting) {
    while (paused && sorting) await sleep(50);
    if (!sorting) break;

    applyStep(result.value);
    render();
    updateStatsDisplay();

    await sleep(getDelay());
    result = gen.next();
  }

  if (sorting) {
    // Natural completion — sweep-in "sorted" animation
    highlights = {};
    setStatus('Done!');
    await sweepSorted();
  }

  sorting = false;
  paused  = false;
  setControlsEnabled(false);
  document.getElementById('pause-btn').textContent = 'Pause';
}

async function sweepSorted() {
  const delay = Math.max(1, Math.min(4, Math.round(600 / array.length)));
  for (let i = 0; i < array.length; i++) {
    sortedSet.add(i);
    render();
    await sleep(delay);
  }
}

// =====================
// BUBBLE SORT
// =====================
function* bubbleSort() {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield { type: 'compare', indices: [j, j + 1] };
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        yield { type: 'swap', indices: [j, j + 1] };
        swapped = true;
      }
    }
    yield { type: 'sorted', indices: [n - 1 - i] };
    if (!swapped) {
      for (let k = 0; k < n - 1 - i; k++) sortedSet.add(k);
      break;
    }
  }
  sortedSet.add(0);
}

// =====================
// SELECTION SORT
// =====================
function* selectionSort() {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    yield { type: 'active', indices: [i] };
    for (let j = i + 1; j < n; j++) {
      yield { type: 'compare', indices: [j, minIdx] };
      if (array[j] < array[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      yield { type: 'swap', indices: [i, minIdx] };
    }
    yield { type: 'sorted', indices: [i] };
  }
  sortedSet.add(n - 1);
}

// =====================
// INSERTION SORT
// =====================
function* insertionSort() {
  const n = array.length;
  sortedSet.add(0);

  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;
    yield { type: 'active', indices: [i] };

    while (j >= 0) {
      yield { type: 'compare', indices: [j, j + 1] };
      if (array[j] > key) {
        array[j + 1] = array[j];
        yield { type: 'overwrite', indices: [j + 1] };
        j--;
      } else {
        break;
      }
    }
    array[j + 1] = key;
    yield { type: 'overwrite', indices: [j + 1] };

    for (let k = 0; k <= i; k++) sortedSet.add(k);
    yield { type: 'sorted', indices: [] };
  }
}

// =====================
// MERGE SORT
// =====================
function* mergeSort(left, right) {
  if (right - left <= 1) return;
  const mid = Math.floor((left + right) / 2);
  yield* mergeSort(left, mid);
  yield* mergeSort(mid, right);
  yield* mergeParts(left, mid, right);
  for (let i = left; i < right; i++) sortedSet.add(i);
  yield { type: 'sorted', indices: [] };
}

function* mergeParts(left, mid, right) {
  const L = array.slice(left, mid);
  const R = array.slice(mid, right);
  let i = 0, j = 0, k = left;

  while (i < L.length && j < R.length) {
    yield { type: 'compare', indices: [left + i, mid + j] };
    if (L[i] <= R[j]) { array[k] = L[i++]; }
    else              { array[k] = R[j++]; }
    yield { type: 'overwrite', indices: [k] };
    k++;
  }
  while (i < L.length) { array[k] = L[i++]; yield { type: 'overwrite', indices: [k++] }; }
  while (j < R.length) { array[k] = R[j++]; yield { type: 'overwrite', indices: [k++] }; }
}

// =====================
// QUICK SORT
// =====================
function* quickSort(low, high) {
  if (low >= high) return;
  const pivotIdx = yield* partition(low, high);
  yield { type: 'sorted', indices: [pivotIdx] };
  yield* quickSort(low, pivotIdx - 1);
  yield* quickSort(pivotIdx + 1, high);
}

function* partition(low, high) {
  yield { type: 'pivot', indices: [high] };
  let i = low - 1;

  for (let j = low; j < high; j++) {
    yield { type: 'compare', indices: [j, high] };
    if (array[j] <= array[high]) {
      i++;
      if (i !== j) {
        [array[i], array[j]] = [array[j], array[i]];
        yield { type: 'swap', indices: [i, j] };
      }
    }
  }
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  yield { type: 'swap', indices: [i + 1, high] };
  return i + 1;
}

// =====================
// HEAP SORT
// =====================
function* heapSort() {
  const n = array.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) yield* heapify(n, i);
  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    yield { type: 'swap',   indices: [0, i] };
    yield { type: 'sorted', indices: [i] };
    yield* heapify(i, 0);
  }
  sortedSet.add(0);
}

function* heapify(n, i) {
  let largest = i;
  const l = 2 * i + 1, r = 2 * i + 2;
  if (l < n) { yield { type: 'compare', indices: [l, largest] }; if (array[l] > array[largest]) largest = l; }
  if (r < n) { yield { type: 'compare', indices: [r, largest] }; if (array[r] > array[largest]) largest = r; }
  if (largest !== i) {
    [array[i], array[largest]] = [array[largest], array[i]];
    yield { type: 'swap', indices: [i, largest] };
    yield* heapify(n, largest);
  }
}

// =====================
// Algorithm Info Data
// =====================
const ALGO_INFO = {
  bubble: {
    name: 'Bubble Sort',
    desc: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass is repeated until no swaps are needed. Includes an early-termination optimisation for nearly-sorted data.',
    best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true,
  },
  selection: {
    name: 'Selection Sort',
    desc: 'Divides the list into a sorted and an unsorted region. Repeatedly scans the unsorted region to find the minimum element, then swaps it into place. Always performs O(n²) comparisons regardless of input order.',
    best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: false,
  },
  insertion: {
    name: 'Insertion Sort',
    desc: 'Builds the sorted array one element at a time by inserting each new element into its correct position within the already-sorted prefix. Excellent performance on small or nearly-sorted inputs and is the algorithm of choice for short runs in hybrid sorts.',
    best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true,
  },
  merge: {
    name: 'Merge Sort',
    desc: 'A divide-and-conquer algorithm that recursively splits the array in half, sorts each half, and merges them back in order. Delivers consistent O(n log n) performance and is stable, but requires O(n) auxiliary space.',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true,
  },
  quick: {
    name: 'Quick Sort',
    desc: 'Selects a pivot element, partitions the array so smaller elements come before it and larger after it, then recursively sorts the two partitions. One of the fastest algorithms in practice due to excellent cache performance, though worst-case is O(n²) with a bad pivot.',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: false,
  },
  heap: {
    name: 'Heap Sort',
    desc: 'First transforms the array into a max-heap, then repeatedly extracts the maximum element and rebuilds the heap. Guarantees O(n log n) in all cases and sorts in-place, but has poor cache locality compared to Quick Sort.',
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: false,
  },
};

function updateAlgoInfo(algo) {
  const d = ALGO_INFO[algo];
  document.getElementById('algo-info').innerHTML = `
    <h3>${d.name}</h3>
    <p>${d.desc}</p>
    <div class="complexity-grid">
      <div class="complexity-item">
        <span class="complexity-label">Best Case</span>
        <span class="complexity-value">${d.best}</span>
      </div>
      <div class="complexity-item">
        <span class="complexity-label">Average Case</span>
        <span class="complexity-value">${d.avg}</span>
      </div>
      <div class="complexity-item">
        <span class="complexity-label">Worst Case</span>
        <span class="complexity-value">${d.worst}</span>
      </div>
      <div class="complexity-item">
        <span class="complexity-label">Space</span>
        <span class="complexity-value">${d.space}</span>
      </div>
      <div class="complexity-item">
        <span class="complexity-label">Stable</span>
        <span class="complexity-value">
          <span class="badge ${d.stable ? 'badge-green' : 'badge-red'}">${d.stable ? 'Yes' : 'No'}</span>
        </span>
      </div>
    </div>
  `;
}

// =====================
// Event Listeners
// =====================
document.addEventListener('DOMContentLoaded', () => {
  generateArray();
  updateAlgoInfo('bubble');

  // Algorithm tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (sorting) return;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateAlgoInfo(tab.dataset.algo);
    });
  });

  // Size slider
  const sizeSlider = document.getElementById('size-slider');
  sizeSlider.addEventListener('input', () => {
    document.getElementById('size-value').textContent = sizeSlider.value;
    if (!sorting) generateArray();
  });

  // Speed slider
  const speedSlider = document.getElementById('speed-slider');
  const speedLabels = ['','Slowest','Very Slow','Slow','Slow+','Medium','Fast','Fast+','Very Fast','Very Fast+','Max'];
  speedSlider.addEventListener('input', () => {
    speedLevel = parseInt(speedSlider.value);
    document.getElementById('speed-value').textContent = speedLabels[speedLevel];
  });

  // Array type
  document.getElementById('array-type').addEventListener('change', () => {
    if (!sorting) generateArray();
  });

  // Buttons
  document.getElementById('generate-btn').addEventListener('click', () => {
    if (!sorting) generateArray();
  });

  document.getElementById('sort-btn').addEventListener('click', runSort);

  document.getElementById('pause-btn').addEventListener('click', () => {
    if (!sorting) return;
    paused = !paused;
    document.getElementById('pause-btn').textContent = paused ? 'Resume' : 'Pause';
    setStatus(paused ? 'Paused' : 'Sorting…');
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    sorting = false;
    paused  = false;
    // Give the async loop time to exit
    setTimeout(() => {
      generateArray();
      setControlsEnabled(false);
      document.getElementById('pause-btn').textContent = 'Pause';
    }, 80);
  });
});
