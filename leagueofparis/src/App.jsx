import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Sudoku from "./pages/Sudoku";
import Layout from "./components/Layout";
import Uploads from "./pages/Uploads";
import AuthCallback from "./pages/AuthCallback";

function App() {
	//load the theme from localStorage on initial load
	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") || "parislight";
		document.documentElement.setAttribute("data-theme", savedTheme);
	}, []);

	return (
		<Router>
			<Routes>
				<Route
					path="/"
					element={
						<Layout>
							<Home />
						</Layout>
					}
				/>
				<Route
					path="/sudoku"
					element={
						<Layout>
							<Sudoku />
						</Layout>
					}
				/>
				<Route
					path="/uploads"
					element={
						<Layout>
							<Uploads />
						</Layout>
					}
				/>
				<Route
					path="/login"
					element={
						<Layout>
							<Login />
						</Layout>
					}
				/>
				<Route path="/discord/callback" element={<AuthCallback />} />
			</Routes>
		</Router>
	);
}

export default App;
