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

/**
 * Simple ID generator that is fast and collision-resistant enough
 * for client-side task creation in a local board.
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
  tasks: [],

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
