# Sorting Algorithm Visualizer

An interactive, animated visualization tool for learning and exploring common sorting algorithms. Watch algorithms in action with real-time statistics, adjustable speed, and multiple input configurations.

## ✨ Features

- **6 Sorting Algorithms**: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, Heap Sort
- **Real-time Statistics**: Track comparisons, swaps, and array accesses as algorithms run
- **Adjustable Speed**: Control animation speed from "Slowest" to "Max" (1–10 levels)
- **Multiple Array Types**: Random, Nearly Sorted, Reversed, Few Unique Values
- **Configurable Array Size**: 10–200 elements
- **Pause/Resume**: Pause the sort mid-animation and resume at any time
- **Visual Highlighting**: Color-coded states for comparing, swapping, pivoting, and sorted elements
- **Algorithm Details**: Complexity analysis (best, average, worst case) and stability info for each algorithm
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

1. **Open** `index.html` in any modern web browser
2. **Select** an algorithm from the tabs at the top
3. **Click "Sort"** to start the visualization
4. **Adjust** speed and array size using the sliders
5. **Try** different array types (Random, Reversed, etc.)

No installation, build step, or dependencies required!

## 📊 Algorithms Included

### Bubble Sort
- **Complexity**: O(n²) average & worst case, O(n) best case
- **Space**: O(1) in-place
- **Stable**: Yes
- Simple comparison-based algorithm; each pass bubbles the largest unsorted element to the end

### Selection Sort
- **Complexity**: O(n²) all cases
- **Space**: O(1) in-place
- **Stable**: No
- Finds minimum in unsorted portion and moves it to sorted portion each pass

### Insertion Sort
- **Complexity**: O(n) best case, O(n²) average & worst case
- **Space**: O(1) in-place
- **Stable**: Yes
- Excellent for small arrays and nearly-sorted data; used in hybrid sorts like Timsort

### Merge Sort
- **Complexity**: O(n log n) all cases
- **Space**: O(n) auxiliary
- **Stable**: Yes
- Divide-and-conquer algorithm; guarantees consistent performance

### Quick Sort
- **Complexity**: O(n log n) average case, O(n²) worst case
- **Space**: O(log n) recursive stack
- **Stable**: No
- One of the fastest in-place sorts in practice; excellent cache locality

### Heap Sort
- **Complexity**: O(n log n) all cases
- **Space**: O(1) in-place
- **Stable**: No
- Guaranteed O(n log n) performance; builds max-heap and repeatedly extracts maximum

## 🎮 Controls

| Control | Purpose |
|---------|---------|
| **Algorithm Tabs** | Select which sorting algorithm to visualize |
| **Array Size Slider** | Set array size (10–200 elements) |
| **Speed Slider** | Adjust animation speed (1–10) |
| **Array Type Dropdown** | Choose input pattern (Random, Nearly Sorted, Reversed, Few Unique) |
| **New Array** | Generate a fresh random array without sorting |
| **Sort** | Start the sorting visualization |
| **Pause** | Pause/resume the running animation |
| **Reset** | Stop current sort and return to ready state |

## 🎨 Visual Guide

- **Blue**: Default bars
- **Red**: Actively comparing elements
- **Yellow**: Elements being swapped
- **Orange**: Elements being overwritten (during merge/insertion)
- **Purple**: Pivot element (Quick Sort)
- **Cyan**: Active/processing element
- **Green**: Sorted elements

## 📈 Statistics

Real-time counters track:
- **Comparisons**: How many times two elements are compared
- **Swaps**: How many times elements exchange positions
- **Array Accesses**: Total reads and writes to array (memory operations)

These help you understand the relative efficiency of each algorithm.

## 💻 Technical Details

- **Pure JavaScript**: No frameworks or libraries required
- **Vanilla DOM**: Direct manipulation for maximum performance
- **CSS Variables**: Easy theming and maintenance
- **Generator Functions**: Clean separation of sorting logic from animation
- **Responsive Grid Layout**: Adapts to desktop and mobile screens

## 🔧 Project Structure

```
interactive-sort-algorithms/
├── index.html      # Main HTML structure
├── style.css       # Styling and layout
├── script.js       # Sorting algorithms and visualization logic
└── README.md       # This file
```

## 🌐 Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript (generators, arrow functions)
- CSS Grid & Flexbox
- HTML5 Canvas (for visualization)

Tested on:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📚 Educational Use

Perfect for learning:
- How different sorting algorithms work
- Comparing algorithm efficiency
- Understanding time complexity in action
- Observing best/worst case behavior

Try these experiments:
1. Sort a "Reversed" array with Bubble Sort vs Quick Sort
2. Compare "Nearly Sorted" performance across algorithms
3. Watch Insertion Sort vs Merge Sort on random data
4. Analyze stat differences at maximum speed

## 🤝 Contributing

Feel free to fork, modify, and extend! Ideas for additions:
- More sorting algorithms (Shell Sort, Counting Sort, Radix Sort)
- Sorting algorithm comparisons side-by-side
- Sound effects for comparisons/swaps
- Export statistics as CSV
- Dark mode toggle

## 📄 License

This project is open source and available for educational and personal use.

---

Enjoy exploring sorting algorithms! 🎓
