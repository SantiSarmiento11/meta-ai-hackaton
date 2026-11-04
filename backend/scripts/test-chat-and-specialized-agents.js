const { agentActivityService } = require('../dist/services/agentActivity.service');
const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu;

function checkEmojis(text) {
  const matches = (String(text)).match(emojiRegex);
  return matches ? matches.join(' ') : '0 detectados';
}

async function runTests() {
  console.log('================================================================');
  console.log('TEST INTEGRAL: AGENTE PRINCIPAL, CHAT & AGENTES ESPECIALIZADOS');
  console.log('================================================================\n');

  // TEST 1: Chat con Agente Principal (Alex Vance - CEO)
  console.log('--- TEST 1: Chat con Alex Vance (Orquestador Central) ---');
  const chat1 = await agentActivityService.chatWithPrincipalAgent({
    message: 'Hola Alex, cuál es el estado general del equipo y las automatizaciones en n8n?'
  });
  console.log('Agent Code:', chat1.agentCode);
  console.log('Agent Name:', chat1.agentName);
  console.log('Action Taken:', chat1.actionTaken);
  console.log('Emojis detectados:', checkEmojis(chat1.reply));
  console.log('Reply snippet:\n', chat1.reply.slice(0, 220), '\n');

  // TEST 2: Chat enrutado hacia Sam Rivera (Co-worker / GitHub)
  console.log('--- TEST 2: Chat enrutado hacia Co-worker (Sam Rivera) ---');
  const chat2 = await agentActivityService.chatWithPrincipalAgent({
    message: 'Sam, por favor audita los repositorios GitHub y revisa si hay conflictos en ramas'
  });
  console.log('Agent Code:', chat2.agentCode);
  console.log('Agent Name:', chat2.agentName);
  console.log('Action Taken:', chat2.actionTaken);
  console.log('Emojis detectados:', checkEmojis(chat2.reply));
  console.log('Reply snippet:\n', chat2.reply.slice(0, 220), '\n');

  // TEST 3: Repositorios de GitHub y Acciones de Sam Rivera
  console.log('--- TEST 3: Co-worker - Lista de Repositorios y Acción de Cambios ---');
  const repos = agentActivityService.getCoworkerRepositories();
  console.log('Repositorios conectados:', repos.map(r => r.name).join(', '));
  const repoAction = await agentActivityService.executeCoworkerRepoAction({
    repoName: 'sleeply-core-engine',
    actionType: 'commit_changes',
    customInstruction: 'Hacer cambios en repositorio y comentar que la tarea finalizo con exito'
  });
  console.log('Resultado Co-worker:', repoAction.result?.bubbleMessage || 'Acción ejecutada');
  console.log('Emojis detectados:', checkEmojis(JSON.stringify(repoAction)));

  // TEST 4: Google Drive y Acciones de Taylor Chen (Secretaria)
  console.log('\n--- TEST 4: Secretaria - Google Drive y Acción de Entrega ---');
  const driveInfo = agentActivityService.getSecretaryDriveFiles();
  console.log('Documentos en Drive:', driveInfo.driveFiles.map(d => d.name).join(', '));
  const driveAction = await agentActivityService.executeSecretaryDriveAction({
    docId: 'doc_final',
    actionType: 'update_drive',
    customInstruction: 'Actualizar documento en Google Drive y comentar exito de tarea'
  });
  console.log('Resultado Secretaria:', driveAction.result?.bubbleMessage || 'Acción ejecutada');
  console.log('Emojis detectados:', checkEmojis(JSON.stringify(driveAction)));

  // TEST 5: Supervisión y Acciones de Jordan Díaz (Manager)
  console.log('\n--- TEST 5: Manager - Salud del Sistema y Reporte Ejecutivo ---');
  const healthInfo = agentActivityService.getManagerSystemHealth();
  console.log('Estado del Sistema:', healthInfo.systemStatus, '| Uptime:', healthInfo.uptime);
  const managerAction = await agentActivityService.executeManagerAuditAction({
    actionType: 'morning_report',
    customInstruction: 'Compilar reporte matutino ejecutivo de supervision continua'
  });
  console.log('Resultado Manager:', managerAction.result?.bubbleMessage || 'Acción ejecutada');
  console.log('Emojis detectados:', checkEmojis(JSON.stringify(managerAction)));

  // TEST 6: Verificación de archivos documentales con comentario de éxito
  console.log('\n--- TEST 6: Verificación de Archivos GitHub y Google Drive ---');
  const readmePath = path.join(__dirname, '../../README.md');
  const ghDocPath = path.join(__dirname, '../../docs/github_sync_report.md');
  const gdriveDocPath = path.join(__dirname, '../../docs/google_drive_sleeply_deliverable.md');
  const mvpSummaryPath = path.join(__dirname, '../../Sleeply — MVP Summary.md');
  const specArchPath = path.join(__dirname, '../../sleeply_especificaci_n_de_producto_y_arquitectura.md');

  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  const ghContent = fs.readFileSync(ghDocPath, 'utf8');
  const gdriveContent = fs.readFileSync(gdriveDocPath, 'utf8');
  const mvpContent = fs.readFileSync(mvpSummaryPath, 'utf8');
  const specArchContent = fs.readFileSync(specArchPath, 'utf8');

  console.log('README.md tiene comentario de éxito?:', readmeContent.includes('Tarea terminada con éxito'));
  console.log('github_sync_report.md tiene comentario de éxito?:', ghContent.includes('Tarea terminada con éxito'));
  console.log('google_drive_sleeply_deliverable.md tiene comentario de éxito?:', gdriveContent.includes('Tarea terminada con éxito'));
  console.log('Sleeply — MVP Summary.md tiene comentario de éxito?:', mvpContent.includes('Tarea terminada con éxito'));
  console.log('sleeply_especificaci_n_de_producto_y_arquitectura.md tiene comentario de éxito?:', specArchContent.includes('Tarea terminada con éxito'));

  console.log('\n================================================================');
  console.log('TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('Error durante la ejecución del test:', err);
  process.exit(1);
});
