// Lightweight frontend for creating and viewing automation rules
const API_BASE = 'http://localhost:3001';

async function loadRules(){
  try {
    const res = await fetch(`${API_BASE}/rules`);
    const rules = await res.json();
    renderRules(rules);
  } catch (e) {
    console.error('Failed to load rules', e);
  }
}

function renderRules(rules){
  const holder = document.getElementById('rules');
  holder.innerHTML = '';
  if(!rules || rules.length===0){ holder.innerHTML = '<em>No hay reglas definidas</em>'; return; }
  rules.forEach(r => {
    const div = document.createElement('div');
    div.className = 'rule';
    div.innerHTML = `
      <strong>${r.name}</strong>
      <span class="badge">Trigger: ${r.trigger.type}</span>
      <span class="badge">Block: ${r.trigger.blockId}</span>
      <span class="badge">Time: ${r.trigger.timeLeft} s</span>
      <span class="badge">Action: ${r.action.type}</span>
      <span class="badge">Msg: ${r.action.message}</span>
    `;
    holder.appendChild(div);
  });
}

async function saveRule(e){
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const triggerType = document.getElementById('triggerType').value;
  const blockId = document.getElementById('blockId').value.trim();
  const timeLeft = parseInt(document.getElementById('timeLeft').value, 10) || 0;
  const actionType = document.getElementById('actionType').value;
  const message = document.getElementById('message').value.trim();

  const rule = {
    name,
    trigger: { type: triggerType, blockId, timeLeft },
    action: { type: actionType, message }
  };
  try {
    const res = await fetch(`${API_BASE}/rules`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(rule)
    });
    if(res.ok){
      document.getElementById('name').value = '';
      document.getElementById('blockId').value = '';
      loadRules();
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || JSON.stringify(err)));
    }
  } catch(e){ console.error(e); }
}

async function simulateEvent(){
  const blockId = document.getElementById('simBlock').value;
  const timeLeft = parseInt(document.getElementById('simTime').value, 10) || 0;
  if(!blockId){ alert('Ingrese blockId'); return; }
  await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ blockId, timeLeft })
  });
  loadAlerts();
}

async function loadAlerts(){
  try {
    const res = await fetch(`${API_BASE}/alerts`);
    const items = await res.json();
    const holder = document.getElementById('alerts');
    holder.innerHTML = items.map(a => `<div>${a.at} - ${a.message} (rule ${a.ruleId})</div>`).join('') || '<em>No alerts yet</em>';
  } catch(e){ console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('ruleForm').addEventListener('submit', saveRule);
  document.getElementById('simulateBtn').addEventListener('click', simulateEvent);
  loadRules();
  loadAlerts();
});
