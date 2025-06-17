import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import { getImageUrls } from "../supabaseClient";
import "./Gallery.css";

const Gallery = () => {
	const breakpointColumns = {
		default: 4,
		1100: 3,
		700: 2,
		500: 1,
	};
	const [images, setImages] = useState([]);

	useEffect(() => {
		getImageUrls("art").then((urls) => setImages(urls));
	}, []);

	return (
		<div className="gallery-container w-[70%] mx-auto">
			<Masonry
				breakpointCols={breakpointColumns}
				className="my-masonry-grid"
				columnClassName="my-masonry-grid_column"
			>
				{images.map((image) => (
					<div key={image.id} className="gallery-item">
						<img src={image} alt={image} className="gallery-image" />
					</div>
				))}
			</Masonry>
		</div>
	);
};

export default Gallery;
