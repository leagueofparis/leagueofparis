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
	const { user, profile, loading } = useUser();

	useEffect(() => {
		// Don't make any navigation decisions while loading
		if (loading) return;

		if (requireAuth && !user) {
			navigate("/login?redirect=" + window.location.pathname);
			return;
		}

		// Only check role requirements if we have a profile
		if (profile) {
			if (profile?.role === "admin") {
				return;
			}

			if (requiredRole && requiredRole.includes(",")) {
				const roles = requiredRole.split(",");

				if (!roles.some((role) => profile?.role === role)) {
					navigate("/login?redirect=" + window.location.pathname);
					return;
				}
			}

			if (requiredRole && profile?.role !== requiredRole) {
				navigate("/");
				return;
			}
		}
	}, [user, profile, requiredRole, requireAuth, navigate, loading]);

	// Don't render anything while loading
	if (loading) {
		return null;
	}

	if (requireAuth && !user) {
		return null;
	}

	if (profile) {
		if (profile?.role === "admin") {
			return children;
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
	}

	return children;
}
