const https = require('https');

function postWebhook(path, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = https.request({
      hostname: 'n8n-dev1.auto-node.tech',
      path: '/webhook/' + path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testAll() {
  console.log('--- TEST 1: Chat Principal Webhook ---');
  const t1 = await postWebhook('sleeply-chat-principal', {
    message: 'Hola Alex, dame un reporte del estado de la oficina y el equipo.',
    taskDescription: 'Revisión ejecutiva matutina'
  });
  console.log('Status:', t1.status);
  console.log('Agent:', t1.body?.agentName);
  console.log('Output preview:', t1.body?.output?.slice(0, 150));
  console.log('Brief Report preview:', t1.body?.briefReport?.slice(0, 150));

  console.log('\n--- TEST 2: Secretaria (Taylor Chen) Webhook ---');
  const t2 = await postWebhook('sleeply-secretary-agent', {
    actionName: 'Triage de correos urgentes Gmail',
    customText: 'Revisar bandeja de sansamablogers@gmail.com y documentos Google Drive'
  });
  console.log('Status:', t2.status);
  console.log('Agent:', t2.body?.agentName);
  console.log('Bubble Message:', t2.body?.bubbleMessage);

  console.log('\n--- TEST 3: Co-worker (Sam Rivera) Webhook ---');
  const t3 = await postWebhook('sleeply-coworker-agent', {
    actionName: 'Auditar PR #14 y Code Review',
    customText: 'Verificar repositorio de SantiSarmiento11 y suite de tests'
  });
  console.log('Status:', t3.status);
  console.log('Agent:', t3.body?.agentName);
  console.log('Bubble Message:', t3.body?.bubbleMessage);

  console.log('\n--- TEST 4: Manager (Jordan Díaz) Webhook ---');
  const t4 = await postWebhook('sleeply-manager-agent', {
    actionName: 'Compilar reporte matutino ejecutivo',
    customText: 'Supervisión de salud del sistema, PostgreSQL y Sentry'
  });
  console.log('Status:', t4.status);
  console.log('Agent:', t4.body?.agentName);
  console.log('Bubble Message:', t4.body?.bubbleMessage);
}

testAll().catch(console.error);
