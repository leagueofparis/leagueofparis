// src/components/ProtectedRoute.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utilities/auth";

export default function ProtectedRoute({
	children,
	requiredRole,
	requireAuth,
}) {
	const navigate = useNavigate();
	const user = getUser();

	if (requireAuth && !user) {
		// Not logged in
		navigate("/login");
		return null;
	}

	if (requiredRole && requiredRole.includes(",")) {
		const roles = requiredRole.split(",");
		if (!roles.some((role) => user.role === role)) {
			navigate("/login");
			return null;
		}
	}

	if (requiredRole && user.role !== requiredRole) {
		// Not authorized
		navigate("/");
		return null;
	}

	return children;
}
