import axios from "axios";

// Helpers for the login token kept in the browser (shared by login and logout).
const TOKEN_KEY = "token";
const USER_KEY = "user";

// Every axios request carries the saved token.
function setAxiosToken(token) {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setAxiosToken(token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setAxiosToken(null);
}

setAxiosToken(getToken());

const HOME = { student: "/student", company: "/company", admin: "/admin" };

// Where each role lands after login.
export function homeFor(role) {
  return HOME[role] || "/";
}
