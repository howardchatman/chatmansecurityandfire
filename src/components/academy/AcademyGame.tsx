"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  CircleCheck,
  ClipboardCheck,
  BookOpen,
  GraduationCap,
  Medal,
  Phone,
  Play,
  Printer,
  RotateCcw,
  Share2,
  Star,
  Trophy,
} from "lucide-react";
import { Flames, MiniHead, Spray, SprayDefs } from "./art";
import { HornStrobe, SmokeDetector } from "./art-alarm";
import { Extinguisher } from "./art-extinguisher";
import { type LevelResult, starsFor } from "./ui";
import { COURSES, type Course, type CourseId, EXAM, findLevel } from "./courses";
import { EXAM_LENGTH, EXAM_PASS } from "./content/exam";

type Best = { score: number; max: number; stars: number };
type Progress = Partial<Record<string, Best>>;

const STORAGE_KEY = "csf-academy-v1";
const NAME_KEY = "csf-academy-name";

function readProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Progress;
  } catch {
    return {};
  }
}

function writeProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // Private mode or storage blocked: progress just won't survive a reload.
  }
}

function rankFor(pct: number) {
  if (pct >= 0.9) return "Fire Marshal Material";
  if (pct >= 0.75) return "Fire Protection Pro";
  if (pct >= 0.5) return "Apprentice";
  return "Rookie";
}

function courseStats(course: Course, progress: Progress) {
  const done = course.levels.filter((l) => progress[l.id]);
  return {
    done: done.length,
    complete: done.length === course.levels.length,
    score: course.levels.reduce((s, l) => s + (progress[l.id]?.score ?? 0), 0),
    max: course.levels.reduce((s, l) => s + (progress[l.id]?.max ?? 0), 0),
    stars: course.levels.reduce((s, l) => s + (progress[l.id]?.stars ?? 0), 0),
    nextUp: course.levels.find((l) => !progress[l.id]) ?? null,
  };
}

type View =
  | { kind: "hub" }
  | { kind: "play"; id: string; run: number }
  | { kind: "done"; id: string; result: LevelResult; newBest: boolean };

