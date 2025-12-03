import React, { useState, useEffect } from "react";
import {
	getMilestones,
	createMilestone,
	updateMilestone,
	deleteMilestone,
	uploadImage,
} from "../supabaseClient";

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
				<h1 className="text-3xl font-extrabold mb-2 text-base-content">
					Milestones Manager
				</h1>
				<p className="mb-8 text-base-content/70 text-lg">
					Create and manage milestones.
				</p>

				<div className="gap-8 flex flex-col lg:flex-row w-full justify-center items-start">
					{/* Form Section */}
					<div className="card bg-base-200 shadow-xl w-full lg:w-1/2">
						<div className="card-body">
							<h2 className="text-xl text-primary font-bold mb-4 w-full text-center">
								{editingId ? "Edit Milestone" : "Create New Milestone"}
							</h2>

							<form onSubmit={handleSubmit} className="space-y-4">
								{/* Title */}
								<div className="w-full">
									<label className="label">
										<span className="label-text text-primary">
											Title <span className="text-red-500">*</span>
										</span>
									</label>
									<input
										type="text"
										className="input input-bordered w-full"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="Enter milestone title"
										required
									/>
								</div>

								{/* Description */}
								<div className="w-full">
									<label className="label">
										<span className="label-text text-primary">Description</span>
									</label>
									<textarea
										className="textarea textarea-bordered w-full h-24"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Enter milestone description (optional)"
									/>
								</div>

								{/* Date */}
								<div className="w-full">
									<label className="label">
										<span className="label-text text-primary">
											Date <span className="text-red-500">*</span>
										</span>
									</label>
									<input
										type="datetime-local"
										className="input input-bordered w-full"
										value={date}
										onChange={(e) => setDate(e.target.value)}
										required
									/>
								</div>

								{/* Link */}
								<div className="w-full">
									<label className="label">
										<span className="label-text text-primary">Link</span>
									</label>
									<input
										type="url"
										className="input input-bordered w-full"
										value={link}
										onChange={(e) => setLink(e.target.value)}
										placeholder="https://example.com (optional)"
									/>
								</div>

								{/* Image Upload or URL */}
								<div className="w-full">
									<label className="label">
										<span className="label-text text-primary">Image</span>
									</label>
									<div className="space-y-2">
										{/* Image URL Input */}
										<input
											type="url"
											className="input input-bordered w-full"
											value={image}
											onChange={(e) => {
												setImage(e.target.value);
												setImageFile(null); // Clear file if URL is entered
											}}
											placeholder="Image URL (optional)"
											disabled={!!imageFile}
										/>
										<div className="text-center text-sm text-base-content/70">
											OR
										</div>
										{/* File Upload */}
										<div className="relative">
											<input
												id="imageFileInput"
												type="file"
												onChange={handleImageChange}
												className="hidden"
												accept="image/*"
											/>
											<label
												htmlFor="imageFileInput"
												className="btn btn-secondary w-full text-white cursor-pointer"
											>
												{imageFile ? imageFile.name : "Upload Image File"}
											</label>
										</div>
										{imageFile && (
											<div className="w-full">
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
								</div>

								{/* Preview Image */}
								{(image || imageFile) && (
									<div className="w-full">
										<label className="label">
											<span className="label-text text-primary">Preview</span>
										</label>
										<div className="w-full h-48 bg-base-300 rounded-lg flex items-center justify-center overflow-hidden">
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
											<span style={{ display: "none" }} className="text-base-content/70">
												Failed to load image
											</span>
										</div>
									</div>
								)}

								{/* Buttons */}
								<div className="flex gap-2 w-full">
									<button
										type="submit"
										className="btn btn-primary flex-1"
										disabled={loading || !title.trim() || !date}
									>
										{loading
											? "Saving..."
											: editingId
											? "Update Milestone"
											: "Create Milestone"}
									</button>
									{editingId && (
										<button
											type="button"
											className="btn btn-ghost"
											onClick={handleCancel}
											disabled={loading}
										>
											Cancel
										</button>
									)}
								</div>

								{/* Status Message */}
								<div
									className={`min-h-[24px] text-center font-medium ${
										status.includes("Failed") || status.includes("Invalid")
											? "text-red-600"
											: status
											? "text-success"
											: ""
									}`}
								>
									{status}
								</div>
							</form>
						</div>
					</div>

					{/* Milestones List Section */}
					<div className="card bg-base-200 shadow-xl w-full lg:w-1/2">
						<div className="card-body">
							<h2 className="text-xl text-primary font-bold mb-4 w-full text-center">
								All Milestones
							</h2>

							{loading && milestones.length === 0 ? (
								<div className="text-center">
									<span className="loading loading-spinner loading-sm"></span>
									<span className="ml-2">Loading...</span>
								</div>
							) : milestones.length > 0 ? (
								<div className="space-y-4 max-h-[600px] overflow-y-auto">
									{milestones.map((milestone) => (
										<div
											key={milestone.id}
											className="bg-base-300 rounded-lg p-4 space-y-2"
										>
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<h3 className="text-lg font-bold text-primary-content">
														{milestone.title}
													</h3>
													{milestone.description && (
														<p className="text-sm text-base-content/70 mt-1">
															{milestone.description}
														</p>
													)}
													<div className="text-xs text-base-content/60 mt-2 space-y-1">
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
																	className="link link-primary-content"
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
												<div className="w-full h-32 bg-base-200 rounded-lg flex items-center justify-center overflow-hidden mt-2">
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
												<button
													className="btn btn-sm btn-primary"
													onClick={() => handleEdit(milestone)}
													disabled={loading}
												>
													Edit
												</button>
												<button
													className="btn btn-sm btn-error"
													onClick={() => handleDelete(milestone.id)}
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
									No milestones yet. Create your first milestone!
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default MilestonesManager;

