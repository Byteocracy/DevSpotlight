import http from "./http";

export const getProjects = async ({ page = 1, limit = 6, query = "" } = {}) => {
  const { data } = await http.get("/projects", {
    params: { page, limit, query: query || undefined },
  });

  return data.data;
};

export const getProjectById = async (projectId) => {
  const { data } = await http.get(`/projects/${projectId}`);
  return data.data;
};

export const createProject = async (payload) => {
  const { data } = await http.post("/projects", payload);
  return data.data;
};

export const toggleProjectLike = async (projectId) => {
  const { data } = await http.post(`/likes/project/${projectId}`);
  return data.data;
};
