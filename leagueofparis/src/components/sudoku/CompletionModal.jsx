import React from "react";
import { FaRegSmile } from "react-icons/fa";
import Modal from "../Modal";

export default function CompletionModal({ isOpen, onClose, elapsedTime }) {
	const seconds = elapsedTime % 60;
	const minutes = Math.floor(elapsedTime / 60);

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="flex flex-col justify-center items-center">
				<h2 className="text-4xl font-bold mb-2 text-base-content">Congrats!</h2>
				<p className="mb-4 text-2xl mt-8 text-base-content">
					You completed the puzzle in&nbsp;
					<span className="font-bold text-accent">
						{String(minutes).padStart(2, "0")}:
						{String(seconds).padStart(2, "0")}
					</span>
					.
				</p>
				<FaRegSmile className="text-[72px] mt-24 text-accent" />
			</div>
		</Modal>
	);
}
