import React, { useState, useEffect } from "react";
import { getWrappedCollections, getWrappedCollection, getWrappedStats } from "../supabaseClient";
import StatCarousel from "../components/wrapped/StatCarousel";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "motion/react";

const Wrapped = () => {
	const [collections, setCollections] = useState([]);
	const [selectedCollection, setSelectedCollection] = useState(null);
	const [stats, setStats] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showIntro, setShowIntro] = useState(true);

	useEffect(() => {
		fetchCollections();
	}, []);

	useEffect(() => {
		if (selectedCollection) {
			fetchStats(selectedCollection.id);
		}
	}, [selectedCollection]);

	const fetchCollections = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getWrappedCollections(true); // Only published
			console.log("Fetched collections:", data);
			setCollections(data);
		} catch (err) {
			console.error("Error fetching collections:", err);
			setError("Failed to load collections: " + err.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchStats = async (collectionId) => {
		try {
			setLoading(true);
			setError(null);
			const collection = await getWrappedCollection(collectionId);
			const statsData = await getWrappedStats(collectionId);
			console.log("Fetched collection:", collection);
			console.log("Fetched stats:", statsData);
			setSelectedCollection(collection);
			setStats(statsData);
		} catch (err) {
			console.error("Error fetching stats:", err);
			setError("Failed to load stats: " + err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleCollectionClick = (collection) => {
		setSelectedCollection(collection);
	};

	const handleBackToCollections = () => {
		setSelectedCollection(null);
		setStats([]);
	};

	const handleIntroComplete = () => {
		setShowIntro(false);
	};

	// Intro Component
	const Intro = () => (
		<motion.div
			className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
			initial={{ opacity: 1 }}
			exit={{ opacity: 0, transition: { duration: 0.8 } }}
		>
			<motion.div
				initial={{ scale: 0.5, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.8, type: "spring" }}
				className="text-center"
			>
				<motion.h1 
					className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent"
					animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
					transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
					style={{ backgroundSize: "200% 200%" }}
				>
					2024
				</motion.h1>
				<motion.h2 
					className="text-4xl md:text-6xl font-bold text-white mb-8"
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					WRAPPED
				</motion.h2>
				<motion.button
					onClick={handleIntroComplete}
					className="btn btn-lg btn-primary rounded-full px-8 text-xl font-bold shadow-xl border-none bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
					initial={{ y: 50, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 1, type: "spring" }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					Let's Go!
				</motion.button>
			</motion.div>
			
			{/* Decorative elements */}
			<motion.div 
				className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"
				animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
				transition={{ duration: 5, repeat: Infinity }}
			/>
			<motion.div 
				className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"
				animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
				transition={{ duration: 7, repeat: Infinity }}
			/>
		</motion.div>
	);

	return (
		<div className="min-h-screen bg-base-100 relative">
			{/* Intro Overlay */}
			<AnimatePresence>
				{showIntro && <Intro />}
			</AnimatePresence>

			{/* Main Content (hidden until intro complete) */}
			{!showIntro && (
				<Layout>
					<motion.div 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="min-h-screen py-10 px-4"
					>
						{/* Show loading state if initial load is happening after intro */}
					{loading && !selectedCollection && (
						<div className="min-h-screen flex items-center justify-center">
							<div className="text-center">
								<span className="loading loading-spinner loading-lg text-primary"></span>
								<p className="mt-4 text-lg text-base-content">Loading collections...</p>
							</div>
						</div>
					)}

					{/* Error state */}
					{error && !selectedCollection && (
						<div className="min-h-screen flex items-center justify-center">
							<div className="text-center">
								<p className="text-lg text-error mb-4">{error}</p>
								<button onClick={fetchCollections} className="btn btn-primary">
									Try Again
								</button>
							</div>
						</div>
					)}

					{/* Stat Carousel View */}
					{selectedCollection && (
						<div className="fixed inset-0 z-40 bg-black">
							{loading && stats.length === 0 ? (
								<div className="h-full flex items-center justify-center">
									<div className="text-center">
										<span className="loading loading-dots loading-lg text-white"></span>
										<p className="mt-4 text-white">Loading stats...</p>
									</div>
								</div>
							) : stats.length > 0 ? (
								<StatCarousel
									stats={stats}
									onBack={handleBackToCollections}
									collectionTitle={selectedCollection.title}
								/>
							) : (
								<div className="h-full flex items-center justify-center text-white">
									<div className="text-center">
										<p className="text-xl mb-4">No stats available yet</p>
										<button onClick={handleBackToCollections} className="btn btn-primary">
											Back
										</button>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Collections Grid View */}
					{!selectedCollection && !loading && !error && (
						<div className="max-w-7xl mx-auto">
							<div className="text-center mb-12">
								<motion.h1 
									initial={{ y: -20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.2 }}
									className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-sm"
								>
									Streaming Stats Wrapped
								</motion.h1>
								<motion.p 
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.4 }}
									className="text-xl text-base-content/70 font-medium"
								>
									Explore amazing streaming statistics and highlights
								</motion.p>
							</div>

							{collections.length === 0 ? (
								<div className="text-center py-20">
									<p className="text-xl text-base-content/70">
										No collections available yet. Check back soon!
									</p>
								</div>
							) : (
								<motion.div 
									className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
									initial="hidden"
									animate="visible"
									variants={{
										hidden: { opacity: 0 },
										visible: {
											opacity: 1,
											transition: {
												staggerChildren: 0.1
											}
										}
									}}
								>
									{collections.map((collection, index) => {
										const gradient = [
											"from-purple-500 via-pink-500 to-red-500",
											"from-blue-500 via-cyan-500 to-teal-500",
											"from-green-500 via-emerald-500 to-teal-500",
											"from-yellow-500 via-orange-500 to-red-500"
										][index % 4];

										return (
											<motion.div
												key={collection.id}
												variants={{
													hidden: { y: 20, opacity: 0 },
													visible: { y: 0, opacity: 1 }
												}}
												whileHover={{ scale: 1.05, rotate: -1 }}
												whileTap={{ scale: 0.95 }}
												onClick={() => handleCollectionClick(collection)}
												className={`card bg-gradient-to-br ${gradient} shadow-2xl cursor-pointer overflow-hidden border-4 border-white/10`}
											>
												{collection.cover_image ? (
													<figure className="h-56 overflow-hidden relative group">
														<div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
														<motion.img
															src={collection.cover_image}
															alt={collection.title}
															className="w-full h-full object-cover"
															whileHover={{ scale: 1.1 }}
															transition={{ duration: 0.5 }}
														/>
													</figure>
												) : (
													<figure className="h-56 flex items-center justify-center bg-white/10">
														<span className="text-7xl drop-shadow-md">📊</span>
													</figure>
												)}
												<div className="card-body text-white relative z-20">
													<h2 className="card-title text-3xl font-bold drop-shadow-md">
														{collection.title}
													</h2>
													<div className="text-white/90 font-medium">
														{collection.year}
													</div>
													<div className="card-actions justify-end mt-6">
														<button className="btn btn-sm btn-ghost bg-white/20 hover:bg-white/30 text-white border-none shadow-lg gap-2">
															View Stats →
														</button>
													</div>
												</div>
											</motion.div>
										);
									})}
								</motion.div>
							)}
						</div>
					)}
				</motion.div>
				</Layout>
			)}
		</div>
	);
};

export default Wrapped;
