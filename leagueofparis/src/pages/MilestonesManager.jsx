import React, { useState, useEffect } from "react";
import {
	getMilestones,
	createMilestone,
	updateMilestone,
	deleteMilestone,
	uploadImage,
} from "../supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Loader2 } from "lucide-react";

function MilestonesManager() {
	const [milestones, setMilestones] = useState([]);
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState("");
	const [editingId, setEditingId] = useState(null);

	// Form states
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState("");
	const [link, setLink] = useState("");
	const [image, setImage] = useState("");
	const [imageFile, setImageFile] = useState(null);
	const [uploadKey, setUploadKey] = useState("");

	useEffect(() => {
		fetchMilestones();
	}, []);

	const fetchMilestones = async () => {
		try {
			setLoading(true);
			const data = await getMilestones();
			setMilestones(data);
		} catch (error) {
			console.error("Error fetching milestones:", error);
			setStatus("Failed to load milestones: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setTitle("");
		setDescription("");
		setDate("");
		setLink("");
		setImage("");
		setImageFile(null);
		setUploadKey("");
		setEditingId(null);
		setStatus("");
	};

	const handleEdit = (milestone) => {
		setEditingId(milestone.id);
		setTitle(milestone.title || "");
		setDescription(milestone.description || "");
		setDate(milestone.date ? new Date(milestone.date).toISOString().slice(0, 16) : "");
		setLink(milestone.link || "");
		setImage(milestone.image || "");
		setImageFile(null);
		setUploadKey("");
		setStatus("");
	};

	const handleCancel = () => {
		resetForm();
	};

	const handleImageChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			setImage(""); // Clear URL if file is selected
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!title.trim()) {
			setStatus("Please enter a title.");
			return;
		}

		if (!date) {
			setStatus("Please select a date.");
			return;
		}

		setLoading(true);
		setStatus("");

		try {
			let imageUrl = image;

			// Upload image if file is selected
			if (imageFile) {
				if (!uploadKey.trim()) {
					setStatus("Please enter upload key for image upload.");
					setLoading(false);
					return;
				}
				setStatus("Uploading image...");
				const uploadedUrl = await uploadImage(
					imageFile,
					"milestones",
					uploadKey
				);
				imageUrl = uploadedUrl;
			}

			const milestoneData = {
				title: title.trim(),
				description: description.trim() || null,
				date: new Date(date).toISOString(),
				link: link.trim() || null,
				image: imageUrl || null,
			};

			if (editingId) {
				await updateMilestone(editingId, milestoneData);
				setStatus("Milestone updated successfully!");
			} else {
				await createMilestone(milestoneData);
				setStatus("Milestone created successfully!");
			}

			resetForm();
			await fetchMilestones();
		} catch (error) {
			console.error("Error saving milestone:", error);
			setStatus("Failed to save milestone: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to delete this milestone?")) {
			return;
		}

		try {
			setLoading(true);
			await deleteMilestone(id);
			setStatus("Milestone deleted successfully!");
			await fetchMilestones();
		} catch (error) {
			console.error("Error deleting milestone:", error);
			setStatus("Failed to delete milestone: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatDateTime = (dateString) => {
		return new Date(dateString).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="min-h-screen py-10 px-2">
			<div className="w-full flex flex-col gap-8 justify-center items-center max-w-6xl mx-auto">
				<div className="text-center">
					<h1 className="text-3xl font-extrabold mb-2 text-foreground">
						Milestones Manager
					</h1>
					<p className="text-muted-foreground text-lg">
						Create and manage milestones.
					</p>
				</div>

				<div className="gap-8 flex flex-col lg:flex-row w-full justify-center items-start">
					{/* Form Section */}
					<Card className="w-full lg:w-1/2">
						<CardHeader>
							<CardTitle className="text-primary text-center">
								{editingId ? "Edit Milestone" : "Create New Milestone"}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="title">
										Title <span className="text-destructive">*</span>
									</Label>
									<Input
										id="title"
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="Enter milestone title"
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										className="h-24"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Enter milestone description (optional)"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="date">
										Date <span className="text-destructive">*</span>
									</Label>
									<Input
										id="date"
										type="datetime-local"
										value={date}
										onChange={(e) => setDate(e.target.value)}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="link">Link</Label>
									<Input
										id="link"
										type="url"
										value={link}
										onChange={(e) => setLink(e.target.value)}
										placeholder="https://example.com (optional)"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="image">Image</Label>
									<div className="space-y-2">
										<Input
											id="image"
											type="url"
											value={image}
											onChange={(e) => {
												setImage(e.target.value);
												setImageFile(null);
											}}
											placeholder="Image URL (optional)"
											disabled={!!imageFile}
										/>
										<div className="text-center text-sm text-muted-foreground">OR</div>
										<div className="relative">
											<Input
												id="imageFileInput"
												type="file"
												onChange={handleImageChange}
												className="cursor-pointer"
												accept="image/*"
											/>
										</div>
										{imageFile && (
											<div className="space-y-2 pt-2">
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

								{(image || imageFile) && (
									<div className="space-y-2">
										<Label>Preview</Label>
										<div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
											{imageFile ? (
												<img
													src={URL.createObjectURL(imageFile)}
													alt="Preview"
													className="max-w-full max-h-full object-contain"
												/>
											) : image ? (
												<img
													src={image}
													alt="Preview"
													className="max-w-full max-h-full object-contain"
													onError={(e) => {
														e.target.style.display = "none";
														e.target.nextSibling.style.display = "block";
													}}
												/>
											) : null}
											<span style={{ display: "none" }} className="text-muted-foreground">
												Failed to load image
											</span>
										</div>
									</div>
								)}

								<div className="flex gap-2 w-full pt-2">
									<Button
										type="submit"
										className="flex-1"
										disabled={loading || !title.trim() || !date}
									>
										{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
										{loading
											? "Saving..."
											: editingId
											? "Update Milestone"
											: "Create Milestone"}
									</Button>
									{editingId && (
										<Button
											type="button"
											variant="ghost"
											onClick={handleCancel}
											disabled={loading}
										>
											Cancel
										</Button>
									)}
								</div>

								<div
									className={`min-h-[24px] text-center font-medium ${
										status.includes("Failed") || status.includes("Invalid")
											? "text-destructive"
											: status
											? "text-green-600"
											: ""
									}`}
								>
									{status}
								</div>
							</form>
						</CardContent>
					</Card>

					{/* Milestones List Section */}
					<Card className="w-full lg:w-1/2">
						<CardHeader>
							<CardTitle className="text-primary text-center">All Milestones</CardTitle>
						</CardHeader>
						<CardContent>
							{loading && milestones.length === 0 ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="mr-2 h-8 w-8 animate-spin" />
									<span>Loading...</span>
								</div>
							) : milestones.length > 0 ? (
								<div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
									{milestones.map((milestone) => (
										<Card key={milestone.id} className="bg-muted/50 border-muted">
											<CardContent className="p-4 space-y-2">
												<div className="flex justify-between items-start">
													<div className="flex-1">
														<h3 className="text-lg font-bold text-foreground">
															{milestone.title}
														</h3>
														{milestone.description && (
															<p className="text-sm text-muted-foreground mt-1">
																{milestone.description}
															</p>
														)}
														<div className="text-xs text-muted-foreground mt-2 space-y-1">
															<div>
																<strong>Date:</strong> {formatDateTime(milestone.date)}
															</div>
															{milestone.link && (
																<div>
																	<strong>Link:</strong>{" "}
																	<a
																		href={milestone.link}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-primary hover:underline"
																	>
																		{milestone.link}
																	</a>
																</div>
															)}
															<div>
																<strong>Created:</strong> {formatDate(milestone.created_at)}
															</div>
														</div>
													</div>
												</div>

												{milestone.image && (
													<div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden mt-2 border">
														<img
															src={milestone.image}
															alt={milestone.title}
															className="max-w-full max-h-full object-contain"
															onError={(e) => {
																e.target.style.display = "none";
															}}
														/>
													</div>
												)}

												<div className="flex gap-2 mt-3">
													<Button
														size="sm"
														variant="default"
														onClick={() => handleEdit(milestone)}
														disabled={loading}
													>
														Edit
													</Button>
													<Button
														size="sm"
														variant="destructive"
														onClick={() => handleDelete(milestone.id)}
														disabled={loading}
													>
														Delete
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<div className="text-center text-muted-foreground py-8">
									No milestones yet. Create your first milestone!
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default MilestonesManager;
