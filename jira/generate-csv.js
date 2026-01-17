#!/usr/bin/env node

/**
 * Generate CSV file for Jira import
 * Creates a CSV file that can be imported manually via Jira UI
 */

const fs = require('fs');
const path = require('path');

const epicsPath = path.join(__dirname, 'epics.json');
const storiesPath = path.join(__dirname, 'user-stories.json');

const epics = JSON.parse(fs.readFileSync(epicsPath, 'utf8'));
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

// CSV Headers
const headers = [
  'Issue Type',
  'Summary',
  'Description',
  'Priority',
  'Epic Link',
  'Story Points',
  'Acceptance Criteria',
];

// Generate CSV rows
const rows = [];

// Add Epics
epics.forEach((epic) => {
  rows.push([
    'Epic',
    epic.summary,
    epic.description.replace(/\n/g, ' '),
    epic.priority,
    '', // No epic link for epics
    '', // No story points for epics
    '', // No acceptance criteria for epics
  ]);
});

// Add User Stories
stories.forEach((story) => {
  const acceptanceCriteria = story.acceptanceCriteria.join('; ');
  rows.push([
    'Story',
    story.summary,
    story.description,
    story.priority,
    story.epic, // Epic name (will need to be mapped to Epic Key in Jira)
    story.storyPoints.toString(),
    acceptanceCriteria,
  ]);
});

// Escape CSV values
const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Generate CSV content
const csvContent = [
  headers.map(escapeCsv).join(','),
  ...rows.map((row) => row.map(escapeCsv).join(',')),
].join('\n');

// Write CSV file
const csvPath = path.join(__dirname, 'jira-import.csv');
fs.writeFileSync(csvPath, csvContent, 'utf8');

console.log('✅ CSV file generated: jira/jira-import.csv');
console.log(`   Epics: ${epics.length}`);
console.log(`   User Stories: ${stories.length}`);
console.log(`   Total rows: ${rows.length}`);
