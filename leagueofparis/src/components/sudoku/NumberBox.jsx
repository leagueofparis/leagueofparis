import React from "react";
import { FaTimes } from "react-icons/fa";
import { getAlignment } from "./CellAlignment";

export default function NumberBox({
	numsComplete,
	onNumberClick,
	candidateMode,
}) {
	const isCompleted = (number) => {
		return numsComplete?.includes(number) || false;
	};

	const clamp = {
		width: "clamp(2rem, 9vw, 5rem)",
		height: "clamp(4rem, 12vw, 7rem)",
		fontSize: candidateMode ? "" : "clamp(1.2rem, 5vw, 3rem)",
	};

	return (
		<div className="flex flex-col justify-center items-center">
			<div className="grid grid-cols-9 md:grid-cols-3 md:grid-rows-3">
				{Array.from({ length: 9 }).map((_, i) => (
					<div
						key={i}
						className={`m-1 font-bold flex cursor-pointer rounded-lg text-neutral-content
					${isCompleted(i + 1) ? "bg-neutral opacity-50" : "bg-primary"}
					${getAlignment(candidateMode, i + 1)}`}
						style={clamp}
						onClick={() => onNumberClick(i + 1)}
					>
						{i + 1}
					</div>
				))}
			</div>
			<div
				key={0}
				className="m-1 font-bold flex justify-center items-center cursor-pointer rounded-lg bg-primary text-primary-content
							[--w:clamp(2rem,27vh,5rem)] [--h:clamp(2rem,9vw,5rem)] [--fs:clamp(1.2rem,5vw,3rem)]
							md:[--w:clamp(4rem,20vw,16rem)] md:[--h:clamp(4rem,12vw,6rem)] md:[--fs:clamp(1.5rem,4vw,2.5rem)]"
				style={{
					width: "var(--w)",
					height: "var(--h)",
					fontSize: "var(--fs)",
				}}
				onClick={() => onNumberClick(0)}
			>
				<FaTimes />
			</div>
		</div>
	);
}
