import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, Search, Sun, Moon, ChevronUp, ChevronDown, CheckCheck, X } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const STORAGE_KEY = "aesthetic-todo-v1";

const getModeDuration = (mode) => (mode === "focus" ? 25 * 60 : mode === "shortBreak" ? 5 * 60 : 15 * 60);
const nextModeAfter = (mode, cycleCount) => (mode === "focus" ? ((cycleCount + 1) % 4 === 0 ? "longBreak" : "shortBreak") : "focus");

export default function AestheticTodoApp() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState((typeof window !== "undefined" && localStorage.getItem("theme")) || "light");
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(getModeDuration("focus"));
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("focus");
  const [cycleCount, setCycleCount] = useState(0);

  const inputRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (activeTaskId && !tasks.some((t) => t.id === activeTaskId)) {
      setActiveTaskId(null);
      setIsRunning(false);
    }
  }, [tasks, activeTaskId]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === "focus") {
        const next = cycleCount + 1;
        setCycleCount(next);
        const nm = next % 4 === 0 ? "longBreak" : "shortBreak";
        switchMode(nm, true);
      } else {
        switchMode("focus", true);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const remaining = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);
  const activeTask = useMemo(() => tasks.find((t) => t.id === activeTaskId) || null, [tasks, activeTaskId]);

  const filtered = useMemo(() => {
    let list = tasks;
    if (filter === "active") list = list.filter((t) => !t.completed);
    if (filter === "completed") list = list.filter((t) => t.completed);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [tasks, filter, query]);

  const addTask = (title) => {
    const clean = title.trim();
    if (!clean) return;
    setTasks((prev) => [{ id: uid(), title: clean, completed: false, createdAt: Date.now() }, ...prev]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const toggleTask = (id) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const renameTask = (id, next) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title: next } : t)));
  const clearCompleted = () => setTasks((prev) => prev.filter((t) => !t.completed));
  const completeAll = () => setTasks((prev) => prev.map((t) => ({ ...t, completed: true })));
  const moveTask = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= tasks.length) return;
    setTasks((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr;
    });
  };

  const switchMode = (nextMode, auto = false) => {
    setMode(nextMode);
    setTimeLeft(getModeDuration(nextMode));
    const canRun = auto && (nextMode !== "focus" || !!activeTaskId);
    setIsRunning(!!canRun);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const modeLabel = { focus: "Focus", shortBreak: "Short Break", longBreak: "Long Break" };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`}>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-100 via-sky-50 to-emerald-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950">
        <main className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Aesthetic To‑Do</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{remaining} task{remaining === 1 ? "" : "s"} left · Ctrl/⌘+K to search</p>
              {(mode === "focus" ? activeTaskId : true) && (
                <div className="mt-3 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-500 p-4 text-center text-white shadow-lg">
                  <h2 className="text-lg font-semibold flex items-center justify-center gap-2">
                    {modeLabel[mode]} <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{formatTime(timeLeft)}</span>
                  </h2>
                  <p className="mt-1 text-4xl font-bold tracking-wide">{mode === "focus" && activeTask ? activeTask.title : modeLabel[mode]}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                    <button onClick={() => setIsRunning(!isRunning)} disabled={mode === "focus" && !activeTaskId} className={`rounded-xl px-4 py-2 font-medium backdrop-blur ${mode === "focus" && !activeTaskId ? "bg-white/10 opacity-60 cursor-not-allowed" : "bg-white/20 hover:bg-white/30"}`}>{isRunning ? "Pause" : "Start"}</button>
                    <button onClick={() => switchMode("focus")} className={`rounded-xl px-3 py-2 text-sm ${mode === "focus" ? "bg-white text-indigo-700" : "bg-white/20 text-white"}`}>Focus</button>
                    <button onClick={() => switchMode("shortBreak")} className={`rounded-xl px-3 py-2 text-sm ${mode === "shortBreak" ? "bg-white text-indigo-700" : "bg-white/20 text-white"}`}>Short Break</button>
                    <button onClick={() => switchMode("longBreak")} className={`rounded-xl px-3 py-2 text-sm ${mode === "longBreak" ? "bg-white text-indigo-700" : "bg-white/20 text-white"}`}>Long Break</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur transition hover:shadow-md dark:border-white/10 dark:bg-white/10">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"} mode</span>
            </button>
          </header>

          <section className="rounded-3xl border border-slate-200/70 bg-white/60 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input ref={inputRef} type="text" placeholder="Add a new task…" onKeyDown={(e) => { if (e.key === "Enter") addTask(e.currentTarget.value); }} className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 pr-12 text-slate-800 shadow-inner outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400/60 dark:border-white/10 dark:bg-white/10 dark:text-slate-100" />
                <button onClick={() => addTask(inputRef.current?.value || "")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-slate-200/70 bg-white/90 p-2 text-slate-700 shadow hover:shadow-md dark:border-white/10 dark:bg-white/10 dark:text-slate-200" title="Add task">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="relative sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input ref={searchRef} type="text" placeholder="Search tasks…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-9 py-3 text-slate-800 shadow-inner outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400/60 dark:border-white/10 dark:bg-white/10 dark:text-slate-100" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm dark:bg-white/10">
                {["all", "active", "completed"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 transition ${filter === f ? "bg-white text-slate-900 shadow dark:bg-white/80" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}>{f[0].toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={completeAll} className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-1.5 text-sm text-slate-700 shadow hover:shadow-md dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                  <CheckCheck className="h-4 w-4" />
                  Complete all
                </button>
                <button onClick={clearCompleted} className="inline-flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/80 px-3 py-1.5 text-sm text-rose-700 shadow hover:shadow-md dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
                  <Trash2 className="h-4 w-4" />
                  Clear completed
                </button>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              <AnimatePresence initial={false}>
                {filtered.map((task) => (
                  <motion.li key={task.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 shadow-sm hover:shadow-md dark:border-white/10 dark:bg-white/10">
                    <button onClick={() => toggleTask(task.id)} className={`grid h-6 w-6 place-items-center rounded-full border ${task.completed ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "border-slate-300 text-slate-400 hover:border-slate-400"}`} title={task.completed ? "Mark as active" : "Mark as completed"}>
                      {task.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </button>
                    <TaskTitle key={`title-${task.id}`} value={task.title} onChange={(next) => renameTask(task.id, next)} completed={task.completed} />
                    <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => moveTask(tasks.findIndex((t) => t.id === task.id), tasks.findIndex((t) => t.id === task.id) - 1)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10" title="Move up">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => moveTask(tasks.findIndex((t) => t.id === task.id), tasks.findIndex((t) => t.id === task.id) + 1)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10" title="Move down">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeTask(task.id)} className="rounded-lg p-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-400/10" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => setActiveTaskId(task.id)} className={`rounded-lg border px-2 py-1 text-xs ${activeTaskId === task.id ? "border-indigo-400 bg-indigo-100 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-200" : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-200"}`} title="Set as active task">
                        Focus
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <li className="rounded-2xl border border-dashed border-slate-300/60 p-6 text-center text-slate-500 dark:border-white/10 dark:text-slate-400">Nothing here yet. Add your first task!</li>
              )}
            </ul>
          </section>

          <footer className="mx-auto mt-6 text-center text-xs text-slate-500 dark:text-slate-400">Built with React • Styled with Tailwind • Animations by Framer Motion • Icons by lucide-react</footer>
        </main>
      </div>
    </div>
  );
}

