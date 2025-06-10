import React from "react";

import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { isAuthenticated } from "../utilities/auth";

const SignInButton = ({ onSignIn, onSignOut }) => {
	if (!isAuthenticated()) {
		return (
			<div className="flex items-center gap-2">
				<button
					onClick={onSignIn}
					className="p-0 cursor-pointer"
					title="Sign In"
				>
					<FaSignInAlt size={24} />
				</button>
			</div>
		);
	}
	return (
		<div className="flex items-center gap-2">
			<button
				onClick={onSignOut}
				className="p-0 cursor-pointer"
				title="Sign Out"
			>
				<FaSignOutAlt size={24} />
			</button>
		</div>
	);
};

export default SignInButton;
