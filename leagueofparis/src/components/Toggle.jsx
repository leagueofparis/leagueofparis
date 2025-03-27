export default function Toggle({ isOn, onToggle }) {
	return (
		<div
			onClick={onToggle}
			className={`w-16 h-8 rounded-full flex items-center px-1 cursor-pointer transition-colors duration-300 
        ${isOn ? "bg-blue-500" : "bg-gray-300"}`}
		>
			<div
				className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 
          ${isOn ? "translate-x-8" : "translate-x-0"}`}
			/>
		</div>
	);
}
