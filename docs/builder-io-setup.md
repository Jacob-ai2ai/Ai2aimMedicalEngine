# Builder.io Integration Guide

## Overview

Builder.io is integrated into the AI2AIM RX platform to enable visual UI/UX editing. This allows non-technical team members to design and edit pages visually without writing code.

## Setup

### 1. Get Builder.io API Key

1. Sign up at [Builder.io](https://www.builder.io)
2. Create a new space/project
3. Go to Account Settings → API Keys
4. Copy your Public API Key

### 2. Configure Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_BUILDER_API_KEY=your-builder-api-key-here
```

### 3. Install Dependencies

Dependencies are already installed:
- `@builder.io/react` - React SDK
- `@builder.io/sdk` - Core SDK

## Usage

### Accessing Builder.io Editor

1. **Visual Editor**: Visit `https://builder.io` and log in
2. **Preview Mode**: Add `?builder.preview=true` to any page URL
3. **Edit Mode**: Click "Edit in Builder.io" button (when logged in)

### Creating Pages

1. Go to Builder.io dashboard
2. Click "New Page"
3. Design your page visually
4. Set the URL path (e.g., `/builder/home`)
5. Publish the page

### Custom Components

The following custom components are registered and available in Builder.io:

1. **MedicalCard** - Medical information card
   - Inputs: title, description, icon

2. **PrescriptionStatusBadge** - Prescription status indicator
   - Inputs: status (pending, approved, rejected, filled, dispensed)

3. **PatientInfoCard** - Patient information display
   - Inputs: patientName, patientId, dateOfBirth, phone

4. **StatisticsCard** - Statistics/metrics display
   - Inputs: label, value, change, trend

### Adding More Custom Components

Edit `src/lib/builder/builder-components.tsx`:

```typescript
builder.registerComponent(
  ({ prop1, prop2 }: { prop1: string; prop2: number }) => {
    return <div>Your component JSX</div>
  },
  {
    name: 'YourComponentName',
    inputs: [
      {
        name: 'prop1',
        type: 'string',
        required: true,
      },
      {
        name: 'prop2',
        type: 'number',
      },
    ],
  }
)
```

## Builder.io Routes

### Dynamic Route

Pages created in Builder.io are accessible at:
- `/builder/*` - Any path you set in Builder.io

Example:
- Builder.io page with path `/home` → Accessible at `/builder/home`
- Builder.io page with path `/about` → Accessible at `/builder/about`

### Preview Mode

To preview Builder.io content:
```
http://localhost:3000/builder/your-page?builder.preview=true
```

## Integration Points

### 1. Layout Integration

Builder.io components are registered in `src/app/layout.tsx` to be available globally.

### 2. Page Component

Use the `BuilderPage` component in any page:

```tsx
import { BuilderPage } from '@/components/builder/builder-page'

export default function Page() {
  return <BuilderPage model="page" />
}
```

### 3. API Routes

- `/api/builder/preview` - Preview mode endpoint

## Best Practices

1. **Component Design**: Keep components simple and reusable
2. **Naming**: Use clear, descriptive names for components
3. **Props**: Define all inputs with proper types
4. **Styling**: Use Tailwind CSS classes for consistency
5. **Testing**: Test components in Builder.io editor before publishing

## Troubleshooting

### Builder.io Not Loading

- Check API key is set in `.env.local`
- Verify API key is correct
- Check browser console for errors
- Ensure Builder.io account is active

### Components Not Appearing

- Verify components are registered in `builder-components.tsx`
- Check component names match exactly
- Restart dev server after adding components

### Preview Mode Not Working

- Ensure you're logged into Builder.io
- Check URL has `?builder.preview=true`
- Verify API key has preview permissions

## Resources

- [Builder.io Documentation](https://www.builder.io/c/docs)
- [Builder.io React SDK](https://github.com/BuilderIO/builder)
- [Builder.io Examples](https://www.builder.io/c/examples)

## Next Steps

1. Set up your Builder.io account
2. Add API key to `.env.local`
3. Start creating pages visually
4. Customize components as needed
5. Publish and test pages
