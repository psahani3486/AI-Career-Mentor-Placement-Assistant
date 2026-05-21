"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function RoadmapPage() {
  const [goal, setGoal] = useState("Full Stack Web Developer");
  const [skills, setSkills] = useState("");
  const [weeks, setWeeks] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Roadmap parameters
  const [roadmap, setRoadmap] = useState<any>(null);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
      const res = await api.generateRoadmap(goal, skillsArray, weeks);
      
      setRoadmap(res);
      setCheckedTasks({});
    } catch (err: any) {
      setError(err.message || "Failed to generate roadmap. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = (taskName: string) => {
    setCheckedTasks(prev => ({
      ...prev,
      [taskName]: !prev[taskName]
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Agentic AI <span className="gradient-text">Roadmap Planner</span>
        </h1>
        <p className="text-sm text-muted mt-1.5">
          Leverage cooperative CrewAI planner agents to build chronological week-by-week placement readiness programs.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger font-medium animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {/* Grid Settings vs Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Box (Left Column) */}
        <div className="lg:col-span-1 glass rounded-2xl p-6 border-white/5 space-y-5 h-fit">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Configure Goal Plan
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Target Profession / Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. ML Engineer, DevOps Specialist"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Your Current Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, basic HTML"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Program Duration (Weeks)
              </label>
              <select
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d0d14] border border-white/10 text-white focus:outline-none focus:border-primary transition-premium text-sm"
              >
                {[4, 6, 8, 10, 12].map((w) => (
                  <option key={w} value={w}>
                    {w} Weeks Program
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white shadow-lg transition-premium glow-purple mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "🗺️ Generate Program"
              )}
            </button>
          </div>
        </div>

        {/* Timeline Visualization (Right Columns) */}
        <div className="lg:col-span-2">
          {roadmap ? (
            <div className="space-y-8 animate-fade-in-up">
              
              {/* Meta */}
              <div className="glass rounded-2xl p-5 border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Target Objective</span>
                  <h3 className="text-base font-extrabold text-white">{roadmap.goal}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Duration</span>
                  <p className="text-sm font-extrabold text-white">{roadmap.duration_weeks} Weeks</p>
                </div>
              </div>

              {/* Vertical Timeline Nodes */}
              <div className="relative border-l border-white/10 pl-6 ml-4 space-y-10">
                {(roadmap.timeline || []).map((weekItem: any) => {
                  // Filter tasks belonging to this specific week
                  const weekTasks = (roadmap.tasks || []).filter(
                    (t: any) => Number(t.week) === Number(weekItem.week)
                  );

                  return (
                    <div key={weekItem.week} className="relative space-y-4">
                      
                      {/* Circle dot marker */}
                      <span className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-[#0a0a0f] ring-4 ring-primary/10 shadow-lg shadow-primary/20" />

                      {/* Milestone Card */}
                      <div className="glass rounded-3xl p-6 border-white/5 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Week {weekItem.week}</span>
                            <h4 className="text-base font-bold text-white mt-0.5">{weekItem.title}</h4>
                          </div>
                        </div>

                        <p className="text-xs text-muted leading-relaxed">
                          {weekItem.description}
                        </p>

                        <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 text-[10px] font-semibold text-muted/80 leading-relaxed">
                          🚀 <b className="text-white">Milestone Goal:</b> {weekItem.milestone}
                        </div>

                        {/* Checklist */}
                        {weekTasks.length > 0 && (
                          <div className="space-y-3 pt-3 border-t border-white/5">
                            <p className="text-[10px] font-bold text-white uppercase tracking-widest">Preps Checklist</p>
                            <div className="space-y-2">
                              {weekTasks.map((tItem: any, idx: number) => {
                                const isChecked = !!checkedTasks[tItem.task];
                                return (
                                  <div key={idx} className="p-3 rounded-xl bg-[#0a0a0f]/40 border border-white/5 space-y-2.5">
                                    <div className="flex items-start gap-2.5">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggleTask(tItem.task)}
                                        className="mt-0.5 w-4 h-4 rounded border-white/10 bg-white/[0.03] text-primary focus:ring-primary focus:ring-offset-0"
                                      />
                                      <div className="min-w-0">
                                        <p className={`text-xs font-semibold text-white ${isChecked ? "line-through text-muted/60" : ""}`}>
                                          {tItem.task}
                                        </p>
                                        {tItem.resources && (
                                          <p className="text-[10px] text-muted mt-1 leading-relaxed">
                                            📂 <b className="text-white/60">Resources:</b> {tItem.resources}
                                          </p>
                                        )}
                                        {tItem.interview_focus && (
                                          <p className="text-[10px] text-primary mt-1 leading-relaxed">
                                            🎯 <b className="text-primary/70">Interview Focus:</b> {tItem.interview_focus}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="glass rounded-3xl p-12 text-center border-white/5 flex flex-col items-center justify-center min-h-[400px]">
              <span className="text-4xl mb-4">🗺️</span>
              <h3 className="text-lg font-bold text-white">No Active Program</h3>
              <p className="text-sm text-muted mt-1 max-w-sm">
                Describe your target profession on the left sidebar to coordinate planning agents and compile your milestone roadmap.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
