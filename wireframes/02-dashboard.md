# Wireframe: The Bridge (Main Dashboard)

**Page Name**: The Bridge - Main Dashboard  
**Route**: `/dashboard`  
**Priority**: HIGH  
**Page Type**: Dashboard  
**Created**: January 17, 2026  
**Status**: Draft

---

## Page Overview

**Purpose**: Main control center providing high-density clinical telemetry and AI-driven insights  
**User Goals**: 
- View key metrics at a glance
- Access quick actions
- Monitor recent activity
- Navigate to key areas

**Primary User**: All users (primary landing page after login)

---

## Layout Structure

### Desktop Layout (> 1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
│ [Logo] [Nav] [User] [Notifications] [Skin Toggle]         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────┐  ┌──────────────────────────────────────────┐ │
│ │          │  │ THE BRIDGE                               │ │
│ │ SIDEBAR  │  │ Clinical Telemetry & AI Insights         │ │
│ │          │  │                                           │ │
│ │ [Nav]    │  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │ │
│ │          │  │ │Total │ │Pending│ │Unread│ │CPAP  │    │ │
│ │          │  │ │Patients│ │Rx    │ │Comms │ │Compl │    │ │
│ │          │  │ │ 1,234 │ │  45  │ │  12  │ │ 85%  │    │ │
│ │          │  │ └──────┘ └──────┘ └──────┘ └──────┘    │ │
│ │          │  │                                           │ │
│ │          │  │ ┌──────┐ ┌──────┐                        │ │
│ │          │  │ │DME   │ │Sleep │                        │ │
│ │          │  │ │Avail │ │Studies│                        │ │
│ │          │  │ │ 92%  │ │  3   │                        │ │
│ │          │  │ └──────┘ └──────┘                        │ │
│ │          │  │                                           │ │
│ │          │  │ QUICK ACTIONS                            │ │
│ │          │  │ [New Prescription] [New Patient]         │ │
│ │          │  │ [New Communication] [Schedule Study]      │ │
│ │          │  │                                           │ │
│ │          │  │ RECENT ACTIVITY                          │ │
│ │          │  │ • New prescription #1234 - 2m ago         │ │
│ │          │  │ • Patient John Doe registered - 5m ago  │ │
│ │          │  │ • Sleep study completed - 1h ago        │ │
│ │          │  │                                           │ │
│ └──────────┘  └──────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### Header Section
- [x] Logo/Branding: "AI2AIM RX"
- [x] Navigation menu (sidebar toggle on mobile)
- [x] User profile menu
- [x] Notifications icon with badge
- [x] Skin toggle (Aeterna/Cinematic) - Top right

### Sidebar
- [x] Navigation links to all major sections
- [x] Active page indicator
- [x] Collapsible sections

### Main Content Area

#### Page Header
- [x] Title: "The Bridge"
- [x] Subtitle: "Clinical Telemetry & AI Insights"
- [x] System IQ indicator (optional, top right of content)

#### Statistics Cards Grid (6 cards)
- [x] **Total Patients Card**
  - Icon: Users
  - Value: 1,234
  - Label: "Total Patients"
  - Trend: Optional up/down indicator
  - Link: `/patients`
  
- [x] **Pending Prescriptions Card**
  - Icon: Pill
  - Value: 45
  - Label: "Pending Rx"
  - Status: Warning if > 50
  - Link: `/prescriptions?status=pending`
  
- [x] **Unread Communications Card**
  - Icon: Mail
  - Value: 12
  - Label: "Unread"
  - Badge: Red if > 0
  - Link: `/communications?unread=true`
  
- [x] **CPAP Compliance Card**
  - Icon: TrendingUp
  - Value: 85%
  - Label: "CPAP Compliance"
  - Status: Good if > 80%
  - Link: `/cpap/compliance`
  
- [x] **DME Availability Card**
  - Icon: Package
  - Value: 92%
  - Label: "DME Available"
  - Status: Good if > 80%
  - Link: `/dme/equipment`
  
- [x] **Pending Sleep Studies Card**
  - Icon: Moon
  - Value: 3
  - Label: "Pending Studies"
  - Status: Warning if > 5
  - Link: `/sleep-studies?status=pending`

#### Quick Actions Section
- [x] Section title: "Quick Actions"
- [x] Button: "New Prescription" → `/prescriptions/new`
- [x] Button: "Add Patient" → `/patients/new`
- [x] Button: "New Communication" → `/communications/new`
- [x] Button: "Schedule Study" → `/sleep-studies/new`

