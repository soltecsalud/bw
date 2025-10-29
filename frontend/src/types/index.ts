export interface User {
  id: number;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Simulation {
  id: number;
  amount: number;
  term: "Mensual" | "Anual";
  start_date: string;
  end_date: string;
  rate_applied: number;
}

export interface SimulationRequest {
  amount: number;
  term: "Mensual" | "Anual";
  start_date: string;
  end_date: string;
}