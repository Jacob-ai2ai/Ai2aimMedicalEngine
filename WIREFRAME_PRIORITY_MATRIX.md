# Wireframe Priority Matrix - AI2AIM RX Platform

**Date**: January 17, 2026  
**Purpose**: Prioritized wireframe creation plan based on user workflows and business impact

---

## Priority Framework

### Priority Levels
- **🔴 HIGH**: Critical for daily operations, core user workflows
- **🟡 MEDIUM**: Important features, used regularly but not daily
- **🟢 LOW**: Advanced features, administrative tools, used occasionally

### Prioritization Criteria
1. **User Frequency**: How often is the page accessed?
2. **Business Impact**: Does it affect revenue or core operations?
3. **Workflow Dependency**: Is it part of a critical workflow?
4. **User Base**: How many users access this page?
5. **Completion Status**: Is the page already implemented?

---

## 🔴 HIGH PRIORITY Wireframes (13 pages)

### Core Medical Workflows

| # | Route | Page Name | User Frequency | Business Impact | Dependencies | Est. Effort |
|---|-------|-----------|----------------|-----------------|--------------|-------------|
| 1 | `/login` | Login Page | Daily (all users) | Critical | None | 2 hours |
| 2 | `/dashboard` | The Bridge | Daily (all users) | Critical | Login | 4 hours |
| 3 | `/patients` | Patient List | Daily (all staff) | Critical | Login | 3 hours |
| 4 | `/patients/new` | New Patient Form | Daily (admin/nurse) | Critical | Patients list | 4 hours |
| 5 | `/patients/[id]` | Patient Detail | Daily (all staff) | Critical | Patients list | 5 hours |
| 6 | `/prescriptions` | Prescription List | Daily (pharmacist/physician) | Critical | Login | 3 hours |
| 7 | `/prescriptions/new` | New Prescription Form | Daily (physician) | Critical | Prescriptions list | 5 hours |
| 8 | `/prescriptions/[id]` | Prescription Detail | Daily (pharmacist/physician) | Critical | Prescriptions list | 5 hours |
| 9 | `/communications` | Communications List | Daily (all staff) | High | Login | 3 hours |
| 10 | `/communications/new` | New Communication Form | Daily (all staff) | High | Communications list | 4 hours |
| 11 | `/appointments` | Appointments Calendar | Daily (all staff) | Critical | Login | 6 hours |
| 12 | `/appointments/new` | New Appointment Form | Daily (all staff) | Critical | Appointments list | 5 hours |
| 13 | `/appointments/[id]` | Appointment Detail | Daily (all staff) | Critical | Appointments list | 5 hours |

**Total HIGH Priority**: 13 pages  
**Estimated Total Effort**: 52 hours (~6.5 days)

**Note**: Appointments pages have complete backend (APIs, services, database) but UI pages are missing and need to be implemented.

**Rationale**: These pages form the core medical workflow. Without wireframes, development may lack consistency and user experience may suffer. They are accessed by all users daily and are critical for operations.

---

## 🟡 MEDIUM PRIORITY Wireframes (15 pages)

### Sleep Clinic Features

| # | Route | Page Name | User Frequency | Business Impact | Dependencies | Est. Effort |
|---|-------|-----------|----------------|-----------------|--------------|-------------|
| 11 | `/sleep-studies` | Sleep Studies List | Daily (sleep clinic staff) | High | Login | 3 hours |
| 12 | `/sleep-studies/new` | New Sleep Study Form | Daily (sleep clinic staff) | High | Sleep studies list | 4 hours |
| 13 | `/cpap/compliance` | CPAP Compliance Dashboard | Daily (sleep clinic staff) | High | Login | 5 hours |
| 14 | `/dme/equipment` | DME Equipment Catalog | Daily (DME staff) | High | Login | 4 hours |
| 15 | `/dme/prescriptions` | DME Prescriptions List | Daily (DME staff) | High | Login | 3 hours |
| 16 | `/dme/prescriptions/new` | New DME Prescription | Daily (DME staff) | High | DME prescriptions list | 5 hours |
| 17 | `/pft/tests` | PFT Tests List | Daily (respiratory staff) | High | Login | 3 hours |
| 18 | `/pft/tests/new` | New PFT Test Form | Daily (respiratory staff) | High | PFT tests list | 4 hours |
| 19 | `/pft/tests/[id]` | PFT Test Detail | Daily (respiratory staff) | High | PFT tests list | 6 hours |
| 20 | `/referrals` | Referrals List | Daily (admin/physician) | Medium | Login | 3 hours |

### Administrative Tools

| # | Route | Page Name | User Frequency | Business Impact | Dependencies | Est. Effort |
|---|-------|-----------|----------------|-----------------|--------------|-------------|
| 21 | `/inventory` | Inventory Matrix | Daily (inventory staff) | High | Login | 4 hours |
| 22 | `/billing` | Financial Matrix | Daily (billing staff) | High | Login | 5 hours |
| 23 | `/reports` | Reporting Engine | Weekly (admin) | Medium | Login | 4 hours |
| 24 | `/specialists` | Specialist Hub | Weekly (admin) | Medium | Login | 4 hours |
| 25 | `/hub` | Neural Analytics Hub | Daily (admin) | Medium | Login | 4 hours |
| 26 | `/staff/schedules` | Staff Schedules | Daily (admin) | Medium | Login | 5 hours |
| 27 | `/productivity` | Productivity Dashboard | Daily (admin) | Medium | Login | 6 hours |

