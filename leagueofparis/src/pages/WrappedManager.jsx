import React, { useState, useEffect } from "react";
import {
	getWrappedCollections,
	createWrappedCollection,
	updateWrappedCollection,
	deleteWrappedCollection,
	getWrappedStats,
	createWrappedStat,
	updateWrappedStat,
	deleteWrappedStat,
	reorderWrappedStats,
	uploadImage,
	setFeaturedCollection,
} from "../supabaseClient";
import StatForm from "../components/wrapped/StatForm";
import { fetchAllTwitchStats } from "../utilities/twitchStats";

function WrappedManager() {
	const [collections, setCollections] = useState([]);
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState("");
	const [editingCollectionId, setEditingCollectionId] = useState(null);
	const [selectedCollectionId, setSelectedCollectionId] = useState(null);
	const [stats, setStats] = useState([]);
	const [editingStatId, setEditingStatId] = useState(null);
	const [showStatForm, setShowStatForm] = useState(false);

	// Collection form states
	const [collectionTitle, setCollectionTitle] = useState("");
	const [year, setYear] = useState(new Date().getFullYear());
	const [period, setPeriod] = useState("");
	const [collectionDescription, setCollectionDescription] = useState("");
	const [coverImage, setCoverImage] = useState("");
	const [coverImageFile, setCoverImageFile] = useState(null);
	const [uploadKey, setUploadKey] = useState("");
	const [isPublished, setIsPublished] = useState(false);

	// Twitch API states
	const [twitchChannelName, setTwitchChannelName] = useState("leagueofparis");
	const [twitchAccessToken, setTwitchAccessToken] = useState("");
	const [loadingTwitch, setLoadingTwitch] = useState(false);

	useEffect(() => {
		fetchCollections();
	}, []);

	useEffect(() => {
		if (selectedCollectionId) {
			fetchStats(selectedCollectionId);
		}
	}, [selectedCollectionId]);

	const fetchCollections = async () => {
		try {
			setLoading(true);
			const data = await getWrappedCollections(false); // Get all, not just published
			setCollections(data);
		} catch (error) {
			console.error("Error fetching collections:", error);
			setStatus("Failed to load collections: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchStats = async (collectionId) => {
		try {
			setLoading(true);
			const data = await getWrappedStats(collectionId);
			setStats(data);
		} catch (error) {
			console.error("Error fetching stats:", error);
			setStatus("Failed to load stats: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const resetCollectionForm = () => {
		setCollectionTitle("");
		setYear(new Date().getFullYear());
		setPeriod("");
		setCollectionDescription("");
		setCoverImage("");
		setCoverImageFile(null);
		setUploadKey("");
		setIsPublished(false);
		setEditingCollectionId(null);
		setStatus("");
	};

	const handleEditCollection = (collection) => {
		setEditingCollectionId(collection.id);
		setCollectionTitle(collection.title || "");
		setYear(collection.year || new Date().getFullYear());
		setPeriod(collection.period || "");
		setCollectionDescription(collection.description || "");
		setCoverImage(collection.cover_image || "");
		setCoverImageFile(null);
		setUploadKey("");
		setIsPublished(collection.is_published || false);
		setStatus("");
	};

	const handleCollectionSubmit = async (e) => {
		e.preventDefault();

		if (!collectionTitle.trim()) {
			setStatus("Please enter a title.");
			return;
		}

		setLoading(true);
		setStatus("");

		try {
			let coverImageUrl = coverImage;

			if (coverImageFile) {
				if (!uploadKey.trim()) {
					setStatus("Please enter upload key for image upload.");
					setLoading(false);
					return;
				}
				setStatus("Uploading image...");
				const uploadedUrl = await uploadImage(
					coverImageFile,
					"wrapped-collections",
					uploadKey
				);
				coverImageUrl = uploadedUrl;
			}

			const collectionData = {
				title: collectionTitle.trim(),
				year: parseInt(year),
				period: period.trim() || null,
				description: collectionDescription.trim() || null,
				cover_image: coverImageUrl || null,
				is_published: isPublished,
			};

			if (editingCollectionId) {
				await updateWrappedCollection(editingCollectionId, collectionData);
				setStatus("Collection updated successfully!");
			} else {
				const newCollection = await createWrappedCollection(collectionData);
				setSelectedCollectionId(newCollection.id);
				setStatus("Collection created successfully!");
			}

			resetCollectionForm();
			await fetchCollections();
		} catch (error) {
			console.error("Error saving collection:", error);
			setStatus("Failed to save collection: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteCollection = async (id) => {
		if (!window.confirm("Are you sure you want to delete this collection? All stats will be deleted too.")) {
			return;
		}

		try {
			setLoading(true);
			await deleteWrappedCollection(id);
			setStatus("Collection deleted successfully!");
			if (selectedCollectionId === id) {
				setSelectedCollectionId(null);
				setStats([]);
			}
			await fetchCollections();
		} catch (error) {
			console.error("Error deleting collection:", error);
			setStatus("Failed to delete collection: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSetFeatured = async (id) => {
		try {
			setLoading(true);
			await setFeaturedCollection(id);
			setStatus("Collection set as featured!");
			await fetchCollections();
		} catch (error) {
			console.error("Error setting featured collection:", error);
			setStatus("Failed to set featured: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleStatSubmit = async (statData) => {
		try {
			setLoading(true);
			setStatus("");

			// Get max order for this collection
			const maxOrder = stats.length > 0 ? Math.max(...stats.map(s => s.order || 0)) : -1;

			const statToSave = {
				...statData,
				wrapped_collection_id: selectedCollectionId,
				order: editingStatId ? stats.find(s => s.id === editingStatId)?.order || 0 : maxOrder + 1,
			};

			if (editingStatId) {
				await updateWrappedStat(editingStatId, statToSave);
				setStatus("Stat updated successfully!");
			} else {
				await createWrappedStat(statToSave);
				setStatus("Stat created successfully!");
			}

			setShowStatForm(false);
			setEditingStatId(null);
			await fetchStats(selectedCollectionId);
		} catch (error) {
			console.error("Error saving stat:", error);
			setStatus("Failed to save stat: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleEditStat = (stat) => {
		setEditingStatId(stat.id);
		setShowStatForm(true);
	};

	const handleDeleteStat = async (id) => {
		if (!window.confirm("Are you sure you want to delete this stat?")) {
			return;
		}

		try {
			setLoading(true);
			await deleteWrappedStat(id);
			setStatus("Stat deleted successfully!");
			await fetchStats(selectedCollectionId);
		} catch (error) {
			console.error("Error deleting stat:", error);
			setStatus("Failed to delete stat: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleFetchTwitchStats = async () => {
		if (!twitchAccessToken.trim()) {
			setStatus("Please enter Twitch access token.");
			return;
		}

		if (!selectedCollectionId) {
			setStatus("Please select or create a collection first.");
			return;
		}

		try {
			setLoadingTwitch(true);
			setStatus("Fetching stats from Twitch...");
			const twitchStats = await fetchAllTwitchStats(twitchChannelName, twitchAccessToken);
			
			// Get max order
			const maxOrder = stats.length > 0 ? Math.max(...stats.map(s => s.order || 0)) : -1;

			// Save each stat
			for (let i = 0; i < twitchStats.length; i++) {
				const stat = twitchStats[i];
				await createWrappedStat({
					...stat,
					wrapped_collection_id: selectedCollectionId,
					order: maxOrder + 1 + i,
				});
			}

			setStatus(`Successfully imported ${twitchStats.length} stats from Twitch!`);
			await fetchStats(selectedCollectionId);
		} catch (error) {
			console.error("Error fetching Twitch stats:", error);
			setStatus("Failed to fetch Twitch stats: " + error.message);
		} finally {
			setLoadingTwitch(false);
		}
	};

	const handleMoveStat = async (statId, direction) => {
		const currentIndex = stats.findIndex(s => s.id === statId);
		if (currentIndex === -1) return;

		const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
		if (newIndex < 0 || newIndex >= stats.length) return;

		const newStats = [...stats];
		[newStats[currentIndex], newStats[newIndex]] = [newStats[newIndex], newStats[currentIndex]];

		// Update orders
		const statIds = newStats.map(s => s.id);
		await reorderWrappedStats(statIds);
		await fetchStats(selectedCollectionId);
	};

	if (selectedCollectionId && !showStatForm) {
		// Stats management view
		const selectedCollection = collections.find(c => c.id === selectedCollectionId);

		return (
			<div className="min-h-screen py-10 px-2">
				<div className="w-full flex flex-col gap-8 justify-center items-center max-w-6xl mx-auto">
					<div className="w-full flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-extrabold mb-2 text-base-content">
								{selectedCollection?.title || "Manage Stats"}
							</h1>
							<p className="text-base-content/70">
								Manage stats for this collection
							</p>
						</div>
						<button
							onClick={() => {
								setSelectedCollectionId(null);
								setStats([]);
							}}
							className="btn btn-ghost"
						>
							Back to Collections
						</button>
					</div>

					{/* Twitch API Section */}
					<div className="card bg-base-200 shadow-xl w-full">
						<div className="card-body">
							<h2 className="text-xl text-primary font-bold mb-4">
								Import from Twitch API
							</h2>
							<div className="space-y-4">
								<div>
									<label className="label">
										<span className="label-text">Channel Name</span>
									</label>
									<input
										type="text"
										className="input input-bordered w-full"
										value={twitchChannelName}
										onChange={(e) => setTwitchChannelName(e.target.value)}
										placeholder="leagueofparis"
									/>
								</div>
								<div>
									<label className="label">
										<span className="label-text">Twitch Access Token</span>
									</label>
									<input
										type="password"
										className="input input-bordered w-full"
										value={twitchAccessToken}
										onChange={(e) => setTwitchAccessToken(e.target.value)}
										placeholder="Enter Twitch OAuth access token"
									/>
								</div>
								<button
									onClick={handleFetchTwitchStats}
									className="btn btn-primary"
									disabled={loadingTwitch || !twitchAccessToken.trim()}
								>
									{loadingTwitch ? "Fetching..." : "Fetch Twitch Stats"}
								</button>
							</div>
						</div>
					</div>

					{/* Stats List */}
					<div className="card bg-base-200 shadow-xl w-full">
						<div className="card-body">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl text-primary font-bold">Stats</h2>
								<button
									onClick={() => {
										setEditingStatId(null);
										setShowStatForm(true);
									}}
									className="btn btn-primary btn-sm"
								>
									Add Stat
								</button>
							</div>

							{loading && stats.length === 0 ? (
								<div className="text-center">
									<span className="loading loading-spinner loading-sm"></span>
									<span className="ml-2">Loading...</span>
								</div>
							) : stats.length > 0 ? (
								<div className="space-y-4 max-h-[600px] overflow-y-auto">
									{stats.map((stat, index) => (
										<div
											key={stat.id}
											className="bg-base-300 rounded-lg p-4 space-y-2"
										>
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<h3 className="text-lg font-bold text-primary-content">
														{stat.title}
													</h3>
													<p className="text-2xl font-bold text-primary mt-2">
														{stat.value}
													</p>
													{stat.description && (
														<p className="text-sm text-base-content/70 mt-1">
															{stat.description}
														</p>
													)}
													<div className="text-xs text-base-content/60 mt-2">
														<strong>Source:</strong> {stat.source || "manual"}
													</div>
												</div>
											</div>

											{stat.media_url && (
												<div className="w-full h-32 bg-base-200 rounded-lg flex items-center justify-center overflow-hidden mt-2">
													{stat.media_type === "image" ? (
														<img
															src={stat.media_url}
															alt={stat.title}
															className="max-w-full max-h-full object-contain"
														/>
													) : (
														<video
															src={stat.media_url}
															className="max-w-full max-h-full"
															controls
														/>
													)}
												</div>
											)}

											<div className="flex gap-2 mt-3">
												<button
													className="btn btn-sm btn-primary"
													onClick={() => handleEditStat(stat)}
													disabled={loading}
												>
													Edit
												</button>
												<button
													className="btn btn-sm btn-error"
													onClick={() => handleDeleteStat(stat.id)}
													disabled={loading}
												>
													Delete
												</button>
												{index > 0 && (
													<button
														className="btn btn-sm btn-ghost"
														onClick={() => handleMoveStat(stat.id, "up")}
														disabled={loading}
														title="Move up"
													>
														↑
													</button>
												)}
												{index < stats.length - 1 && (
													<button
														className="btn btn-sm btn-ghost"
														onClick={() => handleMoveStat(stat.id, "down")}
														disabled={loading}
														title="Move down"
													>
														↓
													</button>
												)}
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center text-base-content/70">
									No stats yet. Add your first stat!
								</div>
							)}
						</div>
					</div>

					{/* Status Message */}
					{status && (
						<div
							className={`w-full text-center font-medium ${
								status.includes("Failed") || status.includes("Invalid")
									? "text-red-600"
									: "text-success"
							}`}
						>
							{status}
						</div>
					)}
				</div>
			</div>
		);
	}

	if (showStatForm) {
		const editingStat = editingStatId ? stats.find(s => s.id === editingStatId) : null;

		return (
			<div className="min-h-screen py-10 px-2">
				<div className="w-full flex flex-col gap-8 justify-center items-center max-w-4xl mx-auto">
					<div className="w-full flex justify-between items-center">
						<h1 className="text-3xl font-extrabold text-base-content">
							{editingStat ? "Edit Stat" : "Create New Stat"}
						</h1>
						<button
							onClick={() => {
								setShowStatForm(false);
								setEditingStatId(null);
							}}
							className="btn btn-ghost"
						>
							Cancel
						</button>
					</div>

					<div className="card bg-base-200 shadow-xl w-full">
						<div className="card-body">
							<StatForm
								stat={editingStat}
								onSubmit={handleStatSubmit}
								onCancel={() => {
									setShowStatForm(false);
									setEditingStatId(null);
								}}
								loading={loading}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Collections management view
	return (
		<div className="min-h-screen py-10 px-2">
			<div className="w-full flex flex-col gap-8 justify-center items-center max-w-6xl mx-auto">
				<h1 className="text-3xl font-extrabold mb-2 text-base-content">
					Wrapped Collections Manager
				</h1>
				<p className="mb-8 text-base-content/70 text-lg">
					Create and manage wrapped collections and stats.
				</p>

				<div className="gap-8 flex flex-col lg:flex-row w-full justify-center items-start">
					{/* Form Section */}
					<div className="card bg-base-200 shadow-xl w-full lg:w-1/2">
						<div className="card-body">
							<h2 className="text-xl text-primary font-bold mb-4 w-full text-center">
								{editingCollectionId ? "Edit Collection" : "Create New Collection"}
							</h2>

							<form onSubmit={handleCollectionSubmit} className="space-y-4">
								<div>
									<label className="label">
										<span className="label-text text-primary">
											Title <span className="text-red-500">*</span>
										</span>
									</label>
									<input
										type="text"
										className="input input-bordered w-full"
										value={collectionTitle}
										onChange={(e) => setCollectionTitle(e.target.value)}
										placeholder="e.g., 2024 Wrapped"
										required
									/>
								</div>

								<div className="flex gap-4">
									<div className="flex-1">
										<label className="label">
											<span className="label-text text-primary">
												Year <span className="text-red-500">*</span>
											</span>
										</label>
										<input
											type="number"
											className="input input-bordered w-full"
											value={year}
											onChange={(e) => setYear(parseInt(e.target.value))}
											required
										/>
									</div>
									<div className="flex-1">
										<label className="label">
											<span className="label-text text-primary">Period</span>
										</label>
										<input
											type="text"
											className="input input-bordered w-full"
											value={period}
											onChange={(e) => setPeriod(e.target.value)}
											placeholder="e.g., Q1, Annual"
										/>
									</div>
								</div>

								<div>
									<label className="label">
										<span className="label-text text-primary">Description</span>
									</label>
									<textarea
										className="textarea textarea-bordered w-full h-24"
										value={collectionDescription}
										onChange={(e) => setCollectionDescription(e.target.value)}
										placeholder="Collection description (optional)"
									/>
								</div>

								<div>
									<label className="label">
										<span className="label-text text-primary">Cover Image URL</span>
									</label>
									<input
										type="url"
										className="input input-bordered w-full"
										value={coverImage}
										onChange={(e) => {
											setCoverImage(e.target.value);
											setCoverImageFile(null);
										}}
										placeholder="Cover image URL (optional)"
										disabled={!!coverImageFile}
									/>
									<div className="text-center text-sm text-base-content/70 my-2">
										OR
									</div>
									<div>
										<input
											id="coverImageFileInput"
											type="file"
											onChange={(e) => {
												setCoverImageFile(e.target.files?.[0] || null);
												setCoverImage("");
											}}
											className="hidden"
											accept="image/*"
										/>
										<label
											htmlFor="coverImageFileInput"
											className={`btn btn-secondary w-full text-white cursor-pointer ${
												coverImage ? "btn-disabled" : ""
											}`}
										>
											{coverImageFile ? coverImageFile.name : "Upload Cover Image"}
										</label>
									</div>
									{coverImageFile && (
										<div className="mt-2">
											<label className="label">
												<span className="label-text text-primary">
													Upload Key <span className="text-red-500">*</span>
												</span>
											</label>
											<input
												type="password"
												className="input input-bordered w-full"
												value={uploadKey}
												onChange={(e) => setUploadKey(e.target.value)}
												placeholder="Enter upload key"
											/>
										</div>
									)}
								</div>

								<div className="form-control">
									<label className="label cursor-pointer">
										<span className="label-text text-primary">Published</span>
										<input
											type="checkbox"
											className="toggle toggle-primary"
											checked={isPublished}
											onChange={(e) => setIsPublished(e.target.checked)}
										/>
									</label>
								</div>

								<div className="flex gap-2">
									<button
										type="submit"
										className="btn btn-primary flex-1"
										disabled={loading || !collectionTitle.trim()}
									>
										{loading
											? "Saving..."
											: editingCollectionId
											? "Update Collection"
											: "Create Collection"}
									</button>
									{editingCollectionId && (
										<button
											type="button"
											className="btn btn-ghost"
											onClick={resetCollectionForm}
											disabled={loading}
										>
											Cancel
										</button>
									)}
								</div>

								{status && (
									<div
										className={`min-h-[24px] text-center font-medium ${
											status.includes("Failed") || status.includes("Invalid")
												? "text-red-600"
												: "text-success"
										}`}
									>
										{status}
									</div>
								)}
							</form>
						</div>
					</div>

					{/* Collections List */}
					<div className="card bg-base-200 shadow-xl w-full lg:w-1/2">
						<div className="card-body">
							<h2 className="text-xl text-primary font-bold mb-4 w-full text-center">
								All Collections
							</h2>

							{loading && collections.length === 0 ? (
								<div className="text-center">
									<span className="loading loading-spinner loading-sm"></span>
									<span className="ml-2">Loading...</span>
								</div>
							) : collections.length > 0 ? (
								<div className="space-y-4 max-h-[600px] overflow-y-auto">
									{collections.map((collection) => (
										<div
											key={collection.id}
											className="bg-base-300 rounded-lg p-4 space-y-2"
										>
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<h3 className="text-lg font-bold text-primary-content">
														{collection.title}
													</h3>
													<div className="text-sm text-base-content/70 mt-1">
														{collection.year}
														{collection.period && ` • ${collection.period}`}
														{collection.is_featured && (
															<span className="badge badge-warning badge-sm ml-2">
																Featured
															</span>
														)}
														{collection.is_published && (
															<span className="badge badge-success badge-sm ml-2">
																Published
															</span>
														)}
													</div>
													{collection.description && (
														<p className="text-sm text-base-content/70 mt-1">
															{collection.description}
														</p>
													)}
												</div>
											</div>

											{collection.cover_image && (
												<div className="w-full h-32 bg-base-200 rounded-lg flex items-center justify-center overflow-hidden mt-2">
													<img
														src={collection.cover_image}
														alt={collection.title}
														className="max-w-full max-h-full object-contain"
													/>
												</div>
											)}

											<div className="flex flex-wrap gap-2 mt-3">
												<button
													className="btn btn-sm btn-primary"
													onClick={() => setSelectedCollectionId(collection.id)}
													disabled={loading}
												>
													Manage Stats
												</button>
												<button
													className="btn btn-sm btn-secondary"
													onClick={() => handleEditCollection(collection)}
													disabled={loading}
												>
													Edit
												</button>
												{!collection.is_featured && (
													<button
														className="btn btn-sm btn-warning"
														onClick={() => handleSetFeatured(collection.id)}
														disabled={loading}
													>
														Set Featured
													</button>
												)}
												<button
													className="btn btn-sm btn-error"
													onClick={() => handleDeleteCollection(collection.id)}
													disabled={loading}
												>
													Delete
												</button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center text-base-content/70">
									No collections yet. Create your first collection!
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default WrappedManager;

