# Wireframe Inventory - AI2AIM RX Platform

**Date**: January 17, 2026  
**Status**: Audit Complete  
**Existing Wireframes**: 1 PDF file (97 pages - "RX Home Page.pdf")

---

## Executive Summary

**Total Pages Identified**: 35 pages  
**Pages with Wireframes**: 1 (potentially multiple in PDF)  
**Pages Missing Wireframes**: 34+ pages  
**Wireframe Coverage**: ~3% (1/35)

**Note**: Staff scheduling/appointments system has backend APIs but no UI pages yet - these should be added to the application.

---

## Existing Wireframe

### RX Home Page.pdf
- **Location**: `/RX Home Page.pdf`
- **Pages**: 97 pages
- **Status**: ✅ Exists
- **Coverage**: Unknown - needs review to determine which pages are covered
- **Format**: PDF

**Action Required**: Review PDF to identify which application pages are covered by wireframes in this document.

---

## Complete Page Inventory

### Authentication Pages (1 page)

| Route | Page Name | Wireframe Status | Priority | Notes |
|-------|-----------|------------------|----------|-------|
| `/login` | Login Page | ❌ Missing | HIGH | Authentication entry point |

---

### Main Dashboard Pages (2 pages)

| Route | Page Name | Wireframe Status | Priority | Notes |
|-------|-----------|------------------|----------|-------|
| `/dashboard` | The Bridge (Main Dashboard) | ⚠️ Unknown | HIGH | Main control center - may be in PDF |
| `/hub` | Neural Analytics Hub | ❌ Missing | MEDIUM | Analytics hub with 8 modules |

---

### Core Medical Pages (9 pages)

| Route | Page Name | Wireframe Status | Priority | Notes |
|-------|-----------|------------------|----------|-------|
| `/patients` | Patient List | ❌ Missing | HIGH | Patient management list view |
| `/patients/new` | New Patient Form | ❌ Missing | HIGH | Patient registration form |
| `/patients/[id]` | Patient Detail | ❌ Missing | HIGH | Patient profile and history |
| `/prescriptions` | Prescription List | ❌ Missing | HIGH | Prescription management list |
| `/prescriptions/new` | New Prescription Form | ❌ Missing | HIGH | Prescription creation form |
| `/prescriptions/[id]` | Prescription Detail | ❌ Missing | HIGH | Prescription details and workflow |
| `/communications` | Communications List | ❌ Missing | HIGH | Letters, referrals, messages list |
| `/communications/new` | New Communication Form | ❌ Missing | HIGH | Create communication form |
| `/communications/[id]` | Communication Detail | ❌ Missing | HIGH | Communication details view |

---

### Sleep Clinic Pages (9 pages)

| Route | Page Name | Wireframe Status | Priority | Notes |
|-------|-----------|------------------|----------|-------|
| `/sleep-studies` | Sleep Studies List | ❌ Missing | MEDIUM | Level 3 home sleep tests list |
| `/sleep-studies/new` | New Sleep Study Form | ❌ Missing | MEDIUM | Schedule new sleep study |
| `/cpap/compliance` | CPAP Compliance Dashboard | ❌ Missing | MEDIUM | Compliance monitoring dashboard |
| `/dme/equipment` | DME Equipment Catalog | ❌ Missing | MEDIUM | Equipment catalog with stock levels |
| `/dme/prescriptions` | DME Prescriptions List | ❌ Missing | MEDIUM | DME prescription management |
| `/dme/prescriptions/new` | New DME Prescription | ❌ Missing | MEDIUM | Create DME prescription form |
| `/pft/tests` | PFT Tests List | ❌ Missing | MEDIUM | Pulmonary function tests list |
| `/pft/tests/new` | New PFT Test Form | ❌ Missing | MEDIUM | Schedule new PFT test |
| `/pft/tests/[id]` | PFT Test Detail | ❌ Missing | MEDIUM | PFT results and interpretation |
| `/referrals` | Referrals List | ❌ Missing | MEDIUM | Referral form management |

---

### Staff Scheduling Pages (3 pages - Backend exists, UI missing)

