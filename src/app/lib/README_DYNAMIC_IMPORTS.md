# Dynamic Import System - Developer Guide

## Quick Start

This guide shows you how to use the standardized dynamic import system for lazy loading components in this application.

## When to Use Dynamic Imports

Use dynamic imports for:
- **Heavy Components**: Large libraries (charts, maps, rich editors)
- **Conditional Features**: Components shown only in specific scenarios
- **Below-the-Fold Content**: Content not immediately visible
- **Route-Specific Features**: Features specific to certain pages
- **Third-Party Widgets**: External libraries or embeds

## Method 1: DynamicComponentLoader (Recommended)

The easiest way to add dynamic imports to your components.

### Basic Example

```tsx
import DynamicComponentLoader from '@/app/components/UI/DynamicComponentLoader';

function MyPage() {
  return (
    <DynamicComponentLoader
      importFn={() => import('./HeavyComponent')}
      moduleName="HeavyComponent"
    />
  );
}
```

### With Props

```tsx
<DynamicComponentLoader
  importFn={() => import('./UserProfile')}
  componentProps={{ userId: '123', showDetails: true }}
  moduleName="UserProfile"
/>
```

### With Preloading

```tsx
// Preload on hover - component loads when user hovers over the area
<DynamicComponentLoader
  importFn={() => import('./Dashboard')}
  moduleName="Dashboard"
  preloadOnHover
/>

// Preload on visibility - component loads when scrolled into view
<DynamicComponentLoader
  importFn={() => import('./Comments')}
  moduleName="Comments"
  preloadOnVisible
/>

// Both strategies
<DynamicComponentLoader
  importFn={() => import('./Chart')}
  moduleName="Chart"
  preloadOnHover
  preloadOnVisible
/>
```

### Custom Loading State

```tsx
<DynamicComponentLoader
  importFn={() => import('./VideoPlayer')}
  moduleName="VideoPlayer"
  loadingComponent={
    <div className="h-96 flex items-center justify-center">
      <div className="text-gray-400">Loading video player...</div>
    </div>
  }
  loadingHeight="h-96"
/>
```

### Custom Error Handling

```tsx
function CustomError({ error, retry }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h3>Failed to load component</h3>
      <p>{error.message}</p>
      <button onClick={retry}>Try Again</button>
    </div>
  );
}

<DynamicComponentLoader
  importFn={() => import('./Form')}
  moduleName="Form"
  errorComponent={CustomError}
/>
```

### Load on Demand

```tsx
// Don't load on mount - load when user triggers it
<DynamicComponentLoader
  importFn={() => import('./ExpensiveChart')}
  moduleName="ExpensiveChart"
  loadOnMount={false}
/>
```

### Prevent Loading Flash

```tsx
// Wait at least 300ms before showing loading state
// Prevents flash for fast-loading components
<DynamicComponentLoader
  importFn={() => import('./QuickComponent')}
  moduleName="QuickComponent"
  minLoadingTime={300}
/>
```

## Method 2: useDynamicComponent Hook

For more control over the loading process.

### Basic Usage

```tsx
import { useDynamicComponent } from '@/app/hooks/useDynamicComponent';

function MyComponent() {
  const { Component, isLoading, error, load, preload } = useDynamicComponent(
    () => import('./HeavyComponent'),
    { moduleName: 'HeavyComponent', loadOnMount: true }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!Component) return null;

  return <Component />;
}
```

### Manual Loading

```tsx
function ModalWithDynamicContent() {
  const [showModal, setShowModal] = useState(false);

  const { Component, isLoading, load } = useDynamicComponent(
    () => import('./ModalContent'),
    { moduleName: 'ModalContent', loadOnMount: false }
  );

  const handleOpen = () => {
    setShowModal(true);
    load(); // Load component when modal opens
  };

  return (
    <>
      <button onClick={handleOpen}>Open Modal</button>
      {showModal && (
        <Modal>
          {isLoading ? <Spinner /> : Component && <Component />}
        </Modal>
      )}
    </>
  );
}
```

### Preload on Hover

```tsx
function CardWithHoverPreload() {
  const { Component, preload } = useDynamicComponent(
    () => import('./CardDetails'),
    { moduleName: 'CardDetails', loadOnMount: false }
  );

  return (
    <div onMouseEnter={preload}>
      <h3>Hover to preload details</h3>
      {Component && <Component />}
    </div>
  );
}
```

