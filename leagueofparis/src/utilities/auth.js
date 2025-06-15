// src/utilities/auth.js
import { jwtDecode } from "jwt-decode";

export function getUser() {
	const token = getToken();
	if (!token) return null;

	try {
		const decoded = jwtDecode(token);
		return decoded;
	} catch (error) {
		console.error("Error decoding JWT:", error);
		return null;
	}
}

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

export function isAdmin() {
	const user = getUser();
	return user?.role === "admin";
}

export function isUser() {
	const user = getUser();
	return user?.role === "user";
}

export function isInRole(role) {
	const user = getUser();
	return user?.role === role;
}

// Get the Authorization header for fetch/axios
export function getAuthHeader() {
	const token = getToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}
