/* eslint-disable no-unused-vars */
export default function CandidateCell({
	candidateMode,
	candidates,
	onClick,
	selected,
}) {
	return (
		<div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-1">
			{[...Array(9)].map((_, i) => {
				const justify =
					i % 3 === 0
						? "justify-start"
						: i % 3 === 1
							? "justify-center"
							: "justify-end";
				const items =
					i < 3 ? "items-start" : i < 6 ? "items-center" : "items-end";

				const isSet = candidates[i];
				return (
					<div
						key={i}
						className={`w-full h-full flex ${justify} ${items} group text-gray-500 ${
							selected ? "cursor-pointer" : "pointer-events-none"
						}`}
						style={{
							fontSize: "clamp(1rem, 1vh, 3rem)",
						}}
						onClick={selected ? (e) => onClick(i + 1, e) : undefined}
					>
						<div
							className={`transition-opacity duration-150 ${
								isSet
									? ""
									: selected
										? "opacity-0 group-hover:opacity-100"
										: "opacity-0"
							}`}
						>
							{isSet ? candidates[i] : i + 1}
						</div>
					</div>
				);
			})}
		</div>
	);
}
