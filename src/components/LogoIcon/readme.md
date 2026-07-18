# 🖼️ `LogoIcon` Component for Docusaurus

This component allows you to easily display **[Iconify](https://icon-sets.iconify.design/) icons** in **MDX** pages of Docusaurus.  
It is particularly useful for displaying **logos** (GitHub, Airbnb, Google, etc.) without having to import each icon individually.

## 🚀 Installation

In your Docusaurus project, install the Iconify React library:

```bash
npm install @iconify/react
```

or with Yarn:

```bash
yarn add @iconify/react
```

## 📂 File structure

```
src/
 ├─ components/
 │   └─ LogoIcon.js       # React component that wraps Iconify
 └─ theme/
     └─ MDXComponents.js  # Allows using <LogoIcon /> everywhere in MDX
```

## ⚙️ Component code

**`src/components/LogoIcon.js`**

```jsx
import React from "react";
import { Icon } from "@iconify/react";

export default function LogoIcon({ name, size = 48 }) {
  return <Icon icon={`logos:${name}`} width={size} height={size} />;
}
```

## 🔗 Global declaration in MDX

**`src/theme/MDXComponents.js`**

```jsx
import React from "react";
import MDXComponents from "@theme-original/MDXComponents";
import LogoIcon from "@site/src/components/LogoIcon";

export default {
  ...MDXComponents,
  LogoIcon, // 👈 makes <LogoIcon /> available everywhere
};
```

## 📌 How to use it

- The `name` corresponds to the icon name in the **Logos** set of Iconify.
  👉 Example: [logos\:airbnb-icon](https://icon-sets.iconify.design/logos/airbnb-icon/) → `name="airbnb-icon"`

- The `size` (optional) defines the logo size in pixels.
  Default value: `48`.

- You can easily customize the component (add a `color` prop, change the icon set, apply CSS classes, etc.).

## 🖊️ Usage in a `.mdx` file

Once configured, you can directly use the component without import:

## Usage example

```mdx
<LogoIcon name="airbnb-icon" size="64" />

<LogoIcon name="github-icon" />

<LogoIcon name="gitlab" size="32" />
```

## ✅ Advantages of my component

- No need to import each logo in every MDX file.
- Simple and readable syntax.
- Easy to customize globally (size, style, default color).
- Built on Iconify → access to **200k+ open source
