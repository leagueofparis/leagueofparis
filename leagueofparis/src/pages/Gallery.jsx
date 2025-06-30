import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import { getImageUrls } from "../supabaseClient";
import Modal from "../components/Modal";
import "./Gallery.css";

const Gallery = () => {
	const breakpointColumns = {
		default: 4,
		1100: 3,
		700: 2,
		500: 1,
	};
	const [images, setImages] = useState([]);
	const [selectedImage, setSelectedImage] = useState(null);

	useEffect(() => {
		getImageUrls("art").then((urls) => setImages(urls));
	}, []);

	const handleImageClick = (image) => {
		setSelectedImage(image);
	};

	const closeModal = () => {
		setSelectedImage(null);
	};

	return (
		<div className="flex flex-col items-center justify-center">
			<h1 className="text-4xl font-bold text-center mb-10">Gallery</h1>
			<p className="text-center mb-10 w-[50%] mx-auto">
				Hi and welcome to my drawings gallery!!! I am not a professional by any
				means but I do love to draw and be creative. Please feel free to let me
				know of any ideas you may have or want me to draw and I might add it to
				my list!
			</p>
			<div className="gallery-container w-[70%] mx-auto">
				<Masonry
					breakpointCols={breakpointColumns}
					className="my-masonry-grid"
					columnClassName="my-masonry-grid_column"
				>
					{images.map((image) => (
						<div key={image.id} className="gallery-item">
							<img
								src={image}
								alt={image}
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
							src={selectedImage}
							alt="Enlarged view"
							className="w-full h-auto max-h-[80vh] object-contain"
						/>
					</div>
				</Modal>
			</div>
		</div>
	);
};

export default Gallery;
