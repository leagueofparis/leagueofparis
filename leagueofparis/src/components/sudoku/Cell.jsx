import CandidateCell from "./CandidateCell";
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
	candidates,
	candidateMode,
	onCandidateCellClick,
	isDuplicateValue,
	completed,
}) {
	const highlightClass =
		{
			selected: "bg-accent text-accent-content",
			number: "bg-primary text-accent-content",
			rowcol: "bg-accent/50 text-base-content",
			prefilled: "bg-neutral text-neutral-content",
			blur: "blur-sm",
		}[highlightType] || "bg-base-300 text-base-content";

	const onCanCellClick = (e, value) => {
		if (highlightType !== "selected") {
			e.stopPropagation(); // just in case
			return;
		}

		e.stopPropagation(); // block event bubbling
		onCandidateCellClick(row, col, value);
	};

	return (
		<div
			ref={cellRef}
			tabIndex={0}
			role="button"
			onClick={() => {
				if (highlightType !== "selected") {
					onClick(row, col, value);
				}
			}}
			onFocus={() => onFocus(row, col, value)}
			onKeyDown={(e) => onKeyDown && onKeyDown(e, row, col, value)}
			data-row={row}
			data-col={col}
			data-value={value}
			className={`text-center flex justify-center items-center border border-primary leading-[0.95]
				focus:outline-none focus:ring-2 focus:ring-accent caret-transparent select-none font-bold cursor-pointer relative
				${(row + 1) % 3 === 0 && row !== 8 ? "border-b-3" : ""}
				${(col + 1) % 3 === 0 && col !== 8 ? "border-r-3" : ""}
				${highlightClass} ${color}
				${paused && !completed ? "blur" : ""}`}
			style={{
				width: "clamp(2rem, 9vw, 5rem)",
				height: "clamp(2rem, 9vw, 5rem)",
				fontSize: "clamp(1.2rem, 5vw, 3rem)",
			}}
		>
			{value === "" ? (
				<CandidateCell
					candidateMode={candidateMode}
					candidates={candidates}
					onClick={(value, e) => onCanCellClick(e, value)}
					selected={highlightType === "selected"}
				/>
			) : (
				value
			)}

			{isDuplicateValue ? (
				<div className="w-3 h-3 rounded-full bg-error absolute bottom-0 right-0 mr-1 mb-1"></div>
			) : (
				""
			)}
		</div>
	);
}
