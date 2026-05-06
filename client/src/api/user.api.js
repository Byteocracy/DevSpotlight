import http from "./http";

export const updateProfile = async (payload) => {
  const { data } = await http.patch("/users/update-profile", payload);
  return data.data;
};