### Preload on Visibility

```tsx
import { useDynamicComponent, usePreloadOnVisible } from '@/app/hooks/useDynamicComponent';

function LazySection() {
  const { Component, isLoading, preload } = useDynamicComponent(
    () => import('./SectionContent'),
    { moduleName: 'SectionContent', loadOnMount: false }
  );

  const visibilityRef = usePreloadOnVisible(preload);

  return (
    <div ref={visibilityRef}>
      {isLoading ? <Skeleton /> : Component && <Component />}
    </div>
  );
}
```

## Method 3: withDynamicImport Helper

For creating standalone dynamic components.

### Basic Usage

```tsx
import { withDynamicImport } from '@/app/lib/dynamicImportHelpers';

// Create the dynamic component
const HeavyChart = withDynamicImport(
  () => import('./HeavyChart'),
  {
    ssr: false,
    loading: () => <div>Loading chart...</div>
  }
);

// Use like a regular component
function Dashboard() {
  return <HeavyChart data={chartData} />;
}
```

### With Retry Configuration

```tsx
const ReliableComponent = withDynamicImport(
  () => import('./UnstableComponent'),
  {
    retryAttempts: 5,
    retryDelay: 2000,
    loading: () => <Spinner />
  }
);
```

## Performance Monitoring

### View Load Statistics

```tsx
import { DynamicImportMonitor } from '@/app/lib/dynamicImportHelpers';

// In development console or component
useEffect(() => {
  // Get stats for specific module
  const stats = DynamicImportMonitor.getStats('HeavyChart');
  console.log('Average load time:', stats.averageTime, 'ms');
  console.log('Success rate:', stats.successRate, '%');

  // Get all module stats
  console.table(DynamicImportMonitor.getAllStats());
}, []);
```

### Performance Monitoring in Production

```tsx
import { withMonitoring } from '@/app/lib/dynamicImportHelpers';

// Wrap your import with monitoring
const monitoredImport = withMonitoring(
  'CriticalFeature',
  () => import('./CriticalFeature')
);

// Use in DynamicComponentLoader
<DynamicComponentLoader
  importFn={monitoredImport}
  moduleName="CriticalFeature"
/>
```

## Best Practices

### 1. Always Provide Module Names

```tsx
// Good
<DynamicComponentLoader
  importFn={() => import('./Chart')}
  moduleName="Chart"  // ✓ Helps with debugging and monitoring
/>

// Bad
<DynamicComponentLoader
  importFn={() => import('./Chart')}  // ✗ Hard to debug
/>
```

### 2. Use Preloading Strategically

```tsx
// Good: Preload expensive components likely to be used
<DynamicComponentLoader
  importFn={() => import('./HeavyEditor')}
  moduleName="HeavyEditor"
  preloadOnHover  // ✓ User hovering indicates intent
/>

// Bad: Preloading everything defeats the purpose
<DynamicComponentLoader
  importFn={() => import('./SmallComponent')}
  moduleName="SmallComponent"
  preloadOnHover  // ✗ Unnecessary for small components
/>
```

### 3. Match Loading State to Content

```tsx
// Good: Loading height matches actual content
<DynamicComponentLoader
  importFn={() => import('./VideoPlayer')}
  moduleName="VideoPlayer"
  loadingHeight="h-96"  // ✓ Video player is ~384px tall
/>

// Bad: Generic loading state causes layout shift
<DynamicComponentLoader
  importFn={() => import('./VideoPlayer')}
  moduleName="VideoPlayer"  // ✗ Default h-64 causes jump
/>
```

### 4. Handle Errors Gracefully

```tsx
// Good: Provide fallback with retry
<DynamicComponentLoader
  importFn={() => import('./CriticalFeature')}
  moduleName="CriticalFeature"
  errorComponent={({ error, retry }) => (
    <div className="p-4 border border-red-500">
      <p>Failed to load feature</p>
      <button onClick={retry}>Retry</button>
    </div>
  )}
/>

// Bad: Silent failure leaves user confused
<DynamicComponentLoader
  importFn={() => import('./CriticalFeature')}
  moduleName="CriticalFeature"  // ✗ Uses default error (still ok, but less context)
/>
```

### 5. Consider Network Conditions

