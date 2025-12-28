# Framer Motion Animation Guide for DataWorld

Framer Motion has been integrated into DataWorld for smooth, performant animations that enhance the user experience. Here's a comprehensive guide with implemented patterns and suggested use cases.

## ✅ Currently Implemented

### 1. Scroll-Up Animations (Landing Page)
- **Component**: `AnimatedSection` wrapper in [Landing.tsx](../pages/Landing.tsx)
- **Pattern**: Fade-in + slide-up animation triggered when section enters viewport
- **Implementation**: Uses `useInView` hook with `once: true` to animate once
- **Usage**:
  ```tsx
  <AnimatedSection>
    <section>Your content</section>
  </AnimatedSection>
  ```

### 2. Hero Section Staggered Animations
- **Pattern**: Cascading animations with increasing delays
- **Elements**: Badge → Heading → Description → CTAs
- **Timing**: 100ms delay between each element
- **Effect**: Creates visual flow and guides user's eye

### 3. Interactive Button Animations
- **Component**: `AnimatedButton` in [components/AnimatedButton.tsx](../components/AnimatedButton.tsx)
- **Effects**: 
  - `whileHover`: Lifts button up 2px
  - `whileTap`: Scales down to 98% for tactile feedback
- **Variants**: Primary, Secondary, Outline
- **Sizes**: Small, Medium, Large

---

## 🎯 Additional Framer Motion Use Cases

### A. Page Transition Animations
**Suggested for**: Dashboard, Blog pages, User navigation

```tsx
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const Page = () => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3 }}
  >
    {/* Page content */}
  </motion.div>
);
```

### B. Stagger Container for Lists
**Suggested for**: Dashboard cards, Blog post lists, Dataset list

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export const CardList = ({ items }) => (
  <motion.div variants={containerVariants} initial="hidden" animate="show">
    {items.map(item => (
      <motion.div key={item.id} variants={itemVariants}>
        {/* Card content */}
      </motion.div>
    ))}
  </motion.div>
);
```

### C. Hover & Tap Effects for Interactive Elements
**Suggested for**: Navigation links, Dataset cards, Blog post cards

```tsx
<motion.a
  whileHover={{ 
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  }}
  whileTap={{ scale: 0.95 }}
  href="#"
>
  Hover me!
</motion.a>
```

### D. Animated Counters
**Suggested for**: Dashboard metrics, Statistics sections

```tsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const Counter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => (prev < target ? prev + 1 : target));
    }, 50);
    return () => clearInterval(interval);
  }, [target]);

  return <motion.span>{count}</motion.span>;
};
```

### E. Collapse/Expand Animations
**Suggested for**: FAQ sections, Dataset filters, Settings panels

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export const Collapsible = ({ title, children }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <motion.button onClick={() => setIsOpen(!isOpen)}>
        {title}
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

### F. Modal Animations
**Suggested for**: Dialogs, Confirmation modals, Upload modals

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
  className="fixed inset-0 flex items-center justify-center bg-black/50"
>
  <motion.div className="bg-white p-6 rounded-lg">
    {/* Modal content */}
  </motion.div>
</motion.div>
```

### G. Drag & Drop Animations
**Suggested for**: Dashboard widget rearrangement, File upload zones

```tsx
<motion.div
  drag
  dragElastic={0.2}
  whileDrag={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
  dragTransition={{ power: 0.3, elasticity: 0.2 }}
>
  Drag me!
</motion.div>
```

### H. Progress Bar Animation
**Suggested for**: Data uploads, Data processing, Query execution

```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: 0.5 }}
  className="h-1 bg-primary"
/>
```

### I. Scroll-Triggered Content
**Suggested for**: Parallax effects, Section reveals, Image animations

```tsx
import { useScroll, useTransform, motion } from 'framer-motion';

export const ScrollAnimation = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  return (
    <motion.div style={{ y }}>
      Parallax content
    </motion.div>
  );
};
```

### J. Tooltip Animations
**Suggested for**: Help icons, Info buttons, Dataset field descriptions

```tsx
<motion.div
  initial={{ opacity: 0, y: -5, pointerEvents: 'none' }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -5 }}
  transition={{ duration: 0.15 }}
  className="absolute bg-slate-900 text-white px-3 py-1 rounded text-sm"
>
  Helpful tooltip text
</motion.div>
```

---

## 🚀 Implementation Roadmap

### Phase 1 ✅ (Completed)
- [x] Install Framer Motion
- [x] Create AnimatedSection component
- [x] Add hero animations to Landing page
- [x] Create AnimatedButton component

### Phase 2 (Recommended Next)
- [ ] Add page transition animations to all routes
- [ ] Implement stagger animations for Dashboard cards
- [ ] Add hover effects to dataset/blog cards
- [ ] Create animated loading states

### Phase 3 (Enhanced UX)
- [ ] Implement collapse/expand animations for filters
- [ ] Add progress animations for data uploads
- [ ] Create modal animations for dialogs
- [ ] Add scroll-triggered animations to about sections

### Phase 4 (Advanced)
- [ ] Implement drag & drop for dashboard widgets
- [ ] Add parallax scrolling effects
- [ ] Create animated counters for statistics
- [ ] Add gesture animations for mobile

---

## 📊 Performance Considerations

1. **Use `once: true` in useInView**: Prevents repeated animations
2. **Limit animated elements**: Animate 3-5 elements per view, not dozens
3. **Use GPU-accelerated properties**: Prefer `opacity` and `transform` over `width`/`height`
4. **Disable on low-end devices**: Consider `prefers-reduced-motion` media query
5. **Test on mobile**: Ensure 60fps performance on lower-end devices

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  animate={prefersReducedMotion ? {} : animationVariants}
>
  Content
</motion.div>
```

---

## 🎨 Animation Best Practices

1. **Duration**: Keep animations under 500ms (aim for 250-400ms)
2. **Easing**: Use `easeOut` for entrance animations
3. **Delay**: Introduce delays to create visual hierarchy
4. **Consistency**: Use same animation patterns across similar elements
5. **Feedback**: Always provide visual feedback for user interactions
6. **Accessibility**: Respect `prefers-reduced-motion` setting
7. **Feedback loops**: Use animations to guide user attention

---

## 📚 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Library Examples](https://www.framer.com/motion/animation/)
- [useInView Hook](https://www.framer.com/motion/use-in-view/)
- [Gesture Animations](https://www.framer.com/motion/gestures/)

---

Generated: December 28, 2025
