import { beforeEach, describe, expect, it } from "vitest";
import { useTaskStore } from "./src/taskStore";

describe("taskStore", () => {
  beforeEach(() => {
    // Keep actions intact and reset only the tasks slice.
    useTaskStore.setState({ tasks: [] });
  });

  it("adds a new task with default status 'todo'", () => {
    useTaskStore.getState().addTask("Write store tests");

    const { tasks } = useTaskStore.getState();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      title: "Write store tests",
      status: "todo",
    });
    expect(typeof tasks[0].id).toBe("string");
    expect(tasks[0].id.length).toBeGreaterThan(0);
  });

  it("deletes an existing task by id", () => {
    const { addTask, deleteTask } = useTaskStore.getState();
    addTask("Task to delete");

    const createdTaskId = useTaskStore.getState().tasks[0].id;
    deleteTask(createdTaskId);

    const { tasks } = useTaskStore.getState();
    expect(tasks).toHaveLength(0);
    expect(tasks.find((task) => task.id === createdTaskId)).toBeUndefined();
  });

  it("moves a task from 'todo' to 'in-progress' and then to 'done'", () => {
    const { addTask, moveTask } = useTaskStore.getState();
    addTask("Task to move");

    const createdTaskId = useTaskStore.getState().tasks[0].id;

    moveTask(createdTaskId, "in-progress");
    expect(useTaskStore.getState().tasks[0].status).toBe("in-progress");

    moveTask(createdTaskId, "done");
    expect(useTaskStore.getState().tasks[0].status).toBe("done");
  });
});
