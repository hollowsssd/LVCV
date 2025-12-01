export type JobStatus = "OPEN" | "CLOSED" | "DRAFT";

export type Job = {
  id: number;
  title: string;
  description: string;
  companyName?: string | null;
  location?: string | null;
  jobType?: string | null;
  experienceRequired?: string | null;
  deadline?: string | null;

  salaryMin?: number | null;
  salaryMax?: number | null;
  isNegotiable?: boolean | null;
  status: JobStatus;
  createdAt?: string | null;
};

export type Cv = {
  id: number;
  title?: string | null;
  fileUrl?: string | null;
  isDefault?: boolean | null;
  createdAt?: string | null;
};