```tsx
// Good: Adjust retry attempts for critical features
<DynamicComponentLoader
  importFn={() => import('./PaymentForm')}
  moduleName="PaymentForm"
  options={{
    retryAttempts: 5,  // ✓ More retries for critical features
    retryDelay: 1000
  }}
/>

// Good: Fewer retries for non-critical features
<DynamicComponentLoader
  importFn={() => import('./Newsletter')}
  moduleName="Newsletter"
  options={{
    retryAttempts: 2  // ✓ Fewer retries for optional features
  }}
/>
```

## Common Patterns

### Tab Content

```tsx
function TabContainer() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <TabButtons onChange={setActiveTab} />
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'analytics' && (
        <DynamicComponentLoader
          importFn={() => import('./AnalyticsTab')}
          moduleName="AnalyticsTab"
        />
      )}
      {activeTab === 'settings' && (
        <DynamicComponentLoader
          importFn={() => import('./SettingsTab')}
          moduleName="SettingsTab"
        />
      )}
    </>
  );
}
```

### Modal Content

```tsx
function ModalWithDynamicForm() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Form</button>
      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <DynamicComponentLoader
            importFn={() => import('./ComplexForm')}
            moduleName="ComplexForm"
            loadingComponent={<FormSkeleton />}
          />
        </Modal>
      )}
    </>
  );
}
```

### Conditional Features

```tsx
function Dashboard({ userRole }) {
  return (
    <div>
      <Overview />
      {userRole === 'admin' && (
        <DynamicComponentLoader
          importFn={() => import('./AdminPanel')}
          moduleName="AdminPanel"
        />
      )}
    </div>
  );
}
```

### Route-Based Splitting

```tsx
// In your routing configuration
const routes = [
  {
    path: '/dashboard',
    component: () => (
      <DynamicComponentLoader
        importFn={() => import('./pages/Dashboard')}
        moduleName="DashboardPage"
      />
    )
  },
  // ... more routes
];
```

## Troubleshooting

### Import Not Loading

**Problem**: Component never loads
**Solution**: Check browser console for errors, verify import path is correct

```tsx
// Check the import works
import('./Component').then(console.log).catch(console.error);
```

### Flash of Loading State

**Problem**: Loading state appears briefly then disappears
**Solution**: Use `minLoadingTime` to prevent flash

```tsx
<DynamicComponentLoader
  importFn={() => import('./FastComponent')}
  moduleName="FastComponent"
  minLoadingTime={300}  // Wait at least 300ms
/>
```

### Memory Leaks

**Problem**: Components keep mounting/unmounting
**Solution**: The hook automatically handles cleanup with AbortController, but ensure you're not repeatedly creating new import functions

```tsx
// Bad: New function on every render
<DynamicComponentLoader
  importFn={() => import('./Component')}
  key={randomKey}  // ✗ Causes remount
/>

// Good: Stable import function
<DynamicComponentLoader
  importFn={() => import('./Component')}  // ✓ Same function reference
/>
```

## Migration Guide

### From Next.js dynamic()

```tsx
// Before
import dynamic from 'next/dynamic';

const MyComponent = dynamic(() => import('./MyComponent'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

// After
<DynamicComponentLoader
  importFn={() => import('./MyComponent')}
  moduleName="MyComponent"
  loadingComponent={<div>Loading...</div>}
  options={{ ssr: false }}
/>
```

### From React.lazy()

```tsx
// Before
import { lazy, Suspense } from 'react';

const MyComponent = lazy(() => import('./MyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <MyComponent />
    </Suspense>
  );
}

// After
function App() {
  return (
    <DynamicComponentLoader
      importFn={() => import('./MyComponent')}
      moduleName="MyComponent"
      loadingComponent={<Loading />}
    />
  );
}
```

## Additional Resources

- See `DYNAMIC_IMPORT_IMPLEMENTATION_SUMMARY.md` for full implementation details
- Check `src/app/lib/dynamicImportHelpers.ts` for API documentation
- Review `src/app/hooks/useDynamicComponent.ts` for hook details
- Examine existing implementations in:
  - `src/app/features/characters/CharactersFeature.tsx`
  - `src/app/features/characters/components/FactionsList.tsx`
  - `src/app/features/landing/Landing.tsx`

---

**Questions?** Check the implementation files or ask the team!
