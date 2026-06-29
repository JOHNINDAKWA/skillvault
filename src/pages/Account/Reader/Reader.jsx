import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import {
  FiArrowLeft,
  FiDownload,
  FiMaximize,
  FiMinimize,
  FiMinus,
  FiMoon,
  FiPlus,
  FiSun,
} from "react-icons/fi";

import { resources } from "../../../data/resources.js";
import trainingPdf from "../../../assets/docs/Maternal-Massage-Training.pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./Reader.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const READER_THEME_KEY = "skillvault_reader_theme";

function getDefaultScale() {
  if (typeof window === "undefined") {
    return 1.5;
  }

  if (window.innerWidth <= 560) {
    return 1;
  }

  if (window.innerWidth <= 900) {
    return 1.15;
  }

  return 1.5;
}

function Reader() {
  const { slug } = useParams();

  const readerRef = useRef(null);
  const documentShellRef = useRef(null);
  const pageRefs = useRef([]);

  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(() => getDefaultScale());
  const [fitWidth, setFitWidth] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readerTheme, setReaderTheme] = useState(() => {
    return localStorage.getItem(READER_THEME_KEY) || "light";
  });

  const resource = useMemo(() => {
    return resources.find((item) => item.slug === slug) || resources[0];
  }, [slug]);

  const pages = useMemo(() => {
    if (!numPages) {
      return [];
    }

    return Array.from({ length: numPages }, (_, index) => index + 1);
  }, [numPages]);

  const shouldUseFitWidth = fitWidth !== null;

  const onDocumentLoadSuccess = ({ numPages: loadedPages }) => {
    setNumPages(loadedPages);
  };

  const updateFitWidth = () => {
    const shell = documentShellRef.current;

    if (!shell) {
      return;
    }

    if (window.innerWidth <= 700) {
      const availableWidth = shell.clientWidth - 24;
      setFitWidth(Math.max(availableWidth, 260));
      setScale(1);
      return;
    }

    setFitWidth(null);
  };

  const updateReadingState = () => {
    const shell = documentShellRef.current;

    if (!shell) {
      return;
    }

    const maxScroll = shell.scrollHeight - shell.clientHeight;

    if (maxScroll <= 0) {
      setReadingProgress(0);
    } else {
      const progress = Math.round((shell.scrollTop / maxScroll) * 100);
      setReadingProgress(Math.min(Math.max(progress, 0), 100));
    }

    const shellTop = shell.getBoundingClientRect().top;
    let closestPage = 1;
    let closestDistance = Infinity;

    pageRefs.current.forEach((pageElement, index) => {
      if (!pageElement) {
        return;
      }

      const pageTop = pageElement.getBoundingClientRect().top;
      const distance = Math.abs(pageTop - shellTop - 24);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPage = index + 1;
      }
    });

    setCurrentPage(closestPage);
  };

  const zoomOut = () => {
    setFitWidth(null);
    setScale((currentScale) => Math.max(currentScale - 0.15, 0.7));
  };

  const zoomIn = () => {
    setFitWidth(null);
    setScale((currentScale) => Math.min(currentScale + 0.15, 2));
  };

  const resetFitView = () => {
    if (window.innerWidth <= 700) {
      updateFitWidth();
      return;
    }

    setFitWidth(null);
    setScale(1.5);
  };

  const toggleReaderTheme = () => {
    setReaderTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  };

  const toggleFullscreen = async () => {
    if (!readerRef.current) {
      return;
    }

    if (!document.fullscreenElement) {
      await readerRef.current.requestFullscreen();
      setIsFullscreen(true);
      return;
    }

    await document.exitFullscreen();
    setIsFullscreen(false);
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }

    setIsFullscreen(false);
  };

  useEffect(() => {
    localStorage.setItem(READER_THEME_KEY, readerTheme);
  }, [readerTheme]);

  useEffect(() => {
    updateFitWidth();

    const handleResize = () => {
      updateFitWidth();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    window.setTimeout(updateReadingState, 200);
  }, [numPages, scale, fitWidth]);

  return (
    <section
      className={`reader-page ${
        readerTheme === "dark" ? "reader-dark" : "reader-light"
      }`}
      ref={readerRef}
    >
      <header className="reader-topbar">
        <div className="reader-title-block">
          <Link to="/account/library" className="reader-back-link">
            <FiArrowLeft />
            Library
          </Link>

          <div>
            <span>Reading Now</span>
            <h1>{resource.title || "Maternal Massage Training"}</h1>
          </div>
        </div>

        <div className="reader-actions">
          <a href={trainingPdf} download className="reader-action-btn">
            <FiDownload />
            Download
          </a>

          <button
            type="button"
            className="reader-action-btn"
            onClick={toggleFullscreen}
          >
            <FiMaximize />
            Fullscreen
          </button>
        </div>
      </header>

      <div className="reader-sticky-controls">
        <div className="reader-progress-area">
          <div className="reader-progress-info">
            <span>{readingProgress}% read</span>

            <p>
              Page {currentPage}
              {numPages ? ` of ${numPages}` : ""}
            </p>
          </div>

          <div className="reader-progress-track">
            <span style={{ width: `${readingProgress}%` }} />
          </div>
        </div>

        <div className="reader-control-actions">
          <button type="button" onClick={zoomOut}>
            <FiMinus />
          </button>

          <button type="button" className="reader-scale-btn" onClick={resetFitView}>
            {shouldUseFitWidth ? "Fit" : `${Math.round(scale * 100)}%`}
          </button>

          <button type="button" onClick={zoomIn}>
            <FiPlus />
          </button>

          <button type="button" onClick={toggleReaderTheme}>
            {readerTheme === "dark" ? <FiSun /> : <FiMoon />}
            {readerTheme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      {isFullscreen && (
        <button
          type="button"
          className="reader-fullscreen-exit"
          onClick={exitFullscreen}
        >
          <FiMinimize />
          Exit
        </button>
      )}

      <main
        className="reader-document-shell"
        ref={documentShellRef}
        onScroll={updateReadingState}
      >
        <div className="reader-document-stage">
          <Document
            file={trainingPdf}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="reader-loading">
                <span />
                <p>Loading reader...</p>
              </div>
            }
            error={
              <div className="reader-error">
                <h2>Unable to open this resource</h2>
                <p>Confirm the PDF exists under assets/docs and try again.</p>
              </div>
            }
          >
            {pages.map((page) => (
              <div
                className="reader-page-item"
                key={page}
                ref={(element) => {
                  pageRefs.current[page - 1] = element;
                }}
              >
                <Page
                  pageNumber={page}
                  scale={shouldUseFitWidth ? undefined : scale}
                  width={shouldUseFitWidth ? fitWidth : undefined}
                  renderTextLayer
                  renderAnnotationLayer
                />

                <span className="reader-page-number">Page {page}</span>
              </div>
            ))}
          </Document>
        </div>
      </main>
    </section>
  );
}

export default Reader;