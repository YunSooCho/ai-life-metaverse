#!/usr/bin/env node

const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function fetchDatabaseRows(dbId) {
  let allRows = [];
  let cursor = undefined;

  do {
    const response = await notion.databases.query({
      database_id: dbId,
      page_size: 100,
      start_cursor: cursor,
    });

    allRows.push(...response.results);
    cursor = response.next_cursor;

    console.log(`Fetched ${response.results.length} rows (total: ${allRows.length})`);
  } while (cursor);

  return allRows;
}

async function main() {
  const dbId = 'ed150a08-bbe7-4716-89c1-d3f20e981d13';
  const rows = await fetchDatabaseRows(dbId);

  console.log('\n=== Database Content ===\n');
  rows.forEach((row, i) => {
    console.log(`\n--- Row ${i + 1} ---`);
    console.log(`ID: ${row.id}`);

    if (row.properties) {
      for (const [key, prop] of Object.entries(row.properties)) {
        try {
          let value = '';
          switch (prop.type) {
            case 'title':
              value = prop.title?.map(t => t.plain_text).join('') || '';
              break;
            case 'rich_text':
              value = prop.rich_text?.map(t => t.plain_text).join('') || '';
              break;
            case 'select':
              value = prop.select?.name || '';
              break;
            case 'multi_select':
              value = prop.multi_select?.map(s => s.name).join(', ') || '';
              break;
            case 'email':
              value = prop.email || '';
              break;
            case 'phone_number':
              value = prop.phone_number || '';
              break;
            case 'url':
              value = prop.url || '';
              break;
            case 'number':
              value = prop.number?.toString() || '';
              break;
            case 'checkbox':
              value = prop.checkbox ? '✓' : '✗';
              break;
            case 'date':
              value = prop.date?.start || '';
              break;
            default:
              value = `[${prop.type}]`;
          }
          console.log(`  ${key}: ${value}`);
        } catch (e) {
          console.log(`  ${key}: [Error: ${e.message}]`);
        }
      }
    }
  });

  console.log(`\n\nTotal rows: ${rows.length}`);
}

main().catch(console.error);