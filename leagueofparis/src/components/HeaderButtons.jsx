import { ToggleTheme } from "../utilities/ToggleTheme";
import { FaAdjust, FaTh } from "react-icons/fa";
import SignInButton from "./SignInButton";

export default function HeaderButtons({ onSignIn }) {
	const redirectUrl = (page) => {
		document.location.href = "/" + page;
	};

	return (
		<div className="ml-auto p-4">
			<button
				onClick={() => redirectUrl("sudoku")}
				className="p-0 cursor-pointer"
			>
				<FaTh size={24} />
			</button>
			<button onClick={ToggleTheme} className="p-0 pl-2 cursor-pointer">
				<FaAdjust size={24} />
			</button>
			<SignInButton />
		</div>
	);
}
