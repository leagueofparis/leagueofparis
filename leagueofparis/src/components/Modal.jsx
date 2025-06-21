export default function Modal({ isOpen, onClose, children }) {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
			onClick={onClose}
		>
			<div
				className="relative max-w-[90%] max-h-[90%] w-auto h-auto"
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
}
