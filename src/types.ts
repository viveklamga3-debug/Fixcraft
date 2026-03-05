export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Guide {
  id: string;
  category_id: string;
  title: string;
  summary: string;
  difficulty: string;
  time_estimate: string;
  cost_estimate: string;
  image_url: string;
  steps?: Step[];
}

export interface Step {
  id: number;
  guide_id: string;
  step_number: number;
  title: string;
  content: string;
  image_url?: string;
}

export interface DiagnosticQuestion {
  id: string;
  category_id: string;
  question: string;
  step_number: number;
}

export interface DiagnosticOption {
  id: string;
  question_id: string;
  label: string;
  next_question_id?: string;
  result_guide_id?: string;
}
