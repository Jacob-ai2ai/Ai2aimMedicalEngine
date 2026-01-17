# Wireframe Template - AI2AIM RX Platform

**Purpose**: Standard template for creating wireframes  
**Version**: 1.0  
**Last Updated**: January 17, 2026

---

## Wireframe Header

**Page Name**: [Page Name]  
**Route**: `/route/path`  
**Priority**: HIGH / MEDIUM / LOW  
**Page Type**: Form / List / Detail / Dashboard  
**Created**: [Date]  
**Status**: Draft / Review / Approved

---

## Page Overview

**Purpose**: [Brief description of page purpose]  
**User Goals**: [What users need to accomplish on this page]  
**Primary User**: [Role: Physician, Pharmacist, Admin, etc.]

---

## Layout Structure

### Desktop Layout (> 1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Fixed)                                              │
│ [Logo] [Navigation] [User Menu] [Notifications]             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────┐  ┌──────────────────────────────────────────┐ │
│ │          │  │ MAIN CONTENT AREA                        │ │
│ │ SIDEBAR  │  │                                           │ │
│ │          │  │ [Page-specific content]                  │ │
│ │ (Nav)    │  │                                           │ │
│ │          │  │                                           │ │
│ │          │  │                                           │ │
│ │          │  │                                           │ │
│ └──────────┘  └──────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1024px)

```
┌─────────────────────────────────────┐
│ HEADER                               │
│ [Logo] [☰ Menu] [User]            │
├─────────────────────────────────────┤
│ MAIN CONTENT AREA                   │
│ (2-column layout where appropriate) │
│                                      │
│                                      │
└─────────────────────────────────────┘
```

### Mobile Layout (< 768px)

```
┌─────────────────┐
│ HEADER           │
│ [☰] [Logo] [👤] │
├─────────────────┤
│ MAIN CONTENT     │
│ (Single column)  │
│                  │
│                  │
│                  │
└─────────────────┘
```

---

## Component Breakdown

### Header Section
- [ ] Logo/Branding
- [ ] Navigation menu
- [ ] User profile menu
- [ ] Notifications icon
- [ ] Search (if applicable)
- [ ] Primary action button (if applicable)

### Sidebar (if applicable)
- [ ] Navigation links
- [ ] Active page indicator
- [ ] Collapsible sections
- [ ] Quick actions

### Main Content Area

#### Section 1: [Section Name]
- [ ] Component/Element 1
- [ ] Component/Element 2
- [ ] Component/Element 3

#### Section 2: [Section Name]
- [ ] Component/Element 1
- [ ] Component/Element 2

---

## Interactive Elements

### Buttons
- [ ] Primary action button: [Label] - [Location]
- [ ] Secondary button: [Label] - [Location]
- [ ] Icon button: [Icon] - [Location]

### Forms
- [ ] Input field: [Label] - [Type] - [Required/Optional]
- [ ] Select dropdown: [Label] - [Options]
- [ ] Checkbox: [Label]
- [ ] Radio button: [Label]

### Links
- [ ] Internal link: [Text] → [Route]
- [ ] External link: [Text] → [URL]

---

## States & Variations

### Loading State
- [ ] Skeleton loader for [Component]
- [ ] Spinner for [Action]

### Empty State
- [ ] Empty state message: "[Message]"
- [ ] Empty state illustration/icon
- [ ] Call-to-action button: [Label]

### Error State
- [ ] Error message display: [Location]
- [ ] Error icon/indicator
- [ ] Retry action: [Button/Link]

### Success State
- [ ] Success message: [Location]
- [ ] Success icon
- [ ] Next action: [Button/Link]

---

## Data Requirements

### Data to Display
- [ ] Field 1: [Source] - [Format]
- [ ] Field 2: [Source] - [Format]

### Data to Collect
- [ ] Input 1: [Type] - [Validation]
- [ ] Input 2: [Type] - [Validation]

### API Endpoints
- [ ] GET `/api/endpoint` - [Purpose]
- [ ] POST `/api/endpoint` - [Purpose]

---

## User Workflows

### Primary Workflow
1. User [action]
2. System [response]
3. User [action]
4. System [response]

### Alternative Workflows
- **Workflow A**: [Description]
- **Workflow B**: [Description]

---

## Accessibility Requirements

- [ ] All interactive elements keyboard accessible
- [ ] Proper ARIA labels on form fields
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1)
- [ ] Focus indicators visible
- [ ] Error messages descriptive and associated with fields
- [ ] Screen reader announcements for dynamic content

---

## Responsive Breakpoints

- [ ] Mobile (< 768px): [Changes]
- [ ] Tablet (768px - 1024px): [Changes]
- [ ] Desktop (> 1024px): [Changes]

---

## Design System References

### Components Used
- [ ] Button (shadcn/ui)
- [ ] Card (shadcn/ui)
- [ ] Input (shadcn/ui)
- [ ] Select (shadcn/ui)
- [ ] Table (shadcn/ui)

### Colors
- Primary: [Color]
- Secondary: [Color]
- Success: [Color]
- Error: [Color]
- Warning: [Color]

### Typography
- Heading 1: [Size/Weight]
- Heading 2: [Size/Weight]
- Body: [Size/Weight]

---

## Notes & Considerations

- [Note 1]
- [Note 2]
- [Note 3]

---

## Approval

- [ ] Design Review: [Name] - [Date]
- [ ] Stakeholder Approval: [Name] - [Date]
- [ ] Development Ready: [Date]

---

**Template Version**: 1.0  
**Last Updated**: January 17, 2026
