# Wireframe Requirements - AI2AIM RX Platform

**Date**: January 17, 2026  
**Purpose**: Detailed wireframe requirements for all missing pages

---

## Wireframe Standards

### Design System
- **Component Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **Layout**: Responsive (mobile-first)
- **Accessibility**: WCAG 2.1 AA compliance
- **Theme**: Medical/clinical with Aeterna OS cinematic options

### Common Elements
- **Header**: Logo, navigation, user menu, notifications
- **Sidebar**: Navigation menu (collapsible on mobile)
- **Footer**: Optional (minimal in dashboard views)
- **Breadcrumbs**: For nested pages
- **Action Buttons**: Primary actions in header, secondary in content

---

## Page Type Requirements

### 1. Authentication Pages

#### `/login` - Login Page
**Purpose**: User authentication entry point

**Required Elements**:
- Logo/branding (top center)
- Login form (centered)
  - Email input field
  - Password input field
  - "Remember me" checkbox
  - "Forgot password?" link
  - Submit button
- Error message display area
- Loading state indicator
- Link to registration (if applicable)

**Layout**:
- Full-screen centered layout
- Mobile: Stacked form fields
- Desktop: Centered card (max-width: 400px)

**States**:
- Default (empty form)
- Loading (submitting)
- Error (validation or auth failure)
- Success (redirecting)

---

### 2. Dashboard Pages

#### `/dashboard` - The Bridge (Main Dashboard)
**Purpose**: Main control center with clinical telemetry

**Required Elements**:
- **Header Section**:
  - Page title: "The Bridge"
  - System IQ indicator
  - Quick action buttons
  - Skin toggle (Aeterna/Cinematic)
  
- **Statistics Cards** (4-6 cards):
  - Total patients
  - Pending prescriptions
  - Unread communications
  - CPAP compliance rate
  - DME equipment availability
  - Pending sleep studies
  
- **Recent Activity Feed**:
  - Recent prescriptions
  - Recent patient registrations
  - Recent communications
  - System notifications
  
- **Quick Actions**:
  - Create new prescription
  - Add new patient
  - New communication
  - Schedule sleep study
  
- **Cognitive Feed** (optional):
  - Real-time AI decision stream
  - System events narrative

**Layout**:
- Grid layout (responsive: 1 col mobile, 2-3 cols desktop)
- Cards with hover states
- Real-time data updates

---

#### `/hub` - Neural Analytics Hub
**Purpose**: Access to 8 specialized analytics modules

**Required Elements**:
- **Module Grid** (8 modules):
  - Specialist Hub card
  - Logistics Core card
  - Inventory Matrix card
  - Reporting Engine card
  - Clinical Data Vault card
  - Compliance Auditor card
  - Financial Matrix card
  - Diagnostic IQ card
  
- **Each Module Card**:
  - Icon
  - Module name
  - Category label
  - Status indicator (stable/operational/archived)
  - Description
  - Link/button to access

**Layout**:
- Grid: 2 columns mobile, 4 columns desktop
- Card-based layout with hover effects

---

### 3. List Pages

#### Common List Page Structure

**Required Elements**:
- **Header**:
  - Page title with icon
  - Description/subtitle
  - Primary action button (e.g., "Add New")
  
- **Toolbar**:
  - Search input
  - Filter dropdowns (status, date range, etc.)
  - Sort options
  - View toggle (table/card view)
  
- **Content Area**:
  - Table or card grid
  - Pagination controls
  - Empty state (when no results)
  - Loading state (skeleton loaders)
  
- **Table Columns** (if table view):
  - ID/Number
  - Patient/Subject name
  - Date/Created
  - Status badge
  - Actions (view, edit, delete)

**Specific List Pages**:

#### `/patients` - Patient List
**Columns/Fields**:
- Patient ID
- Full Name
- Date of Birth
- Phone
- Last Visit
- Actions

**Filters**:
- Search (name, ID, phone)
- Status
- Insurance provider

