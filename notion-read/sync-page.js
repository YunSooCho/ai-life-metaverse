#!/usr/bin/env node

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

// Page ID from URL: 032ae41778f7499bb68cac44a5c2028e
const PAGE_ID = process.env.NOTION_PAGE_ID || '032ae41778f7499bb68cac44a5c2028e';

// Debug: Check if token is loaded
console.log(`NOTION_TOKEN: ${process.env.NOTION_TOKEN ? '✓ Loaded' : '✗ NOT LOADED'}`);
console.log(`Token prefix: ${process.env.NOTION_TOKEN?.substring(0, 10)}...`);

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  headers: {
    'Notion-Version': '2022-06-28'
  }
});

// Storage paths
const MEMORY_DIR = path.join(__dirname, '../../memory');
const NOTION_DIR = path.join(MEMORY_DIR, 'notion');

// Ensure directories exist
if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
if (!fs.existsSync(NOTION_DIR)) fs.mkdirSync(NOTION_DIR, { recursive: true });

/**
 * Fetch a single page and its children
 */
async function fetchNotionPage() {
  console.log('🔄 Fetching Notion page...');
  console.log(`   Page ID: ${PAGE_ID}`);

  try {
    // Fetch page
    const page = await notion.pages.retrieve({ page_id: PAGE_ID });
    console.log(`✓ Page retrieved: ${page.id}`);

    // Fetch page content (children)
    let allBlocks = [];
    let cursor = undefined;

    do {
      const response = await notion.blocks.children.list({
        block_id: PAGE_ID,
        page_size: 100,
        start_cursor: cursor,
      });

      allBlocks = allBlocks.concat(response.results);
      cursor = response.next_cursor;

      console.log(`✓ Fetched ${response.results.length} blocks (total: ${allBlocks.length})`);
    } while (cursor);

    // Convert to markdown
    const markdown = pageToMarkdown(page, allBlocks);

    // Save file
    const title = extractTitle(page);
    const filename = `${page.id}-${sanitizeFilename(title)}.md`;
    const filepath = path.join(NOTION_DIR, filename);
    fs.writeFileSync(filepath, markdown);

    console.log(`\n✅ Saved: ${title} -> ${filepath}`);
    console.log(`   File size: ${markdown.length} bytes`);

  } catch (error) {
    if (error.code === 'object_not_found') {
      console.error('❌ Page not found - Make sure the integration is shared to this page!');
      console.error(`   Page ID: ${PAGE_ID}`);
    } else if (error.code === 'unauthorized') {
      console.error('❌ Unauthorized - Check your token and page sharing!');
    } else {
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
}

/**
 * Extract title from page object
 */
function extractTitle(page) {
  if (!page.properties) return 'Untitled';

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

  return 'Untitled';
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
 * Convert Notion page to markdown with children
 */
function pageToMarkdown(page, blocks) {
  let md = `# ${extractTitle(page)}\n\n`;
  md += `**Notion ID:** ${page.id.replace(/-/g, '')}\n\n`;

  // Add properties
  if (page.properties && Object.keys(page.properties).length > 0) {
    md += `## Properties\n\n`;
    for (const [key, prop] of Object.entries(page.properties)) {
      const value = propertyToMarkdown(prop);
      if (value) {
        md += `- **${key}**: ${value}\n`;
      }
    }
    md += `\n---\n\n`;
  }

  // Add content blocks
  if (blocks && blocks.length > 0) {
    md += `## Content\n\n`;
    for (const block of blocks) {
      md += blockToMarkdown(block);
    }
  }

  return md;
}

/**
 * Convert Notion block to markdown
 */
function blockToMarkdown(block) {
  if (!block) return '';

  const type = block.type;
  const content = block[type];

  switch (type) {
    case 'paragraph':
      const paraText = content.rich_text?.map(t => t.plain_text).join('') || '';
      return paraText ? `${paraText}\n\n` : '';

    case 'heading_1':
      const h1Text = content.rich_text?.map(t => t.plain_text).join('') || '';
      return h1Text ? `# ${h1Text}\n\n` : '';

    case 'heading_2':
      const h2Text = content.rich_text?.map(t => t.plain_text).join('') || '';
      return h2Text ? `## ${h2Text}\n\n` : '';

    case 'heading_3':
      const h3Text = content.rich_text?.map(t => t.plain_text).join('') || '';
      return h3Text ? `### ${h3Text}\n\n` : '';

    case 'bulleted_list_item':
      const bulletText = content.rich_text?.map(t => t.plain_text).join('') || '';
      return bulletText ? `- ${bulletText}\n` : '';

    case 'numbered_list_item':
      const numberText = content.rich_text?.map(t => t.plain_text).join('') || '';
      return numberText ? `1. ${numberText}\n` : '';

    case 'to_do':
      const todoText = content.rich_text?.map(t => t.plain_text).join('') || '';
      const checked = content.checked ? 'x' : ' ';
      return todoText ? `- [${checked}] ${todoText}\n` : '';

    case 'quote':
      const quoteText = content.rich_text?.map(t => t.plain_text).join('') || '';
      return quoteText ? `> ${quoteText}\n\n` : '';

    case 'divider':
      return '---\n\n';

    case 'callout':
      const calloutText = content.rich_text?.map(t => t.plain_text).join('') || '';
      return calloutText ? `> 💡 ${calloutText}\n\n` : '';

    case 'code':
      const codeText = content.code?.rich_text?.map(t => t.plain_text).join('') || '';
      return codeText ? `\`\`\`\n${codeText}\n\`\`\`\n\n` : '';

    default:
      return `[${type}]\n`;
  }
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
      return prop.url ? `[${prop.url}](${prop.url})` : '';
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
fetchNotionPage().catch(console.error);