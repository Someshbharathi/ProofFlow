import { createClient } from "@/lib/supabase/server";
import type { ProjectRecord } from "@/lib/projects";

export type ClientApplication = {
  application_id: string; project_id: string; project_title: string; freelancer_id: string;
  freelancer_name: string; freelancer_avatar_url: string | null; proposal: string;
  proposed_budget: number | string | null; estimated_completion_date: string | null;
  application_status: "pending" | "accepted" | "rejected" | "withdrawn";
  project_status: string; applied_at: string; assigned: boolean;
};

export type ClientInvitation = {
  invitation_id: string; project_id: string; project_title: string; freelancer_id: string;
  freelancer_name: string; freelancer_avatar_url: string | null; message: string | null;
  invitation_status: "pending" | "accepted" | "declined" | "cancelled"; invited_at: string;
};

export type ClientMembership = {
  membership_id: string; project_id: string; project_title: string; freelancer_id: string;
  freelancer_name: string; freelancer_avatar_url: string | null;
  membership_status: "active" | "completed" | "cancelled"; assigned_at: string;
};

export type EligibleFreelancer = {
  freelancer_id: string; full_name: string; avatar_url: string | null;
  has_pending_application: boolean; has_pending_invitation: boolean; assigned_to_project: boolean;
};

export type FreelancerApplication = {
  application_id: string; project_id: string; project_title: string; proposal: string;
  proposed_budget: number | string | null; estimated_completion_date: string | null;
  application_status: "pending" | "accepted" | "rejected" | "withdrawn"; applied_at: string;
};

export type FreelancerInvitation = {
  invitation_id: string; project_id: string; project_title: string; project_description: string;
  project_budget: number | string; project_deadline: string; project_skills: string[];
  client_name: string; invitation_message: string | null;
  invitation_status: "pending" | "accepted" | "declined" | "cancelled"; invited_at: string;
};

export type FreelancerMembership = {
  id: string; project_id: string; status: "active" | "completed" | "cancelled";
  created_at: string; project: ProjectRecord;
};

async function runRpc<T>(name: string) {
  const supabase = await createClient();
  if (!supabase) return { data: null as T | null, error: "Supabase is not configured." };
  const { data, error } = await supabase.rpc(name);
  if (error) return { data: null as T | null, error: `Could not load workflow data (${error.code}): ${error.message}` };
  return { data: data as T, error: null };
}

export async function loadClientApplications() {
  return runRpc<ClientApplication[]>("list_client_applications");
}

export async function loadClientInvitations() {
  return runRpc<ClientInvitation[]>("list_client_invitations");
}

export async function loadClientMemberships() {
  return runRpc<ClientMembership[]>("list_client_memberships");
}

export async function loadEligibleFreelancers(projectId: string) {
  const supabase = await createClient();
  if (!supabase) return { data: null as EligibleFreelancer[] | null, error: "Supabase is not configured." };
  const { data, error } = await supabase.rpc("list_eligible_freelancers", { p_project_id: projectId });
  if (error) return { data: null, error: `Eligible freelancers could not be loaded (${error.code}): ${error.message}` };
  return { data: data as EligibleFreelancer[], error: null };
}

export async function loadMyApplications() {
  return runRpc<FreelancerApplication[]>("list_my_applications");
}

export async function loadMyInvitations() {
  return runRpc<FreelancerInvitation[]>("list_my_invitations");
}

export async function loadMyMemberships() {
  const supabase = await createClient();
  if (!supabase) return { data: null as FreelancerMembership[] | null, error: "Supabase is not configured." };
  const projectSelection = "id,title,description,budget_amount,budget_currency,deadline,required_skills,status,created_at,updated_at,project_milestones(id,title,description,amount,currency,due_date,sequence_number,status)";
  const { data, error } = await supabase.from("project_memberships")
    .select(`id,project_id,status,created_at,project:projects(${projectSelection})`)
    .in("status", ["active", "completed"])
    .order("created_at", { ascending: false }).limit(200);
  if (error) return { data: null, error: `Assigned projects could not be loaded (${error.code}): ${error.message}` };
  return { data: (data ?? []) as unknown as FreelancerMembership[], error: null };
}
