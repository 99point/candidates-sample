import type { Task } from '../tasks/task.js';
import { Document } from './document.js';

export interface BoardProps {
  title: string;
  tasks: Task[];
  /** Why the add form was refused. */
  error?: string;
}

/** The board: the add form, then every task. */
export function Board({ title, tasks, error }: BoardProps) {
  return (
    <Document title={title}>
      <h1>{title}</h1>
      <form class="add" method="post" action="/tasks">
        <input name="title" aria-label="Title" placeholder="New task" autocomplete="off" required />
        <input name="due" aria-label="Due" type="date" />
        <input name="owner" aria-label="Owner" placeholder="Owner" autocomplete="off" />
        <input name="tags" aria-label="Tags" placeholder="Tags" autocomplete="off" />
        <button type="submit">Add</button>
      </form>
      {error === undefined ? null : (
        <p class="error" role="alert">
          {error}
        </p>
      )}
      <ul class="tasks">
        {tasks.map((task) => (
          <TaskItem task={task} />
        ))}
      </ul>
    </Document>
  );
}

function TaskItem({ task }: { task: Task }) {
  return (
    <li class={`task ${task.status}`}>
      <span class="title">{task.title}</span>
      {task.due === undefined ? null : <time datetime={task.due}>{task.due}</time>}
      {task.owner === undefined ? null : <span class="owner">{task.owner}</span>}
      {task.tags.map((tag) => (
        <span class="tag">{tag}</span>
      ))}
      {task.status === 'open' ? (
        <form method="post" action={`/tasks/${task.id}/complete`}>
          <button type="submit">Done</button>
        </form>
      ) : (
        <span class="status">Done</span>
      )}
    </li>
  );
}
