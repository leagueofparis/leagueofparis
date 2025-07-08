import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import { getImageUrl, getUsedWillowWednesdays } from "../supabaseClient";
import Modal from "../components/Modal";
import "./Gallery.css";

const WillowWednesdays = () => {
	const breakpointColumns = {
		default: 4,
		1100: 3,
		700: 2,
		500: 1,
	};
	const [images, setImages] = useState([]);
	const [selectedImage, setSelectedImage] = useState(null);

	useEffect(() => {
		getUsedWillowWednesdays().then((urls) => setImages(urls));
	}, []);

	const handleImageClick = (image) => {
		setSelectedImage(image);
	};

	const closeModal = () => {
		setSelectedImage(null);
	};

	return (
		<div className="flex flex-col items-center justify-center">
			<h1 className="text-4xl font-bold text-center mb-10">
				Willow Wednesdays
			</h1>
			<div className="gallery-container w-[70%] mx-auto">
				<Masonry
					breakpointCols={breakpointColumns}
					className="my-masonry-grid"
					columnClassName="my-masonry-grid_column"
				>
					{images.map((image) => (
						<div key={image.id} className="gallery-item">
							<p>{new Date(image.created_at).toLocaleDateString()}</p>
							<img
								src={getImageUrl("willow-wednesdays/" + image.file_name)}
								alt={image.file_name}
								className="gallery-image cursor-pointer hover:opacity-80 transition-opacity"
								onClick={() => handleImageClick(image)}
							/>
						</div>
					))}
				</Masonry>

				<Modal isOpen={!!selectedImage} onClose={closeModal}>
					<div className="relative">
						<button
							onClick={closeModal}
							className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
						>
							×
						</button>
						<img
							src={getImageUrl("willow-wednesdays/" + selectedImage?.file_name)}
							alt="Enlarged view"
							className="w-full h-auto max-h-[80vh] object-contain"
						/>
					</div>
				</Modal>
			</div>
		</div>
	);
};

export default WillowWednesdays;