#### Recent Activity Feed
- [x] Section title: "Recent Activity"
- [x] Activity items (last 10):
  - Icon based on activity type
  - Description: "New prescription #1234"
  - Timestamp: "2 minutes ago"
  - Link to related item
- [x] "View All" link → Activity log page (future)

#### Cognitive Feed (Optional)
- [ ] Section title: "Cognitive Feed"
- [ ] Real-time AI decision stream
- [ ] System events narrative
- [ ] Auto-scrolling feed

---

## Interactive Elements

### Buttons
- [x] Primary: "New Prescription" - Quick Actions
- [x] Primary: "Add Patient" - Quick Actions
- [x] Primary: "New Communication" - Quick Actions
- [x] Primary: "Schedule Study" - Quick Actions

### Cards (Clickable)
- [x] All statistics cards are clickable
- [x] Hover effect on cards
- [x] Visual feedback on click

### Links
- [x] Activity items link to related pages
- [x] "View All" link to activity log

---

## States & Variations

### Loading State
- [x] Skeleton loaders for statistics cards
- [x] Skeleton loaders for activity feed
- [x] Spinner in header during data fetch

### Empty State
- [x] Empty activity feed: "No recent activity"
- [x] Empty state for new installations

### Error State
- [x] Error message if data fetch fails
- [x] Retry button
- [x] Fallback to cached data if available

### Real-time Updates
- [x] Statistics update via Supabase Realtime
- [x] Activity feed updates in real-time
- [x] Notification badges update automatically

---

## Data Requirements

### Data to Display
- [x] Total patients count: `patients` table - COUNT
- [x] Pending prescriptions: `prescriptions` table - COUNT WHERE status='pending'
- [x] Unread communications: `communications` table - COUNT WHERE read=false
- [x] CPAP compliance rate: `cpap_compliance` table - AVG(compliance_percentage)
- [x] DME availability: `dme_inventory` table - COUNT WHERE status='available' / COUNT(*)
- [x] Pending sleep studies: `sleep_studies` table - COUNT WHERE status IN ('ordered', 'dispatched')
- [x] Recent activity: Combined from all tables - Last 10 items

### API Endpoints
- [x] GET `/api/dashboard/stats` - Aggregate statistics
- [x] GET `/api/dashboard/activity` - Recent activity feed
- [x] Realtime subscriptions for live updates

---

## User Workflows

### Primary Workflow: View Dashboard
1. User logs in
2. System redirects to `/dashboard`
3. System loads statistics and activity
4. User views key metrics
5. User clicks on card to navigate to detail page
6. User clicks quick action to create new item

### Alternative Workflow: Quick Action
1. User clicks "New Prescription" button
2. System navigates to `/prescriptions/new`
3. User creates prescription
4. System redirects back to dashboard (or stays on new page)

---

## Accessibility Requirements

- [x] All cards have proper ARIA labels
- [x] Statistics values announced by screen readers
- [x] Keyboard navigation for all interactive elements
- [x] Focus indicators visible
- [x] Color not sole indicator (icons + text)
- [x] Live region for real-time updates

---

## Responsive Breakpoints

- [x] Mobile (< 768px): 
  - 2-column grid for statistics
  - Stacked quick actions
  - Collapsible sidebar
  - Single column activity feed
- [x] Tablet (768px - 1024px): 
  - 3-column grid for statistics
  - 2-column quick actions
- [x] Desktop (> 1024px): 
  - 3-column grid for statistics
  - 4-column quick actions
  - Full sidebar visible

---

## Design System References

### Components Used
- [x] Card (shadcn/ui) - Statistics cards
- [x] Button (shadcn/ui) - Quick action buttons
- [x] Badge (shadcn/ui) - Notification badges
- [x] Skeleton (shadcn/ui) - Loading states

### Colors
- Primary: Blue (for primary actions)
- Success: Green (for good metrics)
- Warning: Yellow (for warnings)
- Error: Red (for critical metrics)

### Typography
- Page Title: 3xl, bold
- Card Value: 2xl, bold
- Card Label: sm, muted
- Activity Text: base

---

## Notes & Considerations

- Dashboard should load quickly (< 2 seconds)
- Statistics should update in real-time
- Consider caching for performance
- Activity feed should be paginated if > 10 items
- System IQ indicator is optional Aeterna OS feature
- Skin toggle allows switching between Aeterna and Clinical views
- Consider adding customizable widgets in future

---

## Approval

- [ ] Design Review: [Name] - [Date]
- [ ] Stakeholder Approval: [Name] - [Date]
- [ ] Development Ready: [Date]

---

**Wireframe Version**: 1.0  
**Last Updated**: January 17, 2026
