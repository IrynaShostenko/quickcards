import { apiRequest } from "./httpClient";
import { saveAuthSession } from "./authStorage";

export async function registerTeacher({ name, email, password }) {
  const authData = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  saveAuthSession(authData);

  return authData;
}

export async function loginTeacher({ email, password }) {
  const authData = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  saveAuthSession(authData);

  return authData;
}

export async function getCurrentTeacher() {
  return apiRequest("/auth/me");
}
