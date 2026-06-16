import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTaskStore } from "./taskStore";

const COLUMNS = [
  { key: "todo", title: "To Do", tone: "from-sky-500/20 to-sky-400/5 ring-sky-500/30" },
  {
    key: "in-progress",
    title: "In Progress",
    tone: "from-amber-500/20 to-amber-400/5 ring-amber-500/30",
  },
  { key: "done", title: "Done", tone: "from-emerald-500/20 to-emerald-400/5 ring-emerald-500/30" },
];

const cardVariants = {
  initial: { opacity: 0, y: 14, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 32, mass: 0.9 },
  },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.18, ease: "easeOut" } },
};

function TaskCard({ task, onDelete, onMoveLeft, onMoveRight, canMoveLeft, canMoveRight }) {
  return (
    <motion.li
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group rounded-xl border border-white/10 bg-zinc-900/90 p-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.7)] backdrop-blur"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="pr-2 text-sm font-medium text-zinc-100">{task.title}</p>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="rounded-md p-1.5 text-zinc-500 transition hover:bg-red-500/15 hover:text-red-300"
          aria-label={`Delete ${task.title}`}
          title="Delete task"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onMoveLeft(task.id)}
            disabled={!canMoveLeft}
            className="rounded-md border border-white/10 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 transition hover:border-white/20 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            ← Move
          </button>
          <button
            type="button"
            onClick={() => onMoveRight(task.id)}
            disabled={!canMoveRight}
            className="rounded-md border border-white/10 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 transition hover:border-white/20 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Move →
          </button>
        </div>
      </div>
    </motion.li>
  );
}

export default function Board() {
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const moveTask = useTaskStore((state) => state.moveTask);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const groupedTasks = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === "todo"),
      "in-progress": tasks.filter((task) => task.status === "in-progress"),
      done: tasks.filter((task) => task.status === "done"),
    }),
    [tasks]
  );

  const onCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, "todo");
    setNewTaskTitle("");
  };

  const handleTitleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onCreateTask();
    }
  };

  const moveLeftMap = {
    "in-progress": "todo",
    done: "in-progress",
  };

  const moveRightMap = {
    todo: "in-progress",
    "in-progress": "done",
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#09090b_45%)] px-4 py-8 text-zinc-100 md:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Task Board</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage priorities with smooth drag-like transitions and quick actions.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            {tasks.length} total task{tasks.length === 1 ? "" : "s"}
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        >
          {COLUMNS.map((column) => {
            const columnTasks = groupedTasks[column.key];

            return (
              <motion.section
                layout
                key={column.key}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br ${column.tone} p-4 shadow-[0_25px_70px_-45px_rgba(0,0,0,0.85)] backdrop-blur`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">{column.title}</h2>
                  <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-200 ring-1 ring-white/10">
                    {columnTasks.length}
                  </span>
                </div>

                {column.key === "todo" && (
                  <div className="mb-4 flex gap-2">
                    <input
                      value={newTaskTitle}
                      onChange={(event) => setNewTaskTitle(event.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      placeholder="Add a new task..."
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 transition focus:border-sky-400/60 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.15)]"
                    />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={onCreateTask}
                      className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-sky-950 transition hover:bg-sky-400"
                    >
                      Add
                    </motion.button>
                  </div>
                )}

                <motion.ul layout className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={deleteTask}
                        onMoveLeft={(id) => moveTask(id, moveLeftMap[column.key])}
                        onMoveRight={(id) => moveTask(id, moveRightMap[column.key])}
                        canMoveLeft={Boolean(moveLeftMap[column.key])}
                        canMoveRight={Boolean(moveRightMap[column.key])}
                      />
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </motion.section>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
