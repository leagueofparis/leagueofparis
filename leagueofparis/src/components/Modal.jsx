export default function Modal({ isOpen, onClose, children }) {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			onClick={onClose}
		>
			<div
				className="bg-white p-6 rounded-lg shadow-lg max-w-[75%] md:max-w-[30%] w-full max-h-[50%] md:max-h-[50%] h-full"
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
}
