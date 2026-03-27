# DeskButler Premium UI Component Library

A production-ready React component library with premium visual quality, smooth animations, and full keyboard accessibility.

## ✨ Features

- 🎨 **Premium Visual Quality** - Glassmorphism effects, smooth shadows, and top-tier aesthetics
- ⚡ **Smooth Animations** - 150-250ms transitions with custom easing curves
- ⌨️ **Keyboard Accessible** - Full keyboard navigation and ARIA support
- 🧩 **Composable** - Mix and match components to build complex UIs
- 📝 **TypeScript-like Documentation** - Comprehensive JSDoc comments
- 🎯 **Production Ready** - Battle-tested patterns and best practices

## 📦 Components

### Button
Premium button with variants, sizes, loading states, and ripple effects.

```jsx
import { Button } from './components/ui';

<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>

// With icons
<Button 
  variant="primary"
  iconLeft={<Icon />}
  onClick={handleClick}
>
  Save
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean
- `iconLeft`: ReactNode
- `iconRight`: ReactNode

**Features:**
- Hover scale + brightness effect
- Click compression animation
- Ripple effect on click
- Loading spinner
- Full keyboard support

---

### Card
Glassmorphism card with variants and optional sections.

```jsx
import { Card } from './components/ui';

<Card 
  variant="default"
  header="Card Title"
  footer="Footer content"
  hoverable
>
  Card content goes here
</Card>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'bordered'
- `header`: ReactNode
- `footer`: ReactNode
- `hoverable`: boolean
- `onClick`: function (makes card interactive)

**Features:**
- Glassmorphism backdrop
- Smooth hover transitions
- Optional header/footer sections
- Interactive mode with keyboard support

---

### Input
Floating label input with icons, validation, and character counter.

```jsx
import { Input } from './components/ui';

<Input
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  clearable
  maxLength={50}
  showCounter
/>

// With icon
<Input
  label="Search"
  icon={<SearchIcon />}
  placeholder="Type to search..."
/>
```

**Props:**
- `label`: string (enables floating label)
- `error`: string (shows error message)
- `icon`: ReactNode (left icon)
- `clearable`: boolean (shows clear button)
- `maxLength`: number
- `showCounter`: boolean
- `type`: string

**Features:**
- Floating label animation
- Focus state with accent glow
- Shake animation on error
- Clear button
- Character counter
- Icon support

---

### Toggle
Smooth toggle switch with haptic-style feedback.

```jsx
import { Toggle } from './components/ui';

<Toggle
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Enable notifications"
  labelPosition="right"
/>
```

**Props:**
- `checked`: boolean
- `onChange`: function
- `label`: string
- `labelPosition`: 'left' | 'right'
- `disabled`: boolean

**Features:**
- Smooth slide animation
- Haptic-style feedback
- Scale effects on interaction
- Disabled state
- Keyboard support

---

### Modal
Premium modal with glassmorphism backdrop and focus trap.

```jsx
import { Modal } from './components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
  closeOnEscape
  closeOnBackdrop
>
  <p>Modal content</p>
  <Button onClick={() => setIsOpen(false)}>Close</Button>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `closeOnEscape`: boolean (default: true)
- `closeOnBackdrop`: boolean (default: true)

**Features:**
- Blur backdrop with glassmorphism
- Slide-up animation
- ESC key to close
- Click outside to close
- Focus trap
- Body scroll lock
- Smooth open/close transitions

---

### Dropdown
Feature-rich dropdown with search, multi-select, and keyboard navigation.

```jsx
import { Dropdown } from './components/ui';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3', disabled: true },
];

<Dropdown
  options={options}
  value={selected}
  onChange={setSelected}
  placeholder="Select..."
  searchable
/>

// Multi-select
<Dropdown
  options={options}
  value={selectedArray}
  onChange={setSelectedArray}
  multiple
/>
```

**Props:**
- `options`: Array<{value, label, disabled?}>
- `value`: any (or array for multi-select)
- `onChange`: function
- `placeholder`: string
- `multiple`: boolean
- `searchable`: boolean
- `disabled`: boolean
- `maxHeight`: number (for virtual scrolling)

**Features:**
- Smooth expand animation
- Arrow key navigation
- Search filtering
- Multi-select with checkboxes
- Disabled options
- Virtual scrolling support
- Click outside to close

---

### Toast
Auto-dismissing toast notifications with progress bar and stacking.

```jsx
import { ToastProvider, useToast } from './components/ui';

// Wrap your app
<ToastProvider>
  <App />
</ToastProvider>

// Use in components
function MyComponent() {
  const toast = useToast();

  const handleSave = () => {
    toast.success('Saved successfully!');
    toast.error('Something went wrong!');
    toast.warning('Warning message');
    toast.info('Info message');
  };

  return <Button onClick={handleSave}>Save</Button>;
}
```

**API:**
- `toast.success(message, duration?)`: Show success toast
- `toast.error(message, duration?)`: Show error toast
- `toast.warning(message, duration?)`: Show warning toast
- `toast.info(message, duration?)`: Show info toast
- `toast.dismiss(id)`: Dismiss specific toast

**Features:**
- Slide in from top-right
- Auto-dismiss with progress bar
- Stack management
- Type-based colors (success, error, info, warning)
- Manual dismiss
- Smooth animations

---

## 🎨 Design System

All components use CSS variables from the DeskButler design system:

```css
/* Colors */
--accent: #8a78ff;
--success: #34d399;
--danger: #f87171;
--warning: #fbbf24;

/* Backgrounds */
--bg-base: #101014;
--bg-raised: #16161c;
--bg-card: rgba(24, 24, 34, 0.65);
--bg-input: rgba(20, 20, 28, 0.8);

/* Text */
--text: #e8e8f0;
--text-secondary: rgba(232, 232, 240, 0.55);

/* Borders */
--border: rgba(255, 255, 255, 0.06);
--border-focus: rgba(138, 120, 255, 0.5);

/* Transitions */
--duration-fast: 120ms;
--duration-normal: 200ms;
--ease: cubic-bezier(0.22, 1, 0.36, 1);
```

## 🚀 Usage

Import individual components:

```jsx
import { Button, Card, Input, Modal } from './components/ui';
```

Or import everything:

```jsx
import * as UI from './components/ui';

<UI.Button>Click me</UI.Button>
```

## ♿ Accessibility

All components follow WCAG 2.1 AA standards:

- ✅ Keyboard navigation
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Screen reader support
- ✅ Focus visible indicators
- ✅ Semantic HTML

## 🎯 Best Practices

1. **Always wrap your app with ToastProvider** if using toasts
2. **Use semantic variants** (primary for main actions, danger for destructive actions)
3. **Provide labels for inputs** for better accessibility
4. **Handle loading states** to give user feedback
5. **Use modals sparingly** - they interrupt user flow
6. **Test keyboard navigation** - all interactive elements should be reachable

## 📸 Demo

View the component showcase:

```jsx
import ComponentShowcase from './components/ui/ComponentShowcase';

<ComponentShowcase />
```

## 🔧 Customization

Components are designed to be easily customizable:

1. **Override CSS variables** to match your brand
2. **Add custom classes** via `className` prop
3. **Extend components** using composition
4. **Modify animations** by changing CSS transition values

## 📝 License

Part of the DeskButler project.
