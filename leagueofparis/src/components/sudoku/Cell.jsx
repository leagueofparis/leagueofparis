export default function Cell({
	value,
	row,
	col,
	isPrefilled,
	onClick,
	onFocus,
	highlightType,
}) {
	const highlightClass =
		{
			selected: "bg-yellow-300",
			number: "bg-yellow-200",
			rowcol: "bg-yellow-100",
		}[highlightType] || "";

	return (
		<div
			tabIndex={0}
			role="button"
			onClick={() => onClick(row, col, value)}
			onFocus={() => onFocus(row, col, value)}
			data-row={row}
			data-col={col}
			data-value={value}
			className={`w-20 h-20 text-center flex justify-center items-center border text-5xl leading-[0.95] focus:bg-yellow-300 focus:outline-none caret-transparent select-none font-bold
				${(row + 1) % 3 === 0 && row !== 8 ? "border-b-2" : ""}
				${(col + 1) % 3 === 0 && col !== 8 ? "border-r-2" : ""}
				${highlightClass}`}
		>
			{value}
		</div>
	);
}
