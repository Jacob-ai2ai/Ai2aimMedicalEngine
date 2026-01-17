# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone/Download the project**
2. **Install dependencies**: `npm install`
3. **Set up Supabase**: Follow QUICK_START.md
4. **Start dev server**: `npm run dev`

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

Server runs on http://localhost:3000

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Code Organization

### Adding a New Page

1. Create file in `src/app/(dashboard)/your-page/page.tsx`
2. Use server components when possible
3. Add to navigation in `sidebar.tsx` and `mobile-nav.tsx`

### Adding a New Component

1. Create file in appropriate `src/components/` subdirectory
2. Use TypeScript with proper types
3. Follow existing component patterns
4. Use shadcn/ui components when available

### Adding a New API Route

1. Create file in `src/app/api/your-route/route.ts`
2. Export GET, POST, PUT, DELETE handlers as needed
3. Use `createServerSupabase()` for database access
4. Implement proper error handling
5. Add authentication checks

### Adding a New AI Agent

1. Extend `BaseAgent` class
2. Implement `process()` method
3. Register in `src/lib/ai/agents/index.ts`
4. Add to database via migration or admin

### Adding a New Automation

1. Define trigger and action
2. Create via API or database
3. Test thoroughly
4. Monitor execution logs

## Best Practices

### TypeScript
- Use strict mode
- Define types for all data
- Avoid `any` type
- Use interfaces for object shapes

### React
- Prefer Server Components
- Use Client Components only when needed
- Implement proper error boundaries
- Handle loading states

### Database
- Always use RLS policies
- Validate inputs
- Use transactions for multi-step operations
- Index frequently queried columns

### Security
- Never expose service role key client-side
- Validate all user inputs
- Sanitize data before display
- Use parameterized queries (Supabase handles)

### Performance
- Use Server Components
- Implement proper caching
- Use Next.js Image optimization
- Minimize client bundle size

## Testing

### Manual Testing Checklist

- [ ] Authentication flow
- [ ] CRUD operations
- [ ] AI agent interactions
- [ ] Automation execution
- [ ] Real-time updates
- [ ] Mobile responsiveness
- [ ] Error handling

### Testing AI Agents

1. Create a test session
2. Send test messages
3. Verify responses
4. Check session state
5. Review logs

### Testing Automations

1. Create test automation
2. Trigger manually
3. Verify execution
4. Check logs
5. Test error scenarios

## Debugging

### Common Issues

**Supabase Connection Errors**
- Check `.env.local` credentials
- Verify Supabase project is active
- Check network connectivity

**TypeScript Errors**
- Run `npm run type-check`
- Check type definitions
- Verify imports

**Build Errors**
- Clear `.next` directory
- Reinstall dependencies
- Check for missing files

### Debug Tools

- Next.js DevTools
- React DevTools
- Supabase Dashboard
- Browser DevTools

## Git Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## Deployment

See DEPLOYMENT.md for production deployment instructions.

## Getting Help

1. Check documentation files
2. Review code comments
3. Check Supabase logs
4. Review Next.js documentation
5. Check TypeScript errors
