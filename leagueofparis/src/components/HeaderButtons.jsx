import { ToggleTheme } from "../utilities/ToggleTheme";
import { FaAdjust, FaTh } from "react-icons/fa";
export default function HeaderButtons() {
	const redirectUrl = (page) => {
		document.location.href = "/" + page;
	};

	return (
		<div className="ml-auto p-1">
			<button
				onClick={() => redirectUrl("sudoku")}
				className="p-0 rounded cursor-pointer"
			>
				<FaTh size={24} />
			</button>
			<button onClick={ToggleTheme} className="p-0 pl-2 rounded cursor-pointer">
				<FaAdjust size={24} />
			</button>
		</div>
	);
}
