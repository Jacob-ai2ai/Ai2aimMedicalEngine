# Jira Integration Guide

This directory contains files and scripts to import Epics and User Stories into Jira.

## Files

- `epics.json` - Epic definitions
- `user-stories.json` - User story definitions with acceptance criteria
- `import-to-jira.js` - Node.js script to import to Jira via REST API
- `jira-import-csv.csv` - CSV file for manual import (alternative method)

## Prerequisites

1. **Jira Account**: Access to a Jira project
2. **API Token**: Generate at https://id.atlassian.com/manage-profile/security/api-tokens
3. **Node.js**: Version 18+ (for script method)
4. **Project Key**: Your Jira project key (e.g., "AI2AIM")

## Method 1: Automated Import (Recommended)

### Step 1: Set Environment Variables

Create a `.env` file in the project root or export variables:

```bash
export JIRA_URL="https://yourcompany.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-api-token"
export JIRA_PROJECT_KEY="AI2AIM"
```

### Step 2: Install Dependencies (if needed)

The script uses Node.js built-in `fetch` (Node 18+). If you need to install dependencies:

```bash
npm install node-fetch  # Only if using older Node.js
```

### Step 3: Run Import Script

```bash
node jira/import-to-jira.js
```

The script will:
1. Create all 7 Epics
2. Create all 19 User Stories
3. Link User Stories to their Epics
4. Set priorities and story points

## Method 2: Manual CSV Import

### Step 1: Prepare CSV

Use the provided `jira-import-csv.csv` file or generate from JSON:

```bash
node jira/generate-csv.js  # If available
```

### Step 2: Import via Jira UI

1. Go to your Jira project
2. Click "..." (More) → "Import issues from CSV"
3. Upload the CSV file
4. Map columns to Jira fields
5. Import

## Method 3: Jira REST API (Manual)

### Create Epic Example

```bash
curl -X POST \
  'https://yourcompany.atlassian.net/rest/api/3/issue' \
  -H 'Authorization: Basic BASE64_EMAIL:API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "fields": {
      "project": {"key": "AI2AIM"},
      "summary": "Prescription Management",
      "description": "Complete prescription lifecycle...",
      "issuetype": {"name": "Epic"},
      "priority": {"name": "High"}
    }
  }'
```

## Custom Field Mapping

The script uses default Jira field IDs. You may need to adjust:

- **Epic Link**: `customfield_10011` (adjust if different)
- **Story Points**: `customfield_10016` (adjust if different)

To find your field IDs:
1. Go to Jira → Settings → Issues → Custom Fields
2. Click on the field to see its ID

## Verification

After import, verify:
1. All 7 Epics are created
2. All 19 User Stories are created
3. User Stories are linked to correct Epics
4. Priorities and story points are set correctly

## Troubleshooting

### Authentication Errors
- Verify API token is correct
- Check email address matches Jira account
- Ensure API token has project access

### Field Errors
- Check custom field IDs match your Jira instance
- Verify issue types (Epic, Story) exist in your project
- Ensure priority names match your Jira priorities

### Network Errors
- Verify Jira URL is correct
- Check network connectivity
- Ensure Jira instance is accessible

## Support

For issues:
1. Check Jira API documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
2. Verify your Jira instance supports REST API v3
3. Check project permissions

## Data Summary

- **Epics**: 7
- **User Stories**: 19
- **Total Story Points**: 107
- **Priority Distribution**:
  - High: 10 stories
  - Medium: 7 stories
  - Low: 2 stories
