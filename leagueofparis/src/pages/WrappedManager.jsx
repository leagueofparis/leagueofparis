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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Loader2 } from "lucide-react";

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
							<h1 className="text-3xl font-extrabold mb-2 text-foreground">
								{selectedCollection?.title || "Manage Stats"}
							</h1>
							<p className="text-muted-foreground">
								Manage stats for this collection
							</p>
						</div>
						<Button
							variant="ghost"
							onClick={() => {
								setSelectedCollectionId(null);
								setStats([]);
							}}
						>
							Back to Collections
						</Button>
					</div>

					{/* Twitch API Section */}
					<Card className="w-full">
						<CardHeader>
							<CardTitle className="text-primary">Import from Twitch API</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="twitch-channel">Channel Name</Label>
								<Input
									id="twitch-channel"
									type="text"
									value={twitchChannelName}
									onChange={(e) => setTwitchChannelName(e.target.value)}
									placeholder="leagueofparis"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="twitch-token">Twitch Access Token</Label>
								<Input
									id="twitch-token"
									type="password"
									value={twitchAccessToken}
									onChange={(e) => setTwitchAccessToken(e.target.value)}
									placeholder="Enter Twitch OAuth access token"
								/>
							</div>
							<Button
								onClick={handleFetchTwitchStats}
								disabled={loadingTwitch || !twitchAccessToken.trim()}
							>
								{loadingTwitch && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{loadingTwitch ? "Fetching..." : "Fetch Twitch Stats"}
							</Button>
						</CardContent>
					</Card>

					{/* Stats List */}
					<Card className="w-full">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-primary">Stats</CardTitle>
							<Button
								size="sm"
								onClick={() => {
									setEditingStatId(null);
									setShowStatForm(true);
								}}
							>
								Add Stat
							</Button>
						</CardHeader>
						<CardContent>
							{loading && stats.length === 0 ? (
								<div className="flex items-center justify-center py-4">
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									<span>Loading...</span>
								</div>
							) : stats.length > 0 ? (
								<div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
									{stats.map((stat, index) => (
										<div
											key={stat.id}
											className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border"
										>
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<h3 className="text-lg font-bold text-foreground">
														{stat.title}
													</h3>
													<p className="text-2xl font-bold text-primary mt-2">
														{stat.value}
													</p>
													{stat.description && (
														<p className="text-sm text-muted-foreground mt-1">
															{stat.description}
														</p>
													)}
													<div className="text-xs text-muted-foreground mt-2">
														<strong>Source:</strong> {stat.source || "manual"}
													</div>
												</div>
											</div>

											{stat.media_url && (
												<div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden mt-2 border">
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

											<div className="flex gap-2 mt-3 items-center">
												<Button
													size="sm"
													onClick={() => handleEditStat(stat)}
													disabled={loading}
												>
													Edit
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={() => handleDeleteStat(stat.id)}
													disabled={loading}
												>
													Delete
												</Button>
												<div className="flex ml-auto gap-1">
													{index > 0 && (
														<Button
															size="icon"
															variant="ghost"
															onClick={() => handleMoveStat(stat.id, "up")}
															disabled={loading}
															title="Move up"
														>
															↑
														</Button>
													)}
													{index < stats.length - 1 && (
														<Button
															size="icon"
															variant="ghost"
															onClick={() => handleMoveStat(stat.id, "down")}
															disabled={loading}
															title="Move down"
														>
															↓
														</Button>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center text-muted-foreground py-8">
									No stats yet. Add your first stat!
								</div>
							)}
						</CardContent>
					</Card>

					{/* Status Message */}
					{status && (
						<div
							className={`w-full text-center font-medium ${
								status.includes("Failed") || status.includes("Invalid")
									? "text-destructive"
									: "text-green-600"
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
						<h1 className="text-3xl font-extrabold text-foreground">
							{editingStat ? "Edit Stat" : "Create New Stat"}
						</h1>
						<Button
							variant="ghost"
							onClick={() => {
								setShowStatForm(false);
								setEditingStatId(null);
							}}
						>
							Cancel
						</Button>
					</div>

					<Card className="w-full">
						<CardContent className="pt-6">
							<StatForm
								stat={editingStat}
								onSubmit={handleStatSubmit}
								onCancel={() => {
									setShowStatForm(false);
									setEditingStatId(null);
								}}
								loading={loading}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	// Collections management view
	return (
		<div className="min-h-screen py-10 px-2">
			<div className="w-full flex flex-col gap-8 justify-center items-center max-w-6xl mx-auto">
				<div className="text-center">
					<h1 className="text-3xl font-extrabold mb-2 text-foreground">
						Wrapped Collections Manager
					</h1>
					<p className="text-muted-foreground text-lg">
						Create and manage wrapped collections and stats.
					</p>
				</div>

				<div className="gap-8 flex flex-col lg:flex-row w-full justify-center items-start">
					{/* Form Section */}
					<Card className="w-full lg:w-1/2">
						<CardHeader>
							<CardTitle className="text-primary text-center">
								{editingCollectionId ? "Edit Collection" : "Create New Collection"}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleCollectionSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="title">
										Title <span className="text-destructive">*</span>
									</Label>
									<Input
										id="title"
										type="text"
										value={collectionTitle}
										onChange={(e) => setCollectionTitle(e.target.value)}
										placeholder="e.g., 2024 Wrapped"
										required
									/>
								</div>

								<div className="flex gap-4">
									<div className="flex-1 space-y-2">
										<Label htmlFor="year">
											Year <span className="text-destructive">*</span>
										</Label>
										<Input
											id="year"
											type="number"
											value={year}
											onChange={(e) => setYear(parseInt(e.target.value))}
											required
										/>
									</div>
									<div className="flex-1 space-y-2">
										<Label htmlFor="period">Period</Label>
										<Input
											id="period"
											type="text"
											value={period}
											onChange={(e) => setPeriod(e.target.value)}
											placeholder="e.g., Q1, Annual"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										className="h-24"
										value={collectionDescription}
										onChange={(e) => setCollectionDescription(e.target.value)}
										placeholder="Collection description (optional)"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="coverImage">Cover Image URL</Label>
									<div className="space-y-2">
										<Input
											id="coverImage"
											type="url"
											value={coverImage}
											onChange={(e) => {
												setCoverImage(e.target.value);
												setCoverImageFile(null);
											}}
											placeholder="Cover image URL (optional)"
											disabled={!!coverImageFile}
										/>
										<div className="text-center text-sm text-muted-foreground">OR</div>
										<div className="relative">
											<Input
												id="coverImageFileInput"
												type="file"
												onChange={(e) => {
													setCoverImageFile(e.target.files?.[0] || null);
													setCoverImage("");
												}}
												className="cursor-pointer"
												accept="image/*"
											/>
										</div>
										{coverImageFile && (
											<div className="space-y-2">
												<Label htmlFor="uploadKey">
													Upload Key <span className="text-destructive">*</span>
												</Label>
												<Input
													id="uploadKey"
													type="password"
													value={uploadKey}
													onChange={(e) => setUploadKey(e.target.value)}
													placeholder="Enter upload key"
												/>
											</div>
										)}
									</div>
								</div>

								<div className="flex items-center space-x-2">
									<Switch
										id="published"
										checked={isPublished}
										onCheckedChange={setIsPublished}
									/>
									<Label htmlFor="published">Published</Label>
								</div>

								<div className="flex gap-2 pt-2">
									<Button
										type="submit"
										className="flex-1"
										disabled={loading || !collectionTitle.trim()}
									>
										{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
										{loading
											? "Saving..."
											: editingCollectionId
											? "Update Collection"
											: "Create Collection"}
									</Button>
									{editingCollectionId && (
										<Button
											type="button"
											variant="ghost"
											onClick={resetCollectionForm}
											disabled={loading}
										>
											Cancel
										</Button>
									)}
								</div>

								{status && (
									<div
										className={`min-h-[24px] text-center font-medium ${
											status.includes("Failed") || status.includes("Invalid")
												? "text-destructive"
												: "text-green-600"
										}`}
									>
										{status}
									</div>
								)}
							</form>
						</CardContent>
					</Card>

					{/* Collections List */}
					<Card className="w-full lg:w-1/2">
						<CardHeader>
							<CardTitle className="text-primary text-center">All Collections</CardTitle>
						</CardHeader>
						<CardContent>
							{loading && collections.length === 0 ? (
								<div className="flex items-center justify-center py-4">
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									<span>Loading...</span>
								</div>
							) : collections.length > 0 ? (
								<div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
									{collections.map((collection) => (
										<div
											key={collection.id}
											className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border"
										>
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<h3 className="text-lg font-bold text-foreground">
														{collection.title}
													</h3>
													<div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
														<span>{collection.year}</span>
														{collection.period && <span>• {collection.period}</span>}
														{collection.is_featured && (
															<Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30">
																Featured
															</Badge>
														)}
														{collection.is_published && (
															<Badge variant="secondary" className="bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30">
																Published
															</Badge>
														)}
													</div>
													{collection.description && (
														<p className="text-sm text-muted-foreground mt-1">
															{collection.description}
														</p>
													)}
												</div>
											</div>

											{collection.cover_image && (
												<div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden mt-2 border">
													<img
														src={collection.cover_image}
														alt={collection.title}
														className="max-w-full max-h-full object-contain"
													/>
												</div>
											)}

											<div className="flex flex-wrap gap-2 mt-3">
												<Button
													size="sm"
													onClick={() => setSelectedCollectionId(collection.id)}
													disabled={loading}
												>
													Manage Stats
												</Button>
												<Button
													size="sm"
													variant="secondary"
													onClick={() => handleEditCollection(collection)}
													disabled={loading}
												>
													Edit
												</Button>
												{!collection.is_featured && (
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleSetFeatured(collection.id)}
														disabled={loading}
													>
														Set Featured
													</Button>
												)}
												<Button
													size="sm"
													variant="destructive"
													onClick={() => handleDeleteCollection(collection.id)}
													disabled={loading}
												>
													Delete
												</Button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center text-muted-foreground py-8">
									No collections yet. Create your first collection!
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default WrappedManager;