| Route | Page Name | Wireframe Status | Priority | Notes |
|-------|-----------|------------------|----------|-------|
| `/appointments` | Appointments Calendar | ❌ Missing | HIGH | Appointment booking and management (backend API exists) |
| `/appointments/new` | New Appointment Form | ❌ Missing | HIGH | Book new appointment (backend API exists) |
| `/appointments/[id]` | Appointment Detail | ❌ Missing | HIGH | Appointment details and workflow (backend API exists) |
| `/staff/schedules` | Staff Schedules | ❌ Missing | MEDIUM | Staff schedule management (backend exists) |
| `/productivity` | Productivity Dashboard | ❌ Missing | MEDIUM | Staff utilization and productivity metrics (backend exists) |

### Administrative & Advanced Pages (10 pages)

| Route | Page Name | Wireframe Status | Priority | Notes |
|-------|-----------|------------------|----------|-------|
| `/ai-agents` | AI Agents Dashboard | ❌ Missing | LOW | AI agent management interface |
| `/automations` | Automations List | ❌ Missing | LOW | Automation workflow list |
| `/automations/[id]` | Automation Detail/Edit | ❌ Missing | LOW | Automation builder/editor |
| `/inventory` | Inventory Matrix | ❌ Missing | MEDIUM | Medical supplies and DME inventory |
| `/billing` | Financial Matrix | ❌ Missing | MEDIUM | Revenue and billing dashboard |
| `/purchasing` | Purchasing Core | ❌ Missing | LOW | Procurement and logistics |
| `/reports` | Reporting Engine | ❌ Missing | MEDIUM | PDF/CSV report generation |
| `/specialists` | Specialist Hub | ❌ Missing | MEDIUM | Specialist network management |
| `/diagnostic-iq` | Diagnostic IQ | ❌ Missing | LOW | Data integrity and audit tools |
| `/workflow-simulator` | Workflow Simulator | ❌ Missing | LOW | Safe testing environment |

---

### Public Pages (1 page)

| Route | Page Name | Wireframe Status | Priority | Notes |
|-------|-----------|------------------|----------|-------|
| `/` | Landing Page | ⚠️ Unknown | LOW | Public homepage - may be in PDF |

---

## Wireframe Requirements by Page Type

### Form Pages (10 pages)
**Common Requirements**:
- Form layout with validation
- Field labels and placeholders
- Error message display
- Submit/cancel buttons
- Loading states
- Success/error feedback

**Pages**:
- `/patients/new`
- `/prescriptions/new`
- `/communications/new`
- `/sleep-studies/new`
- `/dme/prescriptions/new`
- `/pft/tests/new`

### List Pages (12 pages)
**Common Requirements**:
- Table/card list layout
- Search and filter controls
- Pagination
- Sorting options
- Action buttons (view, edit, delete)
- Empty states
- Loading states

**Pages**:
- `/patients`
- `/prescriptions`
- `/communications`
- `/sleep-studies`
- `/dme/prescriptions`
- `/dme/equipment`
- `/pft/tests`
- `/referrals`
- `/automations`
- `/ai-agents`

### Detail Pages (6 pages)
**Common Requirements**:
- Header with title and actions
- Tabbed or sectioned content
- Related data display
- Action buttons (edit, delete, workflow actions)
- Status indicators
- Timeline/history view

**Pages**:
- `/patients/[id]`
- `/prescriptions/[id]`
- `/communications/[id]`
- `/pft/tests/[id]`
- `/automations/[id]`

### Dashboard Pages (4 pages)
**Common Requirements**:
- Widget/card layout
- Charts and graphs
- Key metrics display
- Quick actions
- Recent activity feed
- Navigation to related pages

**Pages**:
- `/dashboard` (The Bridge)
- `/cpap/compliance`
- `/billing` (Financial Matrix)
- `/hub` (Neural Analytics Hub)

---

## Priority Matrix

### 🔴 HIGH PRIORITY (10 pages)
Core medical workflows - essential for daily operations:
1. `/login` - Authentication
2. `/dashboard` - Main dashboard
3. `/patients` - Patient list
4. `/patients/new` - New patient
5. `/patients/[id]` - Patient detail
6. `/prescriptions` - Prescription list
7. `/prescriptions/new` - New prescription
8. `/prescriptions/[id]` - Prescription detail
9. `/communications` - Communications list
10. `/communications/new` - New communication

