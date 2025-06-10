// src/utilities/auth.js

// Get the JWT token from localStorage
export function getToken() {
	return localStorage.getItem("jwtToken");
}

// Set the JWT token in localStorage
export function setToken(token) {
	localStorage.setItem("jwtToken", token);
}

// Remove the JWT token from localStorage (logout)
export function removeToken() {
	localStorage.removeItem("jwtToken");
}

// Check if the user is authenticated
export function isAuthenticated() {
	return !!getToken();
}

// Get the Authorization header for fetch/axios
export function getAuthHeader() {
	const token = getToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}
