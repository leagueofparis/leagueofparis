export function getAlignment(candidateMode, value) {
	let className = "";

	if (!candidateMode) {
		className = "justify-center items-center";
	} else {
		className = "sm:text-[24px] ";
		const leftPadding = "pl-[7px]";
		const rightPadding = "pr-[7px]";

		switch (value) {
			case 1:
				className += leftPadding;
				break;
			case 2:
				className += "justify-center";
				break;
			case 3:
				className += `justify-end ${rightPadding}`;
				break;
			case 4:
				className += `${leftPadding} items-center`;
				break;
			case 5:
				className += "justify-center items-center";
				break;
			case 6:
				className += `justify-end items-center ${rightPadding}`;
				break;
			case 7:
				className += `items-end ${leftPadding}`;
				break;
			case 8:
				className += "justify-center items-end";
				break;
			case 9:
				className += `justify-end items-end ${rightPadding}`;
				break;
		}
	}

	return className;
}
