import { agentActivityService } from '../src/services/agentActivity.service';

const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu;

async function run() {
  console.log('Testing AgentActivityService.executeAgentAction with live n8n...\n');

  console.log('--- Invoking COWORKER Action ---');
  const res = await agentActivityService.executeAgentAction('COWORKER', 'Revisión técnica de Pull Request y base de datos');

  console.log('Success:', res.success);
  console.log('n8nDispatched:', res.result.n8nDispatched);
  console.log('Agent:', res.result.agent);
  console.log('Bubble Message:', res.state.bubbleMessage);
  console.log('Current Action:', res.state.currentAction);

  const rawJson = JSON.stringify(res);
  const matches = rawJson.match(emojiRegex);
  console.log('Emojis encontrados:', matches ? matches.join(' ') : '0 detectados');
  console.log('\nMeta AI Output snippet:', String(res.result.metaAiResponse).slice(0, 300));
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
