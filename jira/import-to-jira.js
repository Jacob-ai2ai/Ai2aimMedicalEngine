#!/usr/bin/env node

/**
 * Jira Import Script
 * Imports Epics and User Stories to Jira using REST API
 * 
 * Usage:
 *   node jira/import-to-jira.js
 * 
 * Environment Variables Required:
 *   JIRA_URL - Your Jira instance URL (e.g., https://yourcompany.atlassian.net)
 *   JIRA_EMAIL - Your Jira email
 *   JIRA_API_TOKEN - Your Jira API token (generate at https://id.atlassian.com/manage-profile/security/api-tokens)
 *   JIRA_PROJECT_KEY - Your Jira project key (e.g., AI2AIM)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const JIRA_URL = process.env.JIRA_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;

// Validate configuration
if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   JIRA_URL - Your Jira instance URL');
  console.error('   JIRA_EMAIL - Your Jira email');
  console.error('   JIRA_API_TOKEN - Your Jira API token');
  console.error('   JIRA_PROJECT_KEY - Your Jira project key');
  console.error('');
  console.error('Set these in your .env file or export them:');
  console.error('   export JIRA_URL="https://yourcompany.atlassian.net"');
  console.error('   export JIRA_EMAIL="your-email@example.com"');
  console.error('   export JIRA_API_TOKEN="your-api-token"');
  console.error('   export JIRA_PROJECT_KEY="AI2AIM"');
  process.exit(1);
}

// Load data
const epicsPath = path.join(__dirname, 'epics.json');
const storiesPath = path.join(__dirname, 'user-stories.json');

if (!fs.existsSync(epicsPath) || !fs.existsSync(storiesPath)) {
  console.error('❌ Data files not found. Ensure epics.json and user-stories.json exist in jira/ directory.');
  process.exit(1);
}

const epics = JSON.parse(fs.readFileSync(epicsPath, 'utf8'));
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

// Jira API helper
const jiraApi = async (endpoint, method = 'GET', body = null) => {
  const url = `${JIRA_URL}/rest/api/3${endpoint}`;
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

  const options = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status} ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error(`Error calling Jira API: ${error.message}`);
    throw error;
  }
};

// Create Epic
const createEpic = async (epic) => {
  const body = {
    fields: {
      project: {
        key: JIRA_PROJECT_KEY,
      },
      summary: epic.summary,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: epic.description,
              },
            ],
          },
        ],
      },
      issuetype: {
        name: 'Epic',
      },
      priority: {
        name: epic.priority,
      },
    },
  };

  return await jiraApi('/issue', 'POST', body);
};

// Create User Story
const createUserStory = async (story, epicKey) => {
  // Format acceptance criteria
  const acceptanceCriteria = story.acceptanceCriteria
    .map((criteria, index) => `* ${criteria}`)
    .join('\n');

  const description = `${story.description}\n\n*Acceptance Criteria:*\n${acceptanceCriteria}`;

  const body = {
    fields: {
      project: {
        key: JIRA_PROJECT_KEY,
      },
      summary: story.summary,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: description,
              },
            ],
          },
        ],
      },
      issuetype: {
        name: 'Story',
      },
      priority: {
        name: story.priority,
      },
      customfield_10011: epicKey, // Epic Link field (adjust if different)
      customfield_10016: story.storyPoints, // Story Points field (adjust if different)
    },
  };

  return await jiraApi('/issue', 'POST', body);
};

// Main import function
const importToJira = async () => {
  console.log('🚀 Starting Jira Import...\n');
  console.log(`Project: ${JIRA_PROJECT_KEY}`);
  console.log(`Epics to import: ${epics.length}`);
  console.log(`User Stories to import: ${stories.length}\n`);

  const epicMap = new Map();

  // Import Epics
  console.log('📦 Importing Epics...');
  for (const epic of epics) {
    try {
      console.log(`   Creating Epic: ${epic.summary}`);
      const result = await createEpic(epic);
      epicMap.set(epic.summary, result.key);
      console.log(`   ✅ Created: ${result.key} - ${epic.summary}`);
    } catch (error) {
      console.error(`   ❌ Failed to create Epic "${epic.summary}": ${error.message}`);
    }
  }

  console.log('\n📝 Importing User Stories...');
  let successCount = 0;
  let failCount = 0;

  for (const story of stories) {
    const epicKey = epicMap.get(story.epic);
    if (!epicKey) {
      console.error(`   ❌ Epic "${story.epic}" not found for story "${story.summary}"`);
      failCount++;
      continue;
    }

    try {
      console.log(`   Creating Story: ${story.summary}`);
      const result = await createUserStory(story, epicKey);
      console.log(`   ✅ Created: ${result.key} - ${story.summary}`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Failed to create Story "${story.summary}": ${error.message}`);
      failCount++;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`   Epics: ${epics.length} created`);
  console.log(`   User Stories: ${successCount} created, ${failCount} failed`);
  console.log('\n✅ Import complete!');
};

// Run import
importToJira().catch((error) => {
  console.error('\n❌ Import failed:', error.message);
  process.exit(1);
});
