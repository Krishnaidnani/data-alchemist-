export type Client = {
  id: string;
  name: string;
  email: string;
  location: string;
};

export type Worker = {
  id: string;
  name: string;
  skillset: string;
  hourlyRate: string;
};

export type Task = {
  id: string;
  title: string;
  assignedTo: string;
  clientId: string;
  deadline: string;
};
