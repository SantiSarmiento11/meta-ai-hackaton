const https = require('https');
const fs = require('fs');
const path = require('path');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYjQyMGNmMS05OTk0LTQxNDQtODc1NS0xNDU0YmZiODY4YmMiLCJpc3MiOiJuOG4iLCJqdGkiOiJkN2M4ZTRlMS1hZjJmLTQ1NDYtODYxZS1mNGE1ZGJkNWQwZDQiLCJpYXQiOjE3OTM3NDkyMTIsImV4cCI6MTc5NjI1NjAwMCwiYXVkIjoicHVibGljLWFwaSJ9._I8D9sbO9h0SbrBmWldsV9xO7uFKILM4sMaAmpov3RY';

async function updateWorkflow(id, workflowData) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      name: workflowData.name,
      nodes: workflowData.nodes,
      connections: workflowData.connections,
      settings: workflowData.settings || { executionOrder: 'v1' }
    });

    const req = https.request({
      hostname: 'n8n-dev1.auto-node.tech',
      path: '/api/v1/workflows/' + id,
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to update ${id}: status ${res.statusCode} - ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function activateWorkflow(id) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'n8n-dev1.auto-node.tech',
      path: '/api/v1/workflows/' + id + '/activate',
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to activate ${id}: status ${res.statusCode} - ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const deployments = [
    {
      id: 'OGiWBz0XS8YCKsV7',
      file: path.join(__dirname, '../src/workflows/01-secretary-gmail-manager.json')
    },
    {
      id: 'CkATRASNrEraPrfQ',
      file: path.join(__dirname, '../src/workflows/02-coworker-github-executor.json')
    },
    {
      id: 'zINHYbE6372bGGJW',
      file: path.join(__dirname, '../src/workflows/03-manager-nightly-monitor.json')
    },
    {
      id: 'dQcgAMxGLkhwItEv',
      file: path.join(__dirname, '../src/workflows/04-ceo-conversational-agent.json')
    },
    {
      id: 'Gq3g9wHoEZ6761Jz',
      file: path.join(__dirname, '../src/workflows/00-central-orchestrator.json')
    }
  ];

  for (const dep of deployments) {
    const raw = fs.readFileSync(dep.file, 'utf8');
    const json = JSON.parse(raw);
    console.log(`Updating ${dep.id} (${json.name})...`);
    const updateRes = await updateWorkflow(dep.id, json);
    console.log(`Updated ${dep.id}: active = ${updateRes.active}`);
    console.log(`Activating ${dep.id}...`);
    const actRes = await activateWorkflow(dep.id);
    console.log(`Activated ${dep.id}: active = ${actRes.active}`);
  }

  console.log('All 4 workflows updated and activated successfully.');
}

main().catch(err => {
  console.error('Deployment error:', err);
  process.exit(1);
});
