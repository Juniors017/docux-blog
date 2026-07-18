# 📊 Skill Component - Complete Documentation

## 🎯 Overview

The `Skill` component allows displaying skills as **progress bars** or **animated circles** with scroll animations and complete customization.

## 🚀 Features

### ✨ Display Types

- **Horizontal bars** (`type="bar"`)
- **Progress circles** (`type="circle"`)

### 🎨 Customization

- **Automatic colors** based on percentage
- **Custom colors**
- **Gradients** (linear for bars, conic for circles)
- **Rounded borders** or sharp
- **Configurable sizes**

### 🎬 Animations

- **Scroll animation** with Intersection Observer
- **Smooth transitions** with cubic-bezier
- **Fade-in appearance** with vertical translation

### 🌙 Themes

- **Light/dark mode** automatic
- **Adaptive CSS variables**

## 📋 Available Props

| Prop                | Type    | Default | Description                      |
| ------------------- | ------- | ------- | -------------------------------- |
| `name`              | string  | -       | Skill name                       |
| `value`             | number  | 0       | Percentage (0-100)               |
| `type`              | string  | "bar"   | "bar" or "circle"                |
| `color`             | string  | auto    | Custom color                     |
| `gradient`          | object  | -       | `{from: "color1", to: "color2"}` |
| `rounded`           | boolean | true    | Rounded borders                  |
| `valuePosition`     | string  | "top"   | "top", "center", "around"        |
| `showPercentage`    | boolean | true    | Show %                           |
| `size`              | number  | 120     | Circle size (px)                 |
| `height`            | number  | 20      | Bar height (px)                  |
| `thickness`         | number  | 8       | Circle thickness (px)            |
| `animationDuration` | number  | 1.5     | Animation duration (s)           |
| `animateOnScroll`   | boolean | true    | Scroll animation                 |

## 📖 Usage Examples

### Simple bars

```jsx
<Skill name="JavaScript" value={85} type="bar" />
<Skill name="React" value={75} type="bar" color="#61DAFB" />
```

### Bars with gradient

```jsx
<Skill
  name="CSS"
  value={90}
  type="bar"
  gradient={{ from: "#4CAF50", to: "#f44336" }}
/>
```

### Circles with different positions

```jsx
<Skill name="Node.js" value={80} type="circle" valuePosition="center" />
<Skill name="Python" value={70} type="circle" valuePosition="around" />
```

### Advanced customization

```jsx
<Skill
  name="Docker"
  value={75}
  type="circle"
  size={150}
  thickness={12}
  gradient={{ from: "#0db7ed", to: "#2496ed" }}
  valuePosition="center"
  animationDuration={2.0}
/>
```

### Without scroll animation

```jsx
<Skill name="Static" value={70} type="bar" animateOnScroll={false} />
```

## 🎨 Automatic Color System

The component automatically generates colors based on percentage:

- **80%+** : 🟢 Green (#4CAF50) - Expert
- **60-79%** : � Yellow (#e5ff00ff) - Advanced
- **40-59%** : � Orange (#FF9800) - Intermediate
- **20-39%** : 🔴 Red (#ff4107ff) - Beginner
- **<20%** : 🔴 Dark Red (#f44336) - Very weak

## 🔧 Technical Architecture

### File Structure

```
src/components/Skill/
├── index.js           # Main React component
├── styles.module.css  # Styles with CSS Modules
└── README.md         # Documentation
```

### Technologies Used

- **React Hooks** : useState, useEffect, useRef
- **Intersection Observer** : Scroll animation
- **CSS Modules** : Isolated styles
- **SVG** : Progress circles
- **CSS Variables** : Adaptive themes

### Animations

- **Bars** : width 0% → value with transition
- **Circles** : stroke-dashoffset to draw progressively
- **Appearance** : opacity + translateY with fadeInUp

## 🎯 Best Practices

### Performance

- **Single observation** per element (disconnect after appearance)
- **CSS transitions** rather than JavaScript animations
- **CSS variables** for themes

### Accessibility

- **Contrasted colors** for readability
- **Text-shadow** on overlaid text
- **Adaptive sizes** according to component size

### Responsive

- **Reduced margins** on mobile
- **Adaptive font sizes** for circles
- **Configurable breakpoints**

## 🔍 Troubleshooting

### Animations don't trigger

- Check that `animateOnScroll={true}` (default)
- Ensure element is in viewport
- Check console for JS errors

### Colors don't adapt to theme

- Verify CSS variables are properly defined
- Ensure Docusaurus handles themes

### Circles don't display

- Check that `size` is sufficient
- Control that `thickness` isn't too large
- Verify radius calculations

## 🚀 Possible Evolutions

- Built-in icon support
- Bounce animations
- Pie charts
- Image export
- Predefined style presets