function TaskTitle({ value, onChange, completed }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) setDraft(value);
  }, [editing, value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const clean = draft.trim();
    if (!clean) return setEditing(false);
    if (clean !== value) onChange(clean);
    setEditing(false);
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {!editing ? (
        <button onDoubleClick={() => setEditing(true)} onClick={() => setEditing(true)} className={`min-w-0 flex-1 cursor-text text-left ${completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100"}`} title="Click to edit">
          <span className="block truncate">{value}</span>
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <input ref={inputRef} type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }} className="min-w-0 flex-1 rounded-xl border border-slate-300/70 bg-white/70 px-3 py-1.5 text-slate-800 shadow-inner outline-none focus:ring-2 focus:ring-indigo-400/60 dark:border-white/10 dark:bg-white/10 dark:text-slate-100" />
          <button onClick={commit} className="rounded-lg border border-emerald-200/60 bg-emerald-50/80 p-1 text-emerald-700 shadow hover:shadow-md dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200" title="Save">
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-200/70 bg-white/80 p-1 text-slate-600 shadow hover:shadow-md dark:border-white/10 dark:bg-white/10 dark:text-slate-300" title="Cancel">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

(function runTests() {
  try {
    console.assert(getModeDuration("focus") === 1500, "focus duration should be 1500s");
    console.assert(getModeDuration("shortBreak") === 300, "shortBreak duration should be 300s");
    console.assert(getModeDuration("longBreak") === 900, "longBreak duration should be 900s");
    console.assert(nextModeAfter("focus", 0) === "shortBreak", "after first focus -> shortBreak");
    console.assert(nextModeAfter("focus", 3) === "longBreak", "after 4th focus -> longBreak");
    console.assert(nextModeAfter("shortBreak", 1) === "focus", "after break -> focus");
    console.assert(nextModeAfter("longBreak", 99) === "focus", "after long break -> focus");
    const fmt = (s) => {
      const m = Math.floor(s / 60).toString().padStart(2, "0");
      const ss = (s % 60).toString().padStart(2, "0");
      return `${m}:${ss}`;
    };
    console.assert(fmt(0) === "00:00" && fmt(65) === "01:05" && fmt(3599) === "59:59", "formatTime correctness");
    console.log("✅ Dev tests passed");
  } catch (e) {
    console.error("❌ Dev tests failed", e);
  }
})();
