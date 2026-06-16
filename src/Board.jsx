import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTaskStore } from "./taskStore";

const COLUMNS = [
  {
    key: "todo",
    title: "Backlog",
    subtitle: "Queued for sprint",
    accent: "border-sky-500/40 bg-sky-500/5",
    badge: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
    dot: "bg-sky-400",
  },
  {
    key: "in-progress",
    title: "In Progress",
    subtitle: "Active development",
    accent: "border-amber-500/40 bg-amber-500/5",
    badge: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    dot: "bg-amber-400",
  },
  {
    key: "done",
    title: "Shipped",
    subtitle: "Deployed to production",
    accent: "border-emerald-500/40 bg-emerald-500/5",
    badge: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
    dot: "bg-emerald-400",
  },
];

const cardVariants = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.88,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

function TaskCard({ task, isDragging, onDragStart, onDragEnd, onDelete }) {
  return (
    <motion.li
      layout
      layoutId={task.id}
      draggable
      onDragStart={(event) => onDragStart(event, task.id)}
      onDragEnd={onDragEnd}
      variants={cardVariants}
      initial="initial"
      animate={
        isDragging
          ? { rotate: 2.5, scale: 1.03, opacity: 0.92, y: -2 }
          : { rotate: 0, scale: 1, opacity: 1, y: 0 }
      }
      exit="exit"
      whileHover={{
        y: -5,
        boxShadow: "0px 12px 24px rgba(0,0,0,0.06)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="group cursor-grab rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
            <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              ENG-{task.id.slice(-3).toUpperCase()}
            </span>
          </div>
          <p className="text-sm font-semibold leading-snug text-slate-800">{task.title}</p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          aria-label={`Delete ${task.title}`}
          title="Delete task"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">Drag to reassign</span>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
          {task.title.charAt(0)}
        </div>
      </div>
    </motion.li>
  );
}

function StatCard({ label, value, trend }) {
  return (
    <motion.div
      layout
      className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{trend}</p>
    </motion.div>
  );
}

export default function Board() {
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const moveTask = useTaskStore((state) => state.moveTask);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const groupedTasks = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === "todo"),
      "in-progress": tasks.filter((task) => task.status === "in-progress"),
      done: tasks.filter((task) => task.status === "done"),
    }),
    [tasks]
  );

  const stats = useMemo(
    () => ({
      total: tasks.length,
      inProgress: groupedTasks["in-progress"].length,
      shipped: groupedTasks.done.length,
      backlog: groupedTasks.todo.length,
    }),
    [tasks, groupedTasks]
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

  const handleDragStart = (event, taskId) => {
    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (event, columnKey) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnKey);
  };

  const handleDrop = (event, columnKey) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    if (taskId) {
      moveTask(taskId, columnKey);
    }
    setDraggingId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,_#f8fafc_0%,_#eef2ff_45%,_#f1f5f9_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white/60 p-6 backdrop-blur-xl lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
              PM
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">NexusFlow</p>
              <p className="text-xs text-slate-500">Enterprise Suite</p>
            </div>
          </div>

          <nav className="space-y-1">
            {["Dashboard", "Sprint Board", "Roadmap", "Analytics"].map((item, index) => (
              <div
                key={item}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  index === 1
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <header className="mb-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                  Engineering · Sprint 24
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Project Management Dashboard
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Orchestrate enterprise delivery workflows with real-time board visibility and
                  drag-and-drop task routing.
                </p>
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
                Last synced · just now
              </div>
            </div>

            <motion.div
              layout
              className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4"
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            >
              <StatCard label="Total Initiatives" value={stats.total} trend="Across all lanes" />
              <StatCard label="Backlog" value={stats.backlog} trend="Awaiting assignment" />
              <StatCard label="In Progress" value={stats.inProgress} trend="Active engineering" />
              <StatCard label="Shipped" value={stats.shipped} trend="Production ready" />
            </motion.div>
          </header>

          <motion.div
            layout
            className="grid grid-cols-1 gap-5 xl:grid-cols-3"
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          >
            <AnimatePresence mode="popLayout">
              {COLUMNS.map((column) => {
                const columnTasks = groupedTasks[column.key];
                const isDropTarget = dragOverColumn === column.key;

                return (
                  <motion.section
                    layout
                    key={column.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    className={`rounded-2xl border p-4 transition-colors md:p-5 ${
                      isDropTarget
                        ? `${column.accent} ring-2 ring-indigo-400/30`
                        : "border-slate-200/80 bg-white/70 shadow-sm backdrop-blur"
                    }`}
                    onDragOver={(event) => handleDragOver(event, column.key)}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={(event) => handleDrop(event, column.key)}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
                          <h2 className="text-base font-bold text-slate-900">{column.title}</h2>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{column.subtitle}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${column.badge}`}
                      >
                        {columnTasks.length}
                      </span>
                    </div>

                    {column.key === "todo" && (
                      <div className="mb-4 flex gap-2">
                        <input
                          value={newTaskTitle}
                          onChange={(event) => setNewTaskTitle(event.target.value)}
                          onKeyDown={handleTitleKeyDown}
                          placeholder="Add engineering initiative..."
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                        />
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={onCreateTask}
                          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
                        >
                          Add
                        </motion.button>
                      </div>
                    )}

                    <motion.ul layout className="min-h-[120px] space-y-3">
                      <AnimatePresence mode="popLayout">
                        {columnTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            isDragging={draggingId === task.id}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDelete={deleteTask}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.ul>

                    {columnTasks.length === 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pointer-events-none py-8 text-center text-xs text-slate-400"
                      >
                        Drop tasks here to update status
                      </motion.p>
                    )}
                  </motion.section>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