### 🟡 MEDIUM PRIORITY (15 pages)
Sleep clinic features and administrative tools:
11. `/sleep-studies` - Sleep studies list
12. `/sleep-studies/new` - New sleep study
13. `/cpap/compliance` - CPAP compliance
14. `/dme/equipment` - DME equipment
15. `/dme/prescriptions` - DME prescriptions
16. `/dme/prescriptions/new` - New DME prescription
17. `/pft/tests` - PFT tests list
18. `/pft/tests/new` - New PFT test
19. `/pft/tests/[id]` - PFT test detail
20. `/referrals` - Referrals
21. `/inventory` - Inventory management
22. `/billing` - Financial Matrix
23. `/reports` - Reporting Engine
24. `/specialists` - Specialist Hub
25. `/hub` - Neural Analytics Hub

### 🟢 LOW PRIORITY (7 pages)
Advanced features and administrative tools:
26. `/ai-agents` - AI Agents dashboard
27. `/automations` - Automations list
28. `/automations/[id]` - Automation editor
29. `/purchasing` - Purchasing Core
30. `/diagnostic-iq` - Diagnostic IQ
31. `/workflow-simulator` - Workflow Simulator
32. `/` - Landing page

---

## Wireframe Format Recommendations

### Recommended Format
- **Primary**: Figma (for collaboration and version control)
- **Alternative**: PDF (for documentation and sharing)
- **Backup**: PNG/Image files (for quick reference)

### Wireframe Fidelity Level
- **Low-Fidelity**: Initial wireframes (boxes, labels, basic layout)
- **Medium-Fidelity**: Detailed wireframes (specific components, spacing, interactions)
- **High-Fidelity**: Pixel-perfect mockups (colors, typography, final design)

**Recommendation**: Start with medium-fidelity wireframes for consistency and clarity.

---

## Wireframe Storage Structure

### Recommended Directory Structure
```
wireframes/
├── authentication/
│   └── login.pdf
├── dashboard/
│   ├── main-dashboard.pdf
│   └── neural-hub.pdf
├── medical/
│   ├── patients/
│   │   ├── list.pdf
│   │   ├── new.pdf
│   │   └── detail.pdf
│   ├── prescriptions/
│   │   ├── list.pdf
│   │   ├── new.pdf
│   │   └── detail.pdf
│   └── communications/
│       ├── list.pdf
│       ├── new.pdf
│       └── detail.pdf
├── sleep-clinic/
│   ├── sleep-studies/
│   ├── cpap-compliance/
│   ├── dme/
│   ├── pft/
│   └── referrals/
└── administrative/
    ├── ai-agents/
    ├── automations/
    ├── inventory/
    ├── billing/
    └── reports/
```

---

## Priority Matrix

See [WIREFRAME_PRIORITY_MATRIX.md](WIREFRAME_PRIORITY_MATRIX.md) for detailed prioritization and implementation roadmap.

### Quick Summary
- **HIGH Priority**: 10 pages (Core medical workflows)
- **MEDIUM Priority**: 15 pages (Sleep clinic + administrative)
- **LOW Priority**: 7 pages (Advanced features)

**Total Estimated Effort**: 127 hours (~16 days)

## Wireframe Requirements

See [WIREFRAME_REQUIREMENTS.md](WIREFRAME_REQUIREMENTS.md) for detailed requirements for each page type.

## Next Steps

1. ✅ **Complete**: Wireframe inventory created
2. ✅ **Complete**: Wireframe requirements documented
3. ✅ **Complete**: Priority matrix created
4. ⏳ **Pending**: Review existing PDF wireframe ("RX Home Page.pdf")
5. ⏳ **Pending**: Get stakeholder approval on wireframe format
6. ⏳ **Pending**: Begin Phase 1 wireframe creation (HIGH priority pages)

---

## Notes

- The existing PDF (97 pages) may contain multiple wireframes - needs review
- Wireframes should follow the existing design system (shadcn/ui, Tailwind CSS)
- All wireframes should consider mobile responsiveness
- Wireframes should include accessibility considerations (WCAG 2.1 AA)
- Consider creating wireframe component library for consistency

---

**Last Updated**: January 17, 2026  
**Next Review**: After PDF analysis complete
