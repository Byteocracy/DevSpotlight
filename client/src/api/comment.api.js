import http from "./http";

export const getProjectComments = async (projectId) => {
  const { data } = await http.get(`/comments/project/${projectId}`);
  return data.data;
};

export const addComment = async (projectId, payload) => {
  const { data } = await http.post(`/comments/project/${projectId}`, payload);
  return data.data;
};
