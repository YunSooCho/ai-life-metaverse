#!/usr/bin/env node

const { Client } = require('@notionhq/client');
require('dotenv').config({ path: __dirname + '/.env' });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

console.log('Available methods on notion:', Object.keys(notion).filter(k => k.includes('database') || k.includes('query')));
console.log('\nAll methods:', Object.keys(notion));