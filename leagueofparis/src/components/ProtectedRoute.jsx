// src/components/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function ProtectedRoute({
	children,
	requiredRole,
	requireAuth,
}) {
	const navigate = useNavigate();
	const { user, profile } = useUser();

	useEffect(() => {
		if (requireAuth && !user) {
			navigate("/login");
			return;
		}

		if (requiredRole && requiredRole.includes(",")) {
			const roles = requiredRole.split(",");
			if (!roles.some((role) => profile?.role === role)) {
				navigate("/login");
				return;
			}
		}

		if (requiredRole && profile?.role !== requiredRole) {
			navigate("/");
			return;
		}
	}, [user, profile, requiredRole, requireAuth, navigate]);

	if (requireAuth && !user) {
		return null;
	}

	if (requiredRole && requiredRole.includes(",")) {
		const roles = requiredRole.split(",");
		if (!roles.some((role) => profile?.role === role)) {
			return null;
		}
	}

	if (requiredRole && profile?.role !== requiredRole) {
		return null;
	}

	return children;
}
