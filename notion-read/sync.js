#!/usr/bin/env node

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Storage paths
const MEMORY_DIR = path.join(__dirname, '../../memory');
const NOTION_DIR = path.join(MEMORY_DIR, 'notion');

// Ensure directories exist
if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
if (!fs.existsSync(NOTION_DIR)) fs.mkdirSync(NOTION_DIR, { recursive: true });

/**
 * Fetch all pages and databases from Notion
 */
async function fetchNotionData() {
  console.log('🔄 Starting Notion sync...');

  let allPages = [];
  let cursor = undefined;

  // Search all pages
  do {
    const response = await notion.search({
      query: '',
      filter: {
        property: 'object',
        value: 'page'
      },
      page_size: 100,
      start_cursor: cursor,
    });

    allPages = allPages.concat(response.results);
    cursor = response.next_cursor;

    console.log(`✓ Fetched ${response.results.length} pages (total: ${allPages.length})`);
  } while (cursor);

  // Save each page as markdown file
  for (const page of allPages) {
    if (!page.properties || Object.keys(page.properties).length === 0) {
      continue; // Skip empty pages
    }

    const pageId = page.id;
    const title = extractTitle(page);

    // Convert to markdown
    const markdown = pageToMarkdown(page);

    // Save file
    const filename = `${pageId}-${sanitizeFilename(title)}.md`;
    const filepath = path.join(NOTION_DIR, filename);
    fs.writeFileSync(filepath, markdown);

    console.log(`✓ Saved: ${title}`);
  }

  console.log(`\n✅ Synced ${allPages.length} pages to ${NOTION_DIR}`);
}

/**
 * Extract title from page object
 */
function extractTitle(page) {
  // Try common title properties
  const titlePropKeys = ['Name', 'Title', 'title', 'name', 'Title', '名称', '제목'];

  for (const key of titlePropKeys) {
    if (page.properties[key]) {
      const prop = page.properties[key];
      if (prop.type === 'title' && prop.title && prop.title.length > 0) {
        return prop.title[0].plain_text;
      }
      if (prop.type === 'rich_text' && prop.rich_text && prop.rich_text.length > 0) {
        return prop.rich_text[0].plain_text;
      }
    }
  }

  return page.id.replace(/-/g, '').substring(0, 8);
}

/**
 * Sanitize filename
 */
function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
}

/**
 * Convert Notion page to markdown
 */
function pageToMarkdown(page) {
  let md = `# ${extractTitle(page)}\n\n`;
  md += `**Notion ID:** ${page.id}\n`;
  md += `**Last Edited:** ${page.last_edited_time}\n\n`;

  md += `---\n\n`;

  // Add properties
  if (page.properties) {
    md += `## Properties\n\n`;
    for (const [key, prop] of Object.entries(page.properties)) {
      const value = propertyToMarkdown(prop);
      if (value) {
        md += `- **${key}**: ${value}\n`;
      }
    }
    md += `\n---\n\n`;
  }

  return md;
}

/**
 * Convert Notion property to markdown text
 */
function propertyToMarkdown(prop) {
  if (!prop) return '';

  switch (prop.type) {
    case 'title':
      return prop.title?.map(t => t.plain_text).join('') || '';
    case 'rich_text':
      return prop.rich_text?.map(t => t.plain_text).join('') || '';
    case 'select':
      return prop.select?.name || '';
    case 'multi_select':
      return prop.multi_select?.map(s => s.name).join(', ') || '';
    case 'date':
      return prop.date?.start || '';
    case 'checkbox':
      return prop.checkbox ? '✅' : '⬜';
    case 'number':
      return prop.number?.toString() || '';
    case 'url':
      return `[${prop.url}](${prop.url})` || '';
    case 'email':
      return prop.email || '';
    case 'phone':
      return prop.phone || '';
    case 'status':
      return prop.status?.name || '';
    default:
      return `[${prop.type}]`;
  }
}

// Run
fetchNotionData().catch(console.error);