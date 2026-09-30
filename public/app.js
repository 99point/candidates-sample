const list = document.querySelector('#tasks');
const form = document.querySelector('#new-task');

async function load() {
  const [config, tasks] = await Promise.all([fetch('/api/config').then((r) => r.json()), fetch('/api/tasks').then((r) => r.json())]);
  document.querySelector('#title').textContent = config.title;
  list.replaceChildren(...tasks.map(render));
}

function render(task) {
  const item = document.createElement('li');
  item.className = task.status;
  const label = document.createElement('span');
  label.textContent = task.title + (task.due ? ` · due ${task.due}` : '');
  item.append(label);
  if (task.status === 'open') {
    const done = document.createElement('button');
    done.textContent = 'Done';
    done.onclick = async () => {
      await fetch(`/api/tasks/${task.id}/complete`, { method: 'POST' });
      load();
    };
    item.append(done);
  }
  return item;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  await fetch('/api/tasks', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: data.get('title'), due: data.get('due') || null }) });
  form.reset();
  load();
});

load();
