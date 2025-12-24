import React, { useState, useEffect } from "react";
import { getFeaturedWrappedCollection, getWrappedStats } from "../supabaseClient";
import StatCarousel from "../components/wrapped/StatCarousel";
import { motion, AnimatePresence } from "motion/react";

const Wrapped = () => {
	const [featuredCollection, setFeaturedCollection] = useState(null);
	const [stats, setStats] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showIntro, setShowIntro] = useState(true);

	useEffect(() => {
		fetchFeaturedCollection();
	}, []);

	const fetchFeaturedCollection = async () => {
		try {
			setLoading(true);
			setError(null);
			const collection = await getFeaturedWrappedCollection();
			console.log("Fetched featured collection:", collection);
			setFeaturedCollection(collection);
			
			if (collection) {
				const statsData = await getWrappedStats(collection.id);
				console.log("Fetched stats:", statsData);
				setStats(statsData);
			}
		} catch (err) {
			console.error("Error fetching featured collection:", err);
			setError("Failed to load wrapped: " + err.message);
		} finally {
			setLoading(false);
		}
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
					{featuredCollection?.year || "2024"}
				</motion.h1>
				<motion.h2 
					className="text-4xl md:text-6xl font-bold text-white mb-8"
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					WRAPPED
				</motion.h2>
				{!loading && !error && featuredCollection && (
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
				)}
				{loading && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						className="mt-4"
					>
						<span className="loading loading-dots loading-lg text-white"></span>
					</motion.div>
				)}
				{error && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						className="mt-4 text-center"
					>
						<p className="text-red-400 mb-4">{error}</p>
						<button 
							onClick={fetchFeaturedCollection} 
							className="btn btn-primary"
						>
							Try Again
						</button>
					</motion.div>
				)}
				{!loading && !error && !featuredCollection && (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						className="text-white/70 mt-4"
					>
						No wrapped collection available yet. Check back soon!
					</motion.p>
				)}
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
		<div className="min-h-screen bg-black relative">
			{/* Intro Overlay */}
			<AnimatePresence>
				{showIntro && <Intro />}
			</AnimatePresence>

			{/* Stat Carousel (shown after intro) */}
			{!showIntro && featuredCollection && (
				<motion.div 
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className="fixed inset-0 z-40 bg-black"
				>
					{stats.length > 0 ? (
						<StatCarousel
							stats={stats}
							collectionTitle={featuredCollection.title}
						/>
					) : (
						<div className="h-full flex items-center justify-center text-white">
							<div className="text-center">
								<p className="text-xl mb-4">No stats available yet</p>
							</div>
						</div>
					)}
				</motion.div>
			)}
		</div>
	);
};

export default Wrapped;
