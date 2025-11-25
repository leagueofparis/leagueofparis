import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Sudoku from "./pages/Sudoku";
import Layout from "./components/Layout";
import ContentManager from "./pages/ContentManager";
import ProtectedRoute from "./components/ProtectedRoute";
import Contact from "./pages/Contact";
import { DeviceProvider } from "./contexts/DeviceContext";
import Gallery from "./pages/Gallery";
import Support from "./pages/Support";
import SpotifyAuth from "./pages/SpotifyAuth";
import Parisdle from "./pages/games/Parisdle";
import ParisdleAdmin from "./pages/games/ParisdleAdmin";
import WillowWednesdays from "./pages/WillowWednesdays";
import Account from "./pages/Account";
import SchedulePage from "./pages/SchedulePage";

function App() {
	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") || "parislight";
		document.documentElement.setAttribute("data-theme", savedTheme);
	}, []);

	return (
		<DeviceProvider>
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
							<ProtectedRoute requiredRole="user" requireAuth={true}>
								<Layout>
									<Sudoku />
								</Layout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/uploads"
						element={
							<Layout>
								<ContentManager />
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
					<Route
						path="/account"
						element={
							<ProtectedRoute requireAuth={true}>
								<Layout>
									<Account />
								</Layout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/contact"
						element={
							<ProtectedRoute>
								<Layout>
									<Contact />
								</Layout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/gallery"
						element={
							<Layout>
								<Gallery />
							</Layout>
						}
					/>
					<Route
						path="/support"
						element={
							<Layout>
								<Support />
							</Layout>
						}
					/>
					<Route
						path="/games/parisdle"
						element={
							<ProtectedRoute requiredRole="user" requireAuth={true}>
								<Layout>
									<Parisdle />
								</Layout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/games/parisdle/admin"
						element={
							<ProtectedRoute requiredRole="admin" requireAuth={true}>
								<Layout>
									<ParisdleAdmin />
								</Layout>
							</ProtectedRoute>
						}
					/>

					<Route path="/spotify-auth" element={<SpotifyAuth />} />
					<Route
						path="/willow"
						element={
							<Layout>
								<WillowWednesdays />
							</Layout>
						}
					/>
					<Route
						path="/schedule"
						element={
							<SchedulePage />
						}
					/>
				</Routes>
			</Router>
		</DeviceProvider>
	);
}

export default App;
