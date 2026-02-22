#!/usr/bin/env node

const { Client } = require('@notionhq/client');
require('dotenv').config({ path: './.env' });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

(async () => {
  try {
    const db = await notion.databases.query({ database_id: '032ae41778f7499bb68cac44a5c2028e' });
    console.log('Database items count:', db.results.length);
    console.log('\n=== Database Items ===\n');

    for (const item of db.results) {
      console.log(`\n--- Item: ${item.id} ---`);
      console.log('Properties:', Object.keys(item.properties));
      console.log('Full properties:', JSON.stringify(item.properties, null, 2));
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) console.error('Error code:', error.code);
  }
})();