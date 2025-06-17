import { createContext, useContext } from "react";
import useIsMobile from "../hooks/useIsMobile";

const DeviceContext = createContext();

export function DeviceProvider({ children }) {
	const isMobile = useIsMobile();

	return (
		<DeviceContext.Provider value={{ isMobile }}>
			{children}
		</DeviceContext.Provider>
	);
}

export function useDevice() {
	const context = useContext(DeviceContext);
	if (context === undefined) {
		throw new Error("useDevice must be used within a DeviceProvider");
	}
	return context;
}
