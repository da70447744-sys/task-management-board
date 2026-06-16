import { create } from "zustand";

/**
 * @typedef {"todo" | "in-progress" | "done"} TaskStatus
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {TaskStatus} status
 */

/**
 * @typedef {Object} TaskStore
 * @property {Task[]} tasks
 * @property {(title: string, status?: TaskStatus) => void} addTask
 * @property {(id: string) => void} deleteTask
 * @property {(id: string, nextStatus: TaskStatus) => void} moveTask
 */

/** @type {Task[]} */
export const INITIAL_TASKS = [
  { id: "ent-001", title: "Optimize Database Indexing", status: "todo" },
  { id: "ent-002", title: "Implement JWT Authentication Flow", status: "todo" },
  { id: "ent-003", title: "Integrate Stripe Payment Gateway", status: "in-progress" },
  { id: "ent-004", title: "Setup GitHub Actions CI/CD Pipeline", status: "in-progress" },
  { id: "ent-005", title: "Configure Redis Caching Layer", status: "done" },
  { id: "ent-006", title: "Refactor REST API to GraphQL", status: "done" },
];

/**
 * @returns {string}
 */
const makeTaskId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

/** @type {TaskStatus} */
const DEFAULT_STATUS = "todo";

/** @type {TaskStore} */
export const useTaskStore = create((set) => ({
  tasks: INITIAL_TASKS,

  addTask: (title, status = DEFAULT_STATUS) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: makeTaskId(),
          title: trimmedTitle,
          status,
        },
      ],
    }));
  },

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  moveTask: (id, nextStatus) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status: nextStatus } : task
      ),
    })),
}));
