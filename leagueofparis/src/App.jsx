// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Sudoku from "./pages/Sudoku";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/sudoku" element={<Sudoku />} />
				{/* other routes */}
			</Routes>
		</Router>
	);
}

export default App;
