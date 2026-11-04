const https = require('https');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYjQyMGNmMS05OTk0LTQxNDQtODc1NS0xNDU0YmZiODY4YmMiLCJpc3MiOiJuOG4iLCJqdGkiOiJkN2M4ZTRlMS1hZjJmLTQ1NDYtODYxZS1mNGE1ZGJkNWQwZDQiLCJpYXQiOjE3OTM3NDkyMTIsImV4cCI6MTc5NjI1NjAwMCwiYXVkIjoicHVibGljLWFwaSJ9._I8D9sbO9h0SbrBmWldsV9xO7uFKILM4sMaAmpov3RY';

const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu;

async function postWebhook(path, payload, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = https.request({
      hostname: 'n8n-dev1.auto-node.tech',
      path: path,
      method: 'POST',
      timeout: timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout tras ${timeoutMs}ms esperando respuesta de ${path}`));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getRecentExecutions(limit = 6) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'n8n-dev1.auto-node.tech',
      path: `/api/v1/executions?limit=${limit}`,
      headers: { 'X-N8N-API-KEY': apiKey }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
  });
}

function checkEmojis(text) {
  const matches = (String(text)).match(emojiRegex);
  return matches ? matches.join(' ') : '0 detectados';
}

async function main() {
  console.log('====================================================');
  console.log('VALIDACION INTEGRAL DE FLUJOS N8N + META AI (SLEEPLY)');
  console.log('====================================================\n');

  // TEST 1: Secretaria
  console.log('--- TEST 1: Secretaria / Asistente (Taylor Chen) ---');
  const t1 = Date.now();
  const res1 = await postWebhook('/webhook/sleeply-secretary-agent', {
    agentCode: 'ASSISTANT',
    taskTitle: 'Triage matutino de bandeja y coordinacion de calendario',
    taskDescription: 'Revisar correos urgentes, verificar citas en Calendar y Drive',
    operatingMode: 'awake'
  });
  console.log('HTTP Status:', res1.status, `(${Date.now() - t1}ms)`);
  console.log('Agent Code:', res1.body?.agentCode);
  console.log('Bubble Message:', res1.body?.bubbleMessage);
  console.log('Emojis detectados en respuesta:', checkEmojis(JSON.stringify(res1.body)));
  console.log('Meta AI Output snippet:', (res1.body?.output || '').slice(0, 200).replace(/\n/g, ' '));

  // TEST 2: Co-worker
  console.log('\n--- TEST 2: Co-worker (Sam Rivera) ---');
  const t2 = Date.now();
  const res2 = await postWebhook('/webhook/sleeply-coworker-agent', {
    agentCode: 'COWORKER',
    taskTitle: 'Auditoria tecnica de PR #14 y suite Antigravity CLI',
    taskDescription: 'Revisar ramas en GitHub, validar esquema sleeply_db y correr tests',
    operatingMode: 'awake'
  });
  console.log('HTTP Status:', res2.status, `(${Date.now() - t2}ms)`);
  console.log('Agent Code:', res2.body?.agentCode);
  console.log('Bubble Message:', res2.body?.bubbleMessage);
  console.log('Emojis detectados en respuesta:', checkEmojis(JSON.stringify(res2.body)));
  console.log('Meta AI Output snippet:', (res2.body?.output || '').slice(0, 200).replace(/\n/g, ' '));

  // TEST 3: Manager
  console.log('\n--- TEST 3: Manager (Jordan Diaz) ---');
  const t3 = Date.now();
  const res3 = await postWebhook('/webhook/sleeply-manager-agent', {
    agentCode: 'MANAGER',
    taskTitle: 'Auditoria de Modo Sueno y reporte matutino',
    taskDescription: 'Supervisar tareas PostgreSQL, consultar Sentry y compilar reporte matutino',
    operatingMode: 'sleep'
  });
  console.log('HTTP Status:', res3.status, `(${Date.now() - t3}ms)`);
  console.log('Agent Code:', res3.body?.agentCode);
  console.log('Bubble Message:', res3.body?.bubbleMessage);
  console.log('Emojis detectados en respuesta:', checkEmojis(JSON.stringify(res3.body)));
  console.log('Meta AI Output snippet:', (res3.body?.output || '').slice(0, 200).replace(/\n/g, ' '));

  // TEST 4: Orquestador Central
  console.log('\n--- TEST 4: Central Orchestrator Router ---');
  const t4 = Date.now();
  const res4 = await postWebhook('/webhook/sleeply-agent-orchestrator', {
    agentCode: 'COWORKER',
    taskTitle: 'Despacho orquestado para Sam Rivera',
    taskDescription: 'Verificar pipeline de integracion continua y tablas de PostgreSQL',
    operatingMode: 'awake'
  });
  console.log('HTTP Status:', res4.status, `(${Date.now() - t4}ms)`);
  console.log('Orchestrator routed agentCode:', res4.body?.agentCode);
  console.log('Orchestrator bubbleMessage:', res4.body?.bubbleMessage);
  console.log('Emojis detectados en respuesta:', checkEmojis(JSON.stringify(res4.body)));

  // Verificacion de ejecuciones en n8n
  console.log('\n--- VERIFICACION DE ULTIMAS EJECUCIONES EN N8N API ---');
  const execs = await getRecentExecutions(8);
  for (const item of execs.data) {
    console.log(`- ID: ${item.id} | Workflow: ${item.workflowId} | Status: ${item.status} | Mode: ${item.mode}`);
  }

  console.log('\nValidacion completada con exito.');
}

main().catch(err => {
  console.error('Error durante validacion:', err);
  process.exit(1);
});
