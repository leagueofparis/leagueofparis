export default function NumberBox({ numsComplete, onNumberClick }) {
	const isCompleted = (number) => {
		numsComplete?.includes(number) || false;
	};
	return (
		<div className="grid grid-cols-9 md:grid-cols-3 md:grid-rows-3">
			{Array.from({ length: 9 }).map((_, i) => (
				<div
					key={i}
					className={`w-6 h-9 m-1 font-bold flex justify-center items-center cursor-pointer
					${isCompleted(i + 1) ? "bg-gray-100 opacity-50" : "bg-gray-300"}`}
					style={{
						width: "clamp(2rem, 9vw, 5rem)",
						height: "clamp(4rem, 12vw, 7rem)",
						fontSize: "clamp(1.2rem, 5vw, 3rem)",
					}}
					onClick={() => onNumberClick(i + 1)}
				>
					{i + 1}
				</div>
			))}
		</div>
	);
}
