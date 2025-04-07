import React from "react";

import { FaSignInAlt } from "react-icons/fa";

const SignInButton = ({ onSignIn }) => {
	return (
		<button
			onClick={onSignIn}
			className="p-0 pl-2 cursor-pointer"
			title="Sign In"
		>
			<FaSignInAlt size={24} />
		</button>
	);
};

export default SignInButton;
