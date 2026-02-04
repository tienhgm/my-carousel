# Interactive Carousel / Slider Component

A custom, performant carousel component built with React.  
Supports mouse drag, touch swipe, autoplay, infinite looping, and edge-case handling for real-world usage.

---

## 1. Installation & Running Locally

### Prerequisites

- Node.js >= 20
- npm or yarn

### Install dependencies

```bash
npm install
# or
yarn install

```

### Run the project locally

```bash
npm run dev
# or
yarn dev

# The application will be available at:
http://localhost:5173

```

## 2. High-Level Project Structure

```
MY-CAROUSEL/
├── public/                     # Static public assets
├── src/
│   ├── assets/                 # Shared static assets
│   ├── features/               # Feature-based modules
│   │   └── <feature-name>/
│   │       ├── data/           # Constants and static data
│   │       ├── hooks/          # Custom React hooks (business & interaction logic)
│   │       ├── models/         # TypeScript models and interfaces
│   │       └── presentation/   # UI and state management layer
│   │           ├── components/ # Reusable UI components
│   │           └── screen/     # Feature-level screens / containers
│   │
│   ├── App.tsx                 # Root application component
│   └── main.tsx                # Application entry point
│
├── index.html                  # HTML entry template
├── package.json                # Project configuration and scripts
├── tsconfig*.json              # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── eslint.config.js            # ESLint configuration
└── README.md                   # Project documentation

```

### Architectural Overview

The project uses a **feature-based architecture** with clear separation of concerns:

#### `data`

Holds static data and configuration constants used by the feature.

#### `hooks`

Encapsulates reusable logic and complex interactions (e.g. drag, swipe, autoplay).

#### `models`

Defines strict TypeScript contracts for feature data.

#### `presentation`

Responsible for rendering and feature-level state orchestration:

- **components**: reusable UI building blocks
- **screen**: composed feature views
- **store**: feature-scoped state management

This structure ensures:

- High cohesion within each feature
- Low coupling between features
- Easy scalability and maintainability

## 3. Drag (Mouse) and Swipe (Touch) Interaction

- Drag and swipe interactions are implemented using a shared logic flow for both mouse and touch events.
- The carousel tracks pointer start, movement, and release to update the slide position using **`transform: translateX(...)`** for smooth, animations.
- A movement threshold is applied to distinguish between clicks and drag gestures, ensuring reliable user interaction across input types.

## 4. Configurable Design via Props

Instead of hard-coding carousel behavior based on fixed assumptions from the problem statement, the component is designed to be fully configurable via props. This allows the carousel to adapt to different layouts, screen sizes, and usage scenarios without modifying internal logic.

### Supported Configuration Props

- **`perView`**: Controls how many slides are visible within the viewport at once (supports fractional values such as 2.5)
- **`size`**: Defines the fixed width (and height) of each carousel card
- **`playTime`**: Configures the autoplay interval duration in milliseconds
- **`buffer`**: Determines how many virtual slides are rendered before and after the current index

### Rationale

By exposing these values as props rather than fixing them according to the original problem constraints:

- The carousel becomes reusable across multiple contexts
- Behavioral changes do not require code refactoring
- This approach prioritizes flexibility, maintainability, and real-world applicability over a single rigid configuration.

## 5. How edge cases are handled

### Infinite Loop Behavior

The carousel supports infinite looping without duplicating the entire data set

- Only a limited set of virtual slides is rendered around the **`currentIndex`**, determined by **`buffer`** and **`perView`**
- Each virtual slide is mapped back to the original data array using modulo arithmetic:

```bash
const dataIdx = ((i % slideCount) + slideCount) % slideCount;
```

This approach ensures:

- Safe access for negative and overflow indices
- Seamless looping in both directions
- Improved performance compared to cloning the full slide list

### Preventing Concurrent Animations

To avoid race conditions caused by overlapping interactions (e.g. rapid clicks, autoplay, or drag events):

- A mutable ref **`isAnimatingRef`** is used to lock interactions while a slide transition is in progress.
- The following actions are blocked while animation is active:
  - Navigation button clicks
  - Autoplay transitions
  - Drag start events
    The animation lock is released when:
- The CSS **`transitionend`** event fires
- Or **`resetMoved()`** is explicitly called

### Preventing Clicks While Dragging

To prevent unintended click events on carousel items during drag gestures:

- Drag movement is tracked using **`hasMoved`**
- Once the drag distance exceeds a small threshold (5px), the interaction is considered a drag
- Child components (e.g. **`CarouselCard`**) can check **`hasMovedRef`** to suppress click handlers
  This ensures:
- Clean separation between click and drag interactions
- No accidental item activation during swipe gestures

### Snap-to-Slide on Drag End

When a drag interaction ends:

- The current transform position is read from the container using **`DOMMatrix`**
- The closest slide index is calculated based on the slide width:

```bash
const closestIndex = Math.round(-currentActualX / size);

```

Behavior:

- If the drag distance exceeds **`MIN_DRAG_DISTANCE`**, the carousel advances in the drag direction
- Otherwise, it snaps back to the current slide
  This guarantees consistent alignment and predictable movement.

### Autoplay Pause on User Interaction

Autoplay is automatically paused under the following conditions:

- The user hovers over the carousel viewport
- A drag gesture is in progress
- A slide transition animation is currently running

```bash
if (isPaused.current || isDragging.current || isAnimatingRef.current) return;
```

Autoplay resumes once all blocking conditions are cleared, preventing conflicts between automated transitions and user interactions.

### Mouse and Touch Input Support

The carousel fully supports both mouse and touch interactions:

- Desktop drag via mouse events
- Mobile swipe via touch events
  Both input types share the same interaction logic by normalizing input through **`clientX`**, ensuring consistent behavior across devices.
