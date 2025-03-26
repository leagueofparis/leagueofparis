export default function Cell({
	value,
	row,
	col,
	color,
	onClick,
	onFocus,
	onKeyDown,
	highlightType,
	cellRef,
	paused,
}) {
	const highlightClass =
		{
			selected: "bg-yellow-300",
			number: "bg-yellow-200",
			rowcol: "bg-yellow-100",
			prefilled: "bg-fuchsia-200",
			blur: "blur-sm",
		}[highlightType] || "";

	return (
		<div
			ref={cellRef}
			tabIndex={0}
			role="button"
			onClick={() => onClick(row, col, value)}
			onFocus={() => onFocus(row, col, value)}
			onKeyDown={(e) => onKeyDown && onKeyDown(e, row, col, value)}
			data-row={row}
			data-col={col}
			data-value={value}
			className={`text-center flex justify-center items-center border border-black leading-[0.95]
				focus:bg-yellow-300 focus:outline-none caret-transparent select-none font-bold
				${(row + 1) % 3 === 0 && row !== 8 ? "border-b-3" : ""}
				${(col + 1) % 3 === 0 && col !== 8 ? "border-r-3" : ""}
				${highlightClass} ${color}
				${paused ? "blur" : ""}`}
			style={{
				width: "clamp(2rem, 9vw, 5rem)",
				height: "clamp(2rem, 9vw, 5rem)",
				fontSize: "clamp(1.2rem, 5vw, 3rem)",
			}}
		>
			{value}
		</div>
	);
}