**Total MEDIUM Priority**: 17 pages  
**Estimated Total Effort**: 71 hours (~9 days)

**Rationale**: These pages support specialized workflows (sleep clinic) and administrative functions. They are important for business operations but not accessed by all users daily.

---

## 🟢 LOW PRIORITY Wireframes (7 pages)

### Advanced Features

| # | Route | Page Name | User Frequency | Business Impact | Dependencies | Est. Effort |
|---|-------|-----------|----------------|-----------------|--------------|-------------|
| 26 | `/ai-agents` | AI Agents Dashboard | Weekly (admin/tech) | Low | Login | 4 hours |
| 27 | `/automations` | Automations List | Weekly (admin) | Low | Login | 3 hours |
| 28 | `/automations/[id]` | Automation Editor | Weekly (admin) | Low | Automations list | 6 hours |
| 29 | `/purchasing` | Purchasing Core | Weekly (admin) | Low | Login | 4 hours |
| 30 | `/diagnostic-iq` | Diagnostic IQ | Monthly (admin/compliance) | Low | Login | 5 hours |
| 31 | `/workflow-simulator` | Workflow Simulator | Monthly (admin/tech) | Low | Login | 6 hours |
| 32 | `/` | Landing Page | First visit only | Low | None | 3 hours |

**Total LOW Priority**: 7 pages  
**Estimated Total Effort**: 31 hours (~4 days)

**Rationale**: These pages are for advanced features, administrative tools, or one-time use. They have lower business impact and can be wireframed after core features.

---

## Implementation Roadmap

### Phase 1: Core Workflows (Week 1-2)
**Target**: HIGH priority pages (13 pages)
- Days 1-2: Authentication and Dashboard (2 pages)
- Days 3-5: Patient management (3 pages)
- Days 6-8: Prescription workflow (3 pages)
- Days 9-10: Communications (2 pages)
- Days 11-13: Appointments (3 pages) - **Note**: UI pages need to be implemented first

**Deliverable**: Complete wireframes for all core medical workflows

### Phase 2: Sleep Clinic Features + Scheduling (Week 3-4)
**Target**: Sleep clinic pages + scheduling (12 pages)
- Days 14-16: Sleep studies and CPAP (3 pages)
- Days 17-19: DME management (3 pages)
- Days 20-22: PFT testing (3 pages)
- Day 23: Referrals (1 page)
- Days 24-25: Staff scheduling and productivity (2 pages)

**Deliverable**: Complete wireframes for all sleep clinic features

### Phase 3: Administrative Tools (Week 5)
**Target**: Administrative pages (5 pages) - Note: Reduced from original count
- Days 21-22: Inventory and Billing (2 pages)
- Days 23-24: Reports and Specialists (2 pages)
- Day 25: Neural Hub (1 page)

**Deliverable**: Complete wireframes for administrative tools

### Phase 4: Advanced Features (Week 6)
**Target**: Advanced feature pages (7 pages)
- Days 26-27: AI Agents and Automations (3 pages)
- Days 28-29: Purchasing, Diagnostic IQ, Simulator (3 pages)
- Day 30: Landing page (1 page)

**Deliverable**: Complete wireframes for all advanced features

---

## Wireframe Creation Guidelines

### Standard Wireframe Elements
1. **Page Header**: Logo, navigation, user menu
2. **Page Title**: Clear page identification
3. **Primary Actions**: Main CTAs in header
4. **Content Area**: Main page content
5. **Sidebar**: Navigation (if applicable)
6. **Footer**: Optional, minimal

### Annotations Required
- **User Actions**: Label all clickable elements
- **Data Flow**: Show where data comes from
- **Validation**: Indicate required fields and validation rules
- **States**: Show loading, error, empty, success states
- **Responsive**: Include mobile/tablet breakpoints

### Wireframe Tools
- **Recommended**: Figma (for collaboration)
- **Alternative**: Balsamiq (for quick sketches)
- **Documentation**: PDF export for sharing

---

## Success Metrics

### Completion Targets
- **Week 2**: 100% of HIGH priority wireframes
- **Week 4**: 100% of MEDIUM priority wireframes
- **Week 6**: 100% of all wireframes

### Quality Metrics
- All wireframes reviewed and approved
- Consistent design system usage
- Mobile responsive designs included
- Accessibility considerations documented

---

## Dependencies & Blockers

### Dependencies
- Design system guidelines (shadcn/ui, Tailwind)
- Review of existing PDF wireframe
- Stakeholder approval on wireframe format

### Potential Blockers
- Unclear requirements for advanced features
- Missing design system documentation
- Stakeholder availability for reviews

---

## Next Actions

1. ✅ **Complete**: Wireframe inventory created
2. ✅ **Complete**: Wireframe requirements documented
3. ✅ **Complete**: Priority matrix created
4. ⏳ **Pending**: Review existing PDF wireframe
5. ⏳ **Pending**: Get stakeholder approval on wireframe format
6. ⏳ **Pending**: Begin Phase 1 wireframe creation

---

**Last Updated**: January 17, 2026  
**Next Review**: After PDF analysis and stakeholder feedback
