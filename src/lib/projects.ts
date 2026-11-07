import { createClient } from "@/lib/supabase/server";

export type ProjectMilestoneRecord = {
  id: string;
  title: string;
  description: string;
  amount: number | string;
  currency: "SOL";
  due_date: string;
  sequence_number: number;
  status: "pending" | "in_progress" | "completed";
};

export type ProjectRecord = {
  id: string;
  title: string;
  description: string;
  budget_amount: number | string;
  budget_currency: "SOL";
  deadline: string;
  required_skills: string[];
  status: "draft" | "open" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  project_milestones: ProjectMilestoneRecord[];
};

const projectSelection = "id,title,description,budget_amount,budget_currency,deadline,required_skills,status,created_at,updated_at,project_milestones(id,title,description,amount,currency,due_date,sequence_number,status)";

export async function loadClientDashboardProjects() {
  const supabase = await createClient();
  if (!supabase) return { activeCount: null, projects: null, error: "Supabase is not configured." };

  const [countResult, projectsResult] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    supabase.from("projects").select(projectSelection).order("created_at", { ascending: false }).limit(100),
  ]);

  if (countResult.error || projectsResult.error) {
    return { activeCount: null, projects: null, error: "Project data could not be loaded. Confirm the project migration has been applied." };
  }
  return {
    activeCount: countResult.count ?? 0,
    projects: (projectsResult.data ?? []) as ProjectRecord[],
    error: null,
  };
}

export async function loadClientProjects() {
  const supabase = await createClient();
  if (!supabase) return { projects: null, error: "Supabase is not configured." };
  const { data, error } = await supabase.from("projects").select(projectSelection).order("created_at", { ascending: false }).limit(200);
  if (error) return { projects: null, error: "Your projects could not be loaded. Confirm the project migration has been applied." };
  return { projects: (data ?? []) as ProjectRecord[], error: null };
}

export async function loadOpenProjects() {
  const supabase = await createClient();
  if (!supabase) return { projects: null, error: "Supabase is not configured." };
  const { data, error } = await supabase.from("projects").select(projectSelection).eq("status", "open").order("deadline").order("created_at", { ascending: false }).limit(200);
  if (error) return { projects: null, error: "Open projects could not be loaded. Confirm the project migration has been applied." };
  return { projects: (data ?? []) as ProjectRecord[], error: null };
}

export async function loadProjectById(projectId: string) {
  const supabase = await createClient();
  if (!supabase) return { project: null, error: "Supabase is not configured." };
  const { data, error } = await supabase.from("projects").select(projectSelection).eq("id", projectId).maybeSingle();
  if (error) return { project: null, error: "Project details could not be loaded." };
  return { project: data as ProjectRecord | null, error: null };
}
