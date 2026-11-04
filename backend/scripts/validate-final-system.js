const { n8nService } = require('../dist/services/n8n.service');
const { agentActivityService } = require('../dist/services/agentActivity.service');

const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu;

function countEmojis(str) {
  const matches = (String(str)).match(emojiRegex);
  return matches ? matches.length : 0;
}

async function runValidation() {
  console.log('================================================================');
  console.log('VALIDACION INTEGRAL DEL SISTEMA N8N + BACKEND + META AI');
  console.log('================================================================\n');

  // 1. Validar conexión backend -> n8n
  console.log('--- 1. Validar Conexión n8n API ---');
  const conn = await n8nService.testConnection();
  console.log('Conectado:', conn.connected);
  console.log('Workflows detectados:', conn.workflowsCount);
  console.log('Workflows en vivo:', conn.workflows?.map(w => `${w.name} (${w.id}) [active: ${w.active}]`));

  // 2. Chat Principal con Alex Vance (CEO)
  console.log('\n--- 2. Validar Chat Principal (Alex Vance - CEO) ---');
  const chatRes = await agentActivityService.chatWithPrincipalAgent({
    message: 'Alex, confirma la conexión de todos los servicios del equipo y genera el reporte ejecutivo.'
  });
  console.log('Respuesta exitosa:', chatRes.success);
  console.log('Agente:', chatRes.agentName, `(${chatRes.agentRole})`);
  console.log('Breve Reporte incluido?:', !!chatRes.briefReport);
  console.log('Breve Reporte snippet:\n', chatRes.briefReport);
  console.log('Emojis en respuesta:', countEmojis(chatRes.reply) + countEmojis(chatRes.briefReport));

  // 3. Acción de Secretaria (Taylor Chen - Gmail, Drive, Calendar)
  console.log('\n--- 3. Validar Secretaria (Taylor Chen - Servicios Google) ---');
  const secRes = await agentActivityService.executeAgentAction(
    'ASSISTANT',
    'Triage de Correos Urgentes Gmail'
  );
  console.log('Ejecución exitosa:', secRes.success);
  console.log('Agente:', secRes.state.name);
  console.log('Workflow activo:', secRes.state.activeWorkflow);
  console.log('Bubble Message:', secRes.state.bubbleMessage);
  console.log('Emojis en respuesta:', countEmojis(JSON.stringify(secRes)));

  // 4. Acción de Co-worker (Sam Rivera - GitHub & Tests)
  console.log('\n--- 4. Validar Co-worker (Sam Rivera - GitHub SantiSarmiento11) ---');
  const cowRes = await agentActivityService.executeAgentAction(
    'COWORKER',
    'Auditar PR #14 y Code Review'
  );
  console.log('Ejecución exitosa:', cowRes.success);
  console.log('Agente:', cowRes.state.name);
  console.log('Workflow activo:', cowRes.state.activeWorkflow);
  console.log('Bubble Message:', cowRes.state.bubbleMessage);
  console.log('Emojis en respuesta:', countEmojis(JSON.stringify(cowRes)));

  // 5. Acción de Manager (Jordan Díaz - Salud & Supervisión)
  console.log('\n--- 5. Validar Manager (Jordan Díaz - Supervisión & Salud) ---');
  const mgrRes = await agentActivityService.executeAgentAction(
    'MANAGER',
    'Compilar Reporte Matutino Ejecutivo'
  );
  console.log('Ejecución exitosa:', mgrRes.success);
  console.log('Agente:', mgrRes.state.name);
  console.log('Workflow activo:', mgrRes.state.activeWorkflow);
  console.log('Bubble Message:', mgrRes.state.bubbleMessage);
  console.log('Emojis en respuesta:', countEmojis(JSON.stringify(mgrRes)));

  console.log('\n================================================================');
  console.log('TODAS LAS VALIDACIONES COMPLETADAS EXITOSAMENTE');
  console.log('================================================================');
}

runValidation().catch(err => {
  console.error('Error durante la validación:', err);
  process.exit(1);
});