#### `/prescriptions` - Prescription List
**Columns/Fields**:
- Prescription Number
- Patient Name
- Medication
- Status badge
- Prescribed Date
- Prescribed By
- Actions

**Filters**:
- Search (prescription #, patient name)
- Status (pending, approved, filled, etc.)
- Date range

#### `/communications` - Communications List
**Columns/Fields**:
- Type badge (letter, referral, message)
- Subject
- Patient (if linked)
- From/To
- Date
- Read status
- Actions

**Filters**:
- Type
- Direction (inbound/outbound)
- Read status
- Date range

#### `/sleep-studies` - Sleep Studies List
**Columns/Fields**:
- Study Type
- Patient Name
- Study Date
- Status badge
- Monitor Serial
- Dispatch Date
- Actions

**Filters**:
- Status
- Study type
- Date range

#### `/dme/equipment` - DME Equipment Catalog
**Layout**: Card grid or table
**Fields**:
- Equipment Code
- Name
- Category
- Manufacturer
- Stock Level
- Available Count
- Actions

**Filters**:
- Category (CPAP, BiPAP, mask, supply)
- Manufacturer
- Stock status

#### `/dme/prescriptions` - DME Prescriptions List
**Columns/Fields**:
- Prescription Number
- Patient Name
- Equipment
- Rental/Purchase
- Status
- Authorization Number
- Actions

#### `/pft/tests` - PFT Tests List
**Columns/Fields**:
- Test Type
- Patient Name
- Test Date
- Status badge
- Location
- Indication
- Actions

**Filters**:
- Status
- Test type
- Location
- Date range

#### `/referrals` - Referrals List
**Columns/Fields**:
- Referral Number
- Patient Name
- Referral Type
- Referring Physician
- Status badge
- Received Date
- Actions

**Filters**:
- Status
- Referral type
- Date range

---

### 4. Form Pages

#### Common Form Page Structure

**Required Elements**:
- **Header**:
  - Page title ("New [Entity]")
  - Back button/link
  - Breadcrumbs (optional)
  
- **Form Section**:
  - Form fields grouped logically
  - Required field indicators (*)
  - Field labels and placeholders
  - Help text/descriptions
  - Validation error messages
  
- **Action Buttons**:
  - Primary: Submit/Save
  - Secondary: Cancel
  - Loading state on submit
  
- **Sidebar/Info Panel** (optional):
  - Help text
  - Related information
  - Quick links

**Specific Form Pages**:

#### `/patients/new` - New Patient Form
**Form Sections**:
1. **Basic Information**:
   - Patient ID (auto-generated or manual)
   - First Name *
   - Last Name *
   - Date of Birth
   - Gender
   
2. **Contact Information**:
   - Phone
   - Email
   - Address (line 1, line 2, city, state, zip)
   
3. **Insurance**:
   - Insurance Provider
   - Insurance ID
   
4. **Medical Information**:
   - Medical History (textarea or structured)
   - Allergies (tags/input)
   
5. **Emergency Contact**:
   - Name
   - Phone
   
6. **Sleep Clinic Specific** (if applicable):
   - Preferred Location
   - Primary Sleep Diagnosis
   - AHI Score
   - CPAP Prescribed Date

**Validation**:
- Required fields marked with *
- Email format validation
- Phone format validation
- Date validation

#### `/prescriptions/new` - New Prescription Form
**Form Sections**:
1. **Patient Selection**:
   - Patient selector (searchable)
   - Patient info display
   
2. **Medication**:
   - Medication selector (searchable)
   - Dosage
   - Quantity
   - Refills
   
3. **Instructions**:
   - Patient instructions (textarea)
   - Internal notes
   
4. **DME Options** (if applicable):
   - Is DME checkbox
   - DME category selector

**Workflow**:
- Step 1: Select patient
- Step 2: Select medication
- Step 3: Enter details
- Step 4: Review and submit

#### `/communications/new` - New Communication Form
**Form Sections**:
1. **Type Selection**:
   - Communication type (letter, referral, message)
   
2. **Recipients**:
   - To (user selector)
   - Patient (if linked)
   
3. **Content**:
   - Subject *
   - Content (rich text or textarea)
   
4. **Metadata**:
   - Related prescription (optional)
   - Priority
   - Tags

#### `/sleep-studies/new` - New Sleep Study Form
**Form Sections**:
1. **Patient Selection**:
   - Patient selector
   
2. **Study Details**:
   - Study Type (Level 3 Home, Level 1 PSG, Level 2)
   - Study Date *
   - Location (if applicable)
   
3. **Additional**:
   - Notes

#### `/dme/prescriptions/new` - New DME Prescription Form
**Form Sections**:
1. **Patient Selection**:
   - Patient selector
   
2. **Equipment Selection**:
   - Equipment selector (filtered by category)
   - Rental or Purchase
   - Duration (if rental)
   
3. **Insurance**:
   - Insurance Authorization Number
   - Authorization Expires Date
   
4. **Delivery**:
   - Delivery Address
   - Delivery Instructions

#### `/pft/tests/new` - New PFT Test Form
**Form Sections**:
1. **Patient Selection**:
   - Patient selector
   
2. **Test Details**:
   - Test Type (Spirometry, Lung Volume, Diffusion, Full PFT) *
   - Test Date *
   - Location selector
   - Indication (asthma, COPD, etc.)
   
3. **Additional**:
   - Notes

---

### 5. Detail Pages

#### Common Detail Page Structure

**Required Elements**:
- **Header**:
  - Title (entity name/number)
  - Status badge
  - Primary actions (Edit, Delete, Workflow actions)
  - Breadcrumbs
  
- **Content Tabs/Sections**:
  - Overview/Details
  - History/Timeline
  - Related entities
  - Documents/Attachments
  
- **Sidebar** (optional):
  - Quick info
  - Related links
  - Actions

**Specific Detail Pages**:

#### `/patients/[id]` - Patient Detail
**Tabs/Sections**:
1. **Overview**:
   - Basic information card
   - Contact information
   - Insurance information
   - Medical history
   - Allergies
   
2. **Prescriptions**:
   - Prescription history list
   - Link to create new
   
3. **Communications**:
   - Communication history
   
4. **Sleep Clinic** (if applicable):
   - Sleep studies
   - CPAP compliance
   - DME assignments
   - PFT tests
   
5. **Encounters**:
   - Visit history
   - Follow-ups

**Actions**:
- Edit patient
- New prescription
- New communication
- Schedule follow-up

#### `/prescriptions/[id]` - Prescription Detail
**Tabs/Sections**:
1. **Details**:
   - Prescription information
   - Patient information
   - Medication details
   - Status and workflow
   
2. **Workflow**:
   - Current status
   - Workflow actions (Verify, Approve, Fill, Dispense)
   - Status history timeline
   
3. **Related**:
   - Related communications
   - Related encounters

**Actions**:
- Verify (Pharmacist)
- Approve/Reject (Pharmacist/Physician)
- Fill (Pharmacist)
- Dispense (Pharmacist)
- Cancel

#### `/communications/[id]` - Communication Detail
**Sections**:
- Communication header (type, direction, status)
- From/To information
- Subject
- Content (formatted)
- Related patient/prescription links
- Metadata (date, read status)
- Attachments (if any)

**Actions**:
- Mark as read/unread
- Reply
- Forward
- Archive
- Delete

#### `/pft/tests/[id]` - PFT Test Detail
**Tabs/Sections**:
1. **Overview**:
   - Test information
   - Patient information
   - Location
   - Status
   
2. **Results**:
   - Spirometry results (if entered)
   - Lung volume results
   - Diffusion capacity
   - Spirometry charts
   - Form to enter results (if not entered)
   
3. **Interpretation**:
   - Clinical interpretation (if available)
   - Pattern and severity
   - Diagnosis
   - Recommendations
   - Form to create interpretation (if not available)

**Actions**:
- Enter results
- Create interpretation
- Print report
- Schedule follow-up

---

### 6. Specialized Dashboard Pages

#### `/cpap/compliance` - CPAP Compliance Dashboard
**Required Elements**:
- **Overview Cards**:
  - Total CPAP patients
  - Compliant patients count
  - Non-compliant patients count
  - Average compliance rate
  
- **Non-Compliant Alert Section**:
  - List of non-compliant patients
  - Days non-compliant
  - Action buttons
  
- **Compliance Trends Chart**:
  - Line/bar chart showing compliance over time
  
- **Patient List/Table**:
  - Patient name
  - Compliance percentage
  - Days used/required
  - Average hours per night
  - Last sync date
  - Actions (sync, view details)

**Filters**:
- Compliance status
- Date range
- Location

#### `/dme/equipment` - DME Equipment Catalog
**Layout**: Card grid or table view

**Required Elements**:
- **Equipment Cards/Table**:
  - Equipment code
  - Name
  - Category badge
  - Manufacturer
  - Stock levels (available, assigned, maintenance)
  - Stock health indicator (stable/warning/critical)
  
- **Filters**:
  - Category
  - Manufacturer
  - Stock status
  
- **Actions**:
  - Add new equipment
  - View inventory details
  - Edit equipment

**Stock Health Colors**:
- Green: >80% available
- Yellow: 50-80% available
- Red: <50% available

#### `/inventory` - Inventory Matrix
**Tabs**:
1. **Medical Supplies**
2. **DME Equipment**

**Required Elements**:
- Stock level indicators
- Low stock alerts
- Inventory by category
- Serial number tracking (for DME)
- Reorder suggestions

---

### 7. Administrative Pages

#### `/ai-agents` - AI Agents Dashboard
**Required Elements**:
- Agent cards/list showing:
  - Agent name
  - Role
  - Type (role-based, encoding)
  - Status (active/inactive)
  - Capabilities
  - Actions (configure, test)

#### `/automations` - Automations List
**Required Elements**:
- Automation cards showing:
  - Name
  - Trigger type
  - Action type
  - Status (active/inactive)
  - Last run
  - Actions (edit, activate/deactivate, delete)

#### `/automations/[id]` - Automation Editor
**Required Elements**:
- Automation builder interface:
  - Trigger configuration
  - Action configuration
  - Conditions
  - Test button
  - Save/Activate buttons

#### `/billing` - Financial Matrix
**Required Elements**:
- Revenue metrics cards
- Charts (revenue trends, payment status)
- Outstanding invoices list
- Payment tracking

#### `/reports` - Reporting Engine
**Required Elements**:
- Report type selector
- Date range picker
- Generate button
- Report history list
- Download options (PDF, CSV)

#### `/specialists` - Specialist Hub
**Required Elements**:
- Specialist list/table
- Credentialing status
- Neural ratings
- Filter by specialty
- Add new specialist

#### `/diagnostic-iq` - Diagnostic IQ
**Required Elements**:
- Data integrity checks
- Encounter gap analysis
- Audit trail viewer
- System health indicators

#### `/workflow-simulator` - Workflow Simulator
**Required Elements**:
- Simulation controls
- Workflow visualization
- Safety override indicators
- Cognitive feed integration
- Results display

#### `/appointments` - Appointments Calendar
**Purpose**: Appointment booking and management (backend exists, UI missing)

**Required Elements**:
- **Calendar View**:
  - Monthly/weekly/day view toggle
  - Staff selector filter
  - Location filter
  - Date navigation
  
- **Appointment Slots**:
  - Time slots with availability
  - Booked appointments (patient name, type, status)
  - Available slots (clickable to book)
  - Color coding by status
  
- **Appointment Details Panel**:
  - Patient information
  - Appointment type
  - Duration
  - Status badge
  - Actions (confirm, check-in, complete, cancel, reschedule)
  
- **Toolbar**:
  - New appointment button
  - Filter by staff, type, status
  - Search appointments
  - Export calendar

**Layout**:
- Calendar grid (responsive)
- Side panel for appointment details
- Modal for new appointment form

**States**:
- Loading (fetching appointments)
- Empty (no appointments)
- Error (failed to load)

#### `/appointments/new` - New Appointment Form
**Purpose**: Book new appointment (backend exists, UI missing)

**Required Elements**:
- **Form Sections**:
  1. Patient Selection:
     - Patient search/selector
     - Patient info display
     
  2. Appointment Details:
     - Appointment type selector
     - Staff member selector
     - Location selector
     - Date picker
     - Time slot selector (shows available slots)
     - Duration
     - Priority (urgent, high, normal, low)
     
  3. Additional:
     - Reason for visit
     - Special instructions
     - Related records (prescription, sleep study, etc.)

**Workflow**:
- Step 1: Select patient
- Step 2: Select appointment type
- Step 3: Choose date/time (shows availability)
- Step 4: Review and confirm

#### `/appointments/[id]` - Appointment Detail
**Purpose**: View and manage appointment (backend exists, UI missing)

**Required Elements**:
- **Header**:
  - Appointment number
  - Status badge
  - Actions (edit, cancel, reschedule)
  
- **Details Section**:
  - Patient information
  - Staff member
  - Appointment type
  - Date and time
  - Duration
  - Location
  - Status timeline
  
- **Workflow Actions**:
  - Confirm appointment
  - Check-in patient
  - Start appointment
  - Complete appointment
  - Mark no-show
  - Cancel appointment
  - Reschedule
  
- **Related Records**:
  - Linked prescription
  - Linked sleep study
  - Linked DME prescription
  - Linked PFT test
  - Linked referral
  
- **Notes**:
  - Reason for visit
  - Special instructions
  - Patient notes
  - Staff notes

#### `/staff/schedules` - Staff Schedule Management
**Purpose**: Manage staff working schedules (backend exists, UI missing)

**Required Elements**:
- **Staff List/Selector**:
  - Staff member cards
  - Role badges
  - Active status
  
- **Schedule View**:
  - Weekly schedule grid
  - Day of week columns
  - Time slots rows
  - Working hours blocks
  - Break times
  - Time off blocks
  
- **Schedule Editor**:
  - Add/edit schedule
  - Set working hours
  - Set break times
  - Set max appointments
  - Set default duration
  - Effective date range

#### `/productivity` - Productivity Dashboard
**Purpose**: Staff utilization and productivity metrics (backend exists, UI missing)

**Required Elements**:
- **Overview Cards**:
  - Total staff
  - Average utilization rate
  - Underutilized staff count
  - Overbooked staff count
  
- **Utilization Chart**:
  - Staff utilization over time
  - Target line (85%)
  - Individual staff bars
  
- **Staff Metrics Table**:
  - Staff name
  - Utilization percentage
  - Appointments today/week
  - Revenue generated
  - Underutilized indicator
  
- **Alerts**:
  - Low utilization alerts
  - Overbooking alerts
  - Capacity warnings
  
- **Filters**:
  - Date range
  - Staff role
  - Location

---

## Responsive Design Requirements

### Mobile (< 768px)
- Stack form fields vertically
- Single column layouts
- Collapsible sidebar (hamburger menu)
- Touch-friendly button sizes (min 44x44px)
- Simplified tables (card view alternative)

### Tablet (768px - 1024px)
- 2-column layouts where appropriate
- Sidebar can be collapsible
- Table view with horizontal scroll

### Desktop (> 1024px)
- Full sidebar visible
- Multi-column layouts
- Full table views
- Hover states and interactions

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels
- **Focus Indicators**: Visible focus states
- **Error Messages**: Clear, descriptive error messages
- **Form Labels**: All form fields have associated labels

---

## Wireframe Deliverables Checklist

For each wireframe, include:
- [ ] Page layout (desktop view)
- [ ] Mobile responsive layout
- [ ] All interactive elements labeled
- [ ] Form validation states
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Success states
- [ ] Navigation flow
- [ ] User workflow annotations

---

**Last Updated**: January 17, 2026
