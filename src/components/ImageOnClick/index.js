import React, { useState } from 'react'; // Import React and useState hook
import clsx from 'clsx'; // Import clsx library for conditional classes
import useBaseUrl from '@docusaurus/useBaseUrl'; // Import the useBaseUrl function from Docusaurus
import styles from './styles.module.css'; // Import styles from CSS module

// Define the ImageOnClick component as a functional component
const ImageOnClick = ({ imageUrl, altText, buttonName }) => {
  const [showImg, setShowImg] = useState(false); // State to track whether image should be shown or hidden

  const generatedImageUrl = useBaseUrl(imageUrl); // Use the useBaseUrl function to generate the image URL

  return (
    <span>
      {/* Button to toggle visibility of the image */}
      <a onClick={() => setShowImg(!showImg)} className={styles.cursor}>
        {buttonName}  
      </a>
      {/* Conditionally render the image if showImg is true */}
      {showImg && (
        <div className={styles.imageonclick} onClick={() => setShowImg(false)}>
          {/* Close button */}
          <button 
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation();
              setShowImg(false);
            }}
            aria-label="Close image"
          >
            ✕
          </button>
          {/* Image element */}
          <img 
            src={generatedImageUrl} 
            alt={altText} 
            onClick={(e) => e.stopPropagation()}
          /> 
        </div>
      )}
    </span>
  );
}

export default ImageOnClick; // Export the ImageOnClick component