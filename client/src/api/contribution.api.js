import http from "./http";

export const sendContributionRequest = async (projectId) => {
  const { data } = await http.post(`/contributions/project/${projectId}`);
  return data.data;
};

export const getContributionRequests = async (projectId) => {
  const { data } = await http.get(`/contributions/project/${projectId}`);
  return data.data;
};

export const approveContributionRequest = async (contributionId) => {
  const { data } = await http.patch(`/contributions/${contributionId}/approve`);
  return data.data;
};

export const rejectContributionRequest = async (contributionId) => {
  const { data } = await http.patch(`/contributions/${contributionId}/reject`);
  return data.data;
};