export default function AcademyGame() {
  const [progress, setProgress] = useState<Progress>({});
  const [view, setView] = useState<View>({ kind: "hub" });
  const [courseId, setCourseId] = useState<CourseId>("sprinklers");
  const [name, setName] = useState("");

  // Saved progress lives in this browser only; load it (and any course named
  // in the URL hash) after mount so the server and first client render match.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(readProgress());
    try {
      setName(localStorage.getItem(NAME_KEY) || "");
    } catch {}
    const fromHash = COURSES.find((c) => `#${c.hash}` === window.location.hash);
    if (fromHash) setCourseId(fromHash.id);
  }, []);

  useEffect(() => {
    if (view.kind !== "hub") {
      // Jump, don't glide: the page's smooth scrolling makes level changes feel slow.
      document.getElementById("academy-play")?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [view]);

  const course = COURSES.find((c) => c.id === courseId)!;
  const stats = courseStats(course, progress);
  const completedCourses = COURSES.filter((c) => courseStats(c, progress).complete);
  const anyPlayed = COURSES.some((c) => courseStats(c, progress).done > 0);
  const exam = progress[EXAM.id];
  const examPassed = !!exam && exam.score / exam.max >= EXAM_PASS;

  const chooseCourse = (id: CourseId) => {
    setCourseId(id);
    const c = COURSES.find((x) => x.id === id)!;
    try {
      history.replaceState(null, "", `#${c.hash}`);
    } catch {}
  };

  const play = (id: string) => {
    const found = findLevel(id);
    if (found?.course) setCourseId(found.course.id);
    setView({ kind: "play", id, run: Date.now() });
  };

  const finish = (id: string, result: LevelResult) => {
    const prev = progress[id];
    if (!prev || result.score > prev.score) {
      const next = { ...progress, [id]: { ...result, stars: starsFor(result.score, result.max) } };
      setProgress(next);
      writeProgress(next);
    }
    setView({ kind: "done", id, result, newBest: !!prev && result.score > prev.score });
  };

  const toHub = (anchor?: string) => {
    setView({ kind: "hub" });
    setTimeout(() => document.getElementById(anchor ?? "academy-play")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  if (view.kind === "play") {
    const { level } = findLevel(view.id)!;
    return (
      <section id="academy-play" className="academy-grid min-h-[calc(100svh-5rem)] scroll-mt-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-5 sm:py-8">
          <level.Component key={view.run} onFinish={(r) => finish(level.id, r)} onExit={() => toHub()} />
        </div>
      </section>
    );
  }

  if (view.kind === "done" && view.id === EXAM.id) {
    const pct = Math.round((view.result.score / view.result.max) * 100);
    const passed = view.result.score / view.result.max >= EXAM_PASS;
    return (
      <section id="academy-play" className="academy-grid min-h-[calc(100svh-5rem)] scroll-mt-20">
        <div className="mx-auto max-w-lg px-4 sm:px-6 py-10 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-700">Final Exam</p>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className={`mx-auto mt-5 w-28 h-28 rounded-full flex items-center justify-center ${
              passed ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {passed ? <Medal className="w-14 h-14" /> : <GraduationCap className="w-14 h-14" />}
          </motion.div>
          <h2 className="mt-5 text-3xl font-extrabold text-gray-900">{passed ? "You passed!" : "Not yet"}</h2>
          <p className="mt-3 text-5xl font-black text-gray-900 tabular-nums">{pct}%</p>
          <p className="mt-1 text-gray-600">
            {view.result.score / 100} of {view.result.max / 100} correct · {Math.round(EXAM_PASS * 100)}% to pass
            {view.newBest ? " · new personal best!" : ""}
          </p>
          <p className="mt-4 text-gray-700">
            {passed
              ? "That's a real grasp of sprinklers, alarms, extinguishers, and the NFPA codes behind them. It's on your certificate."
              : "Brush up with the courses where you missed questions, then try again. Every attempt draws a new mix."}
          </p>
          <div className="mt-8 grid gap-3">
            {passed && (
              <button
                onClick={() => toHub("academy-certificate")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 transition-colors"
              >
                <Award className="w-5 h-5" />
                See your certificate
              </button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => play(EXAM.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 font-bold py-3 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={() => toHub()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 font-bold py-3 transition-colors"
              >
                All courses
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (view.kind === "done") {
    const found = findLevel(view.id)!;
    const c = found.course!;
    const { level, index } = found;
    const following = c.levels[index + 1];
    const cStats = courseStats(c, progress);
    // The next unfinished course after this one, wrapping around.
    const ci = COURSES.indexOf(c);
    const nextCourse = [...COURSES.slice(ci + 1), ...COURSES.slice(0, ci)].find((x) => !courseStats(x, progress).complete);
    const stars = starsFor(view.result.score, view.result.max);
    const pct = Math.round((view.result.score / view.result.max) * 100);
    return (
      <section id="academy-play" className="academy-grid min-h-[calc(100svh-5rem)] scroll-mt-20">
        <div className="mx-auto max-w-lg px-4 sm:px-6 py-10 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-700">
            {c.name} · Level {index + 1} complete
          </p>
          <h2 className="mt-1 text-3xl font-extrabold text-gray-900">{level.title}</h2>
          <div className="mt-6 flex justify-center gap-3" aria-label={`${stars} of 3 stars`}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.25 + i * 0.25, type: "spring", stiffness: 260, damping: 14 }}
              >
                <Star className={`w-14 h-14 ${i < stars ? "fill-orange-500 text-orange-600" : "fill-gray-200 text-gray-300"}`} />
              </motion.div>
            ))}
          </div>
          <p className="mt-5 text-5xl font-black text-gray-900 tabular-nums">
            {view.result.score}
            <span className="text-2xl text-gray-400 font-bold"> / {view.result.max}</span>
          </p>
          <p className="mt-1 text-gray-600">
            {pct}%{view.newBest ? " · new personal best!" : ""}
          </p>
          <p className="mt-4 text-gray-700">
            {stars === 3
              ? "Flawless work. You'd be a welcome hand on any job site."
              : stars === 2
                ? "Solid. Replay it for the third star?"
                : "You got through it, and now you know more than most building owners. Replay to lock it in."}
          </p>

          <div className="mt-8 grid gap-3">
            {following ? (
              <button
                onClick={() => play(following.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 transition-colors"
              >
                Next: {following.title}
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => toHub(cStats.complete ? "academy-certificate" : "academy-play")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 transition-colors"
              >
                <Award className="w-5 h-5" />
                {cStats.complete ? "Get your certificate" : "Back to the levels"}
              </button>
            )}
            {!following && cStats.complete && nextCourse && (
              <button
                onClick={() => {
                  chooseCourse(nextCourse.id);
                  toHub();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 transition-colors"
              >
                <nextCourse.icon className="w-5 h-5" />
                Start the {nextCourse.name} course
              </button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => play(view.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 font-bold py-3 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Replay
              </button>
              <button
                onClick={() => toHub()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 font-bold py-3 transition-colors"
              >
                All levels
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const heroLabel = !anyPlayed
    ? "Start playing"
    : stats.nextUp
      ? `Continue ${course.name}: Level ${course.levels.indexOf(stats.nextUp) + 1}`
      : `Replay ${course.name}`;

  return (
    <>
      {/* Hero */}
      <section className="bg-neutral-950 text-white overflow-hidden print:hidden">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div>
            <div className="flex items-center gap-2 text-orange-500 text-sm font-semibold uppercase tracking-wider mb-3">
              <GraduationCap className="w-4 h-4" />
              Free learning games
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Fire Protection <span className="text-orange-500">Academy</span>
            </h1>
            <p className="mt-3 text-xl text-neutral-200 font-semibold">
              Learn how fire sprinklers, fire alarms, and extinguishers actually work, and the NFPA codes behind them.
            </p>
            <p className="mt-3 text-neutral-400 max-w-xl">
              Four courses and a final exam. Name the parts, read an alarm panel, put out a fire with P.A.S.S., match
              NFPA standards, schedule inspections, and walk a building like a fire marshal. No sign-up.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => play((stats.nextUp ?? course.levels[0]).id)}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-colors"
              >
                <Play className="w-5 h-5 fill-white" />
                {heroLabel}
              </button>
              <Link
                href="/academy/nfpa"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                NFPA study guide
              </Link>
              {completedCourses.length > 0 && (
                <span className="text-sm text-neutral-400">
                  {completedCourses.length}/{COURSES.length} courses complete
                </span>
              )}
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* Course picker and level select */}
      <section id="academy-play" className="academy-grid py-10 sm:py-14 scroll-mt-20 print:hidden">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Choose a course</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4" role="tablist" aria-label="Courses">
            {COURSES.map((c) => {
              const s = courseStats(c, progress);
              const active = c.id === courseId;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => chooseCourse(c.id)}
                  className={`rounded-2xl border-2 p-3 sm:p-5 text-left transition-all ${
                    active
                      ? "bg-neutral-900 border-neutral-900 text-white shadow-lg"
                      : "bg-white border-gray-200 hover:border-orange-300 text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <c.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${active ? "text-orange-400" : "text-orange-600"}`} />
                    {s.complete && <CircleCheck className="w-5 h-5 text-green-500" />}
                  </div>
                  <div className="mt-2 sm:mt-3 font-extrabold leading-tight text-sm sm:text-lg">{c.name}</div>
                  <div className={`mt-1 text-xs sm:text-sm ${active ? "text-neutral-400" : "text-gray-500"}`}>
                    {s.done}/{c.levels.length} levels
                    <span className="hidden sm:inline"> · {s.stars}/{c.levels.length * 3} stars</span>
                  </div>
                  <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${active ? "bg-white/15" : "bg-gray-100"}`}>
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(s.done / c.levels.length) * 100}%` }} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 mb-5">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">{course.name}</h3>
              <p className="text-gray-600 mt-1">{course.tagline}</p>
              {course.id === "nfpa" && (
                <Link href="/academy/nfpa" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 hover:text-orange-800">
                  <BookOpen className="w-4 h-4" />
                  Read the NFPA study guide first
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            {stats.done > 0 && (
              <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-200 px-4 py-2.5 shadow-sm">
                <Trophy className="w-6 h-6 text-orange-600" />
                <div className="leading-tight">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Course rank</div>
                  <div className="font-extrabold text-gray-900">{rankFor(stats.max ? stats.score / stats.max : 0)}</div>
                </div>
                <div className="pl-3 ml-1 border-l border-gray-200 leading-tight">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Score</div>
                  <div className="font-extrabold text-gray-900 tabular-nums">{stats.score}</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" role="tabpanel" aria-label={course.name}>
            {course.levels.map((l, i) => {
              const best = progress[l.id];
              const isNext = stats.nextUp?.id === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => play(l.id)}
                  className={`group text-left rounded-2xl bg-white border-2 p-5 shadow-sm hover:shadow-lg transition-all ${
                    isNext ? "border-orange-500" : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`p-3 rounded-xl ${best ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-700"}`}>
                          <l.icon className="w-6 h-6" />
                        </div>
                        <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex gap-0.5" aria-label={`${best?.stars ?? 0} of 3 stars`}>
                        {[0, 1, 2].map((s) => (
                          <Star
                            key={s}
                            className={`w-5 h-5 ${s < (best?.stars ?? 0) ? "fill-orange-500 text-orange-600" : "fill-gray-100 text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {isNext && (
                      <span className="rounded-full bg-orange-600 text-white text-xs font-bold px-2.5 py-1">
                        {stats.done === 0 ? "Start here" : "Up next"}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-4 text-lg font-extrabold text-gray-900 group-hover:text-orange-700 transition-colors">{l.title}</h4>
                  <p className="mt-1 text-sm text-gray-600">{l.blurb}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      ~{l.minutes} min{best ? ` · best ${best.score}/${best.max}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-orange-600">
                      {best ? "Replay" : "Play"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </button>
              );
            })}

            <div className="rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/60 p-5 flex flex-col justify-center">
              <Award className="w-8 h-8 text-orange-600" />
              <h4 className="mt-3 text-lg font-extrabold text-gray-900">Earn your certificate</h4>
              <p className="mt-1 text-sm text-gray-600">
                {stats.complete
                  ? `${course.name} is done. It's on your certificate below.`
                  : `Finish all ${course.levels.length} ${course.name} levels to add this course to a printable certificate. ${
                      course.levels.length - stats.done
                    } to go.`}
              </p>
            </div>
          </div>

          {/* Final exam */}
          <div className="mt-10 rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 grid md:grid-cols-[auto_1fr_auto] gap-5 md:gap-8 items-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${examPassed ? "bg-green-600" : "bg-orange-600"}`}>
              {examPassed ? <Medal className="w-9 h-9" /> : <GraduationCap className="w-9 h-9" />}
            </div>
            <div>
              <h3 className="text-2xl font-extrabold">Final Exam</h3>
              <p className="mt-1 text-neutral-400">
                {EXAM_LENGTH} questions drawn from all {COURSES.length} courses, a new mix every time. Score{" "}
                {Math.round(EXAM_PASS * 100)}% to pass and earn honors on your certificate.
                {completedCourses.length < COURSES.length && " Best taken after the courses."}
              </p>
              {exam && (
                <p className={`mt-2 text-sm font-bold ${examPassed ? "text-green-400" : "text-orange-300"}`}>
                  Best: {Math.round((exam.score / exam.max) * 100)}% · {examPassed ? "Passed" : "Not passed yet"}
                </p>
              )}
            </div>
            <button
              onClick={() => play(EXAM.id)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-colors"
            >
              {exam ? "Retake the exam" : "Take the exam"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {(completedCourses.length > 0 || examPassed) && (
        <Certificate
          name={name}
          setName={(n) => {
            setName(n);
            try {
              localStorage.setItem(NAME_KEY, n);
            } catch {}
          }}
          courses={completedCourses.map((c) => ({ name: c.name, levels: c.levels.length, ...courseStats(c, progress) }))}
          examPct={examPassed && exam ? Math.round((exam.score / exam.max) * 100) : null}
        />
      )}

      {/* Real-world CTA */}
      <section className="bg-neutral-950 py-14 print:hidden">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Would your building pass <span className="text-orange-500">the walkthrough</span>?
            </h2>
            <p className="mt-3 text-neutral-400 max-w-2xl">
              Shut sprinkler valves, ignored trouble signals, and overdue extinguisher tags are some of the most common
              things we fix after a failed inspection. Our licensed technicians inspect, test, and repair fire sprinklers,
              fire alarms, and extinguishers across the Houston area.
            </p>
          </div>
          <div className="grid gap-3">
            <Link
              href="/request-quote"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-colors"
            >
              Schedule an inspection
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/checklist"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full text-sm transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                Free checklist
              </Link>
              <a
                href="tel:+13468525540"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                (346) 852-5540
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

type CertCourse = { name: string; levels: number; score: number; max: number; stars: number };

function Certificate({
  name,
  setName,
  courses,
  examPct,
}: {
  name: string;
  setName: (n: string) => void;
  courses: CertCourse[];
  examPct: number | null;
}) {
  const [shared, setShared] = useState("");
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const score = courses.reduce((s, c) => s + c.score, 0);
  const max = courses.reduce((s, c) => s + c.max, 0);
  const stars = courses.reduce((s, c) => s + c.stars, 0);
  const starsMax = courses.reduce((s, c) => s + c.levels * 3, 0);
  const rank = rankFor(max ? score / max : (examPct ?? 0) / 100);
  const graduate = courses.length === COURSES.length;
  const honors = graduate && examPct !== null;

  const share = async () => {
    const url = "https://www.chatmansecurityandfire.com/academy";
    const text = `I finished ${courses.length} of ${COURSES.length} courses in the Fire Protection Academy and ranked "${rank}". Think you can beat me?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Fire Protection Academy", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShared("Link copied. Paste it anywhere.");
    } catch {
      // Share sheet dismissed, or clipboard blocked.
    }
  };

  return (
    <section id="academy-certificate" className="bg-white py-12 sm:py-16 scroll-mt-20 print:py-0">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="print:hidden mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Your certificate</h2>
          <p className="text-gray-600 mt-1">
            {honors
              ? "Every course and the final exam. Add your name, then print it or share your score."
              : graduate
                ? "Every course done. Pass the final exam to add honors."
                : `It lists every course you finish. ${COURSES.length - courses.length} more to graduate.`}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Your name"
              aria-label="Name for the certificate"
              className="flex-1 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none px-4 py-3 text-gray-900"
            />
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 transition-colors"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={share}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-bold px-5 py-3 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Challenge a friend
            </button>
          </div>
          {shared && <p className="mt-2 text-sm text-green-700 font-medium">{shared}</p>}
        </div>

        <div className="relative rounded-2xl border-[10px] border-double border-orange-600 bg-[#fffdf7] px-6 py-10 sm:px-12 text-center shadow-xl print:shadow-none">
          <img src="/csf_wide_logo.png" alt="Chatman Security & Fire" width={300} height={100} className="mx-auto h-14 w-auto" />
          <p className="mt-6 text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-orange-700">
            {honors ? "Graduate with Honors" : graduate ? "Academy Graduate" : "Certificate of Completion"}
          </p>
          <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">Fire Protection Academy</h3>
          <p className="mt-6 text-gray-600">This certifies that</p>
          <p className="mt-2 text-3xl sm:text-4xl font-serif italic text-gray-900 border-b-2 border-gray-300 inline-block min-w-[60%] pb-1">
            {name.trim() || "Your Name"}
          </p>
          <p className="mt-4 text-gray-600">
            {courses.length === 0
              ? "passed:"
              : `completed ${graduate ? "every course" : courses.length === 1 ? "the course" : "the courses"}${
                  examPct !== null ? " and passed the final exam" : ""
                }:`}
          </p>
          <ul className="mt-3 inline-grid gap-1.5 text-left">
            {examPct !== null && (
              <li className="flex items-center gap-2 text-gray-900">
                <Medal className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span className="font-bold">Final Exam</span>
                <span className="text-gray-500 tabular-nums text-sm">passed, {examPct}%</span>
              </li>
            )}
            {courses.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-gray-900">
                <CircleCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="font-bold">{c.name}</span>
                <span className="text-gray-500 tabular-nums text-sm">
                  {c.score}/{c.max}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Rank</div>
              <div className="font-extrabold text-gray-900 text-lg">{rank}</div>
            </div>
            {courses.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Stars</div>
                <div className="font-extrabold text-gray-900 text-lg">
                  {stars} / {starsMax}
                </div>
              </div>
            )}
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Date</div>
              <div className="font-extrabold text-gray-900 text-lg">{today}</div>
            </div>
          </div>
          <p className="mt-8 text-[11px] text-gray-400">
            A free learning game from Chatman Security &amp; Fire, Inc. · chatmansecurityandfire.com/academy · Not a
            professional license or training credential.
          </p>
        </div>
      </div>
    </section>
  );
}

function HeroArt() {
  return (
    <div className="hidden sm:block">
      <div className="academy-grid rounded-3xl p-4 border border-white/10 shadow-2xl rotate-1">
        <svg viewBox="0 0 300 220" className="w-full h-auto" role="img" aria-label="A sprinkler spraying a small fire, with a smoke detector, horn/strobe, and extinguisher nearby">
          <SprayDefs />
          <rect x={0} y={0} width={300} height={26} fill="#d9d2c0" />
          <line x1={0} y1={13} x2={300} y2={13} stroke="#c62828" strokeWidth={7} />
          {[60, 150].map((x) => (
            <line key={x} x1={x} y1={13} x2={x} y2={32} stroke="#c62828" strokeWidth={4} />
          ))}
          <rect x={0} y={26} width={300} height={6} fill="#ece4d2" />
          <MiniHead x={60} y={32} scale={1.4} />
          <MiniHead x={150} y={32} scale={1.4} open />
          <SmokeDetector x={232} y={32} s={1.3} led="#ef4444" />
          <HornStrobe x={262} y={86} s={1.15} flashing />
          <Spray x={150} y={63} length={128} spread={62} />
          <rect x={0} y={196} width={300} height={24} fill="#cbbf9f" />
          <path d="M137,176 L163,176 L160,196 L140,196 Z" fill="#6b7280" stroke="#374151" strokeWidth={1.2} />
          <Flames x={150} y={178} size={0.65} />
          <rect x={248} y={124} width={28} height={9} rx={1} fill="#dc2626" />
          <text x={262} y={131} textAnchor="middle" fontSize={4.6} fontWeight={800} fill="#fff">
            FIRE EXT.
          </text>
          <Extinguisher x={262} y={196} s={0.3} />
        </svg>
      </div>
    </div>
  );
}
