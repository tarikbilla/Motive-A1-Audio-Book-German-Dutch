import { useEffect, useRef, useState } from "react";
import { pdfjs } from "react-pdf";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { Howl } from "howler";
import audioMap from "./audioMap";
import "./index.css";

// Set PDF.js worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function App() {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const scale = 1.5;

  const currentSound = useRef(null);

  const handlePlay = (audioSrc) => {
    // Stop currently playing audio
    if (currentSound.current) {
      currentSound.current.stop();
    }

    const sound = new Howl({
      src: [audioSrc],
      html5: true
    });

    currentSound.current = sound;
    sound.play();
  };

  const stopAudio = () => {
    if (currentSound.current) {
      currentSound.current.stop();
      currentSound.current = null;
    }
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => {
      const nextPage = Math.max(prev - 1, 1);
      if (nextPage !== prev) stopAudio();
      return nextPage;
    });
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => {
      const nextPage = Math.min(prev + 1, numPages);
      if (nextPage !== prev) stopAudio();
      return nextPage;
    });
  };

  useEffect(() => {
    return () => {
      stopAudio(); // Cleanup on unmount
    };
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Motive A1 Kursbuch</h1>
        <p>Read and listen interactively</p>
      </header>

      <div className="pdf-viewer">
        <Document
          file="/motive-a1-kursbuch-1.pdf"
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>

        {audioMap
          .filter(a => a.page === currentPage)
          .map((btn, idx) => (
            <button
              key={idx}
              className="audio-btn"
              style={{ top: btn.y, left: btn.x }}
              onClick={() => handlePlay(btn.audio)}
            >
              🔊 {btn.label}
            </button>
          ))}
      </div>

      <div className="fixed-navbar">
        <div className="nav-controls">
          <button onClick={goToPrevPage}>⬅ Prev</button>
          <span>Page {currentPage} / {numPages}</span>
          <button onClick={goToNextPage}>Next ➡</button>
        </div>
      </div>
    </div>
  );
}
