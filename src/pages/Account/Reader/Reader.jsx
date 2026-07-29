import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiFileText,
  FiMaximize,
  FiMinimize,
  FiMinus,
  FiMoon,
  FiPlus,
  FiRefreshCcw,
  FiSun,
} from "react-icons/fi";

import {
  accountDashboardService,
} from "../../../services/accountDashboardService.js";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./Reader.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

const READER_THEME_KEY =
  "skillvault_reader_theme";

function clamp(
  value,
  minimum,
  maximum
) {
  return Math.min(
    Math.max(
      value,
      minimum
    ),
    maximum
  );
}

function Reader() {
  const {
    slug,
  } = useParams();

  const readerRef =
    useRef(null);

  const documentShellRef =
    useRef(null);

  const pageRefs =
    useRef([]);

  const scrollFrameRef =
    useRef(null);

  const hasRestoredPosition =
    useRef(false);

  const lastSavedProgress =
    useRef(0);

  const [
    resource,
    setResource,
  ] = useState(null);

  const [
    resourceError,
    setResourceError,
  ] = useState("");

  const [
    pdfError,
    setPdfError,
  ] = useState("");

  const [
    isLoadingResource,
    setIsLoadingResource,
  ] = useState(true);

  const [
    isDownloading,
    setIsDownloading,
  ] = useState(false);

  const [
    progressSaveState,
    setProgressSaveState,
  ] = useState("idle");

  const [
    numPages,
    setNumPages,
  ] = useState(0);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    viewerWidth,
    setViewerWidth,
  ] = useState(900);

  const [
    zoom,
    setZoom,
  ] = useState(1);

  const [
    isFullscreen,
    setIsFullscreen,
  ] = useState(false);

  const [
    readerTheme,
    setReaderTheme,
  ] = useState(() => {
    return (
      localStorage.getItem(
        READER_THEME_KEY
      ) ||
      "light"
    );
  });

  const pages =
    useMemo(() => {
      if (!numPages) {
        return [];
      }

      return Array.from(
        {
          length:
            numPages,
        },
        (
          _,
          index
        ) =>
          index + 1
      );
    }, [numPages]);

  const basePageWidth =
    useMemo(() => {
      return clamp(
        viewerWidth - 44,
        280,
        1180
      );
    }, [viewerWidth]);

  const renderedPageWidth =
    useMemo(() => {
      return Math.round(
        basePageWidth *
        zoom
      );
    }, [
      basePageWidth,
      zoom,
    ]);

  const readingPercent =
    useMemo(() => {
      if (!numPages) {
        return Number(
          resource?.progress ||
          0
        );
      }

      return clamp(
        Math.round(
          (
            currentPage /
            numPages
          ) *
          100
        ),
        0,
        100
      );
    }, [
      currentPage,
      numPages,
      resource,
    ]);

  const loadReader =
    useCallback(
      async () => {
        setIsLoadingResource(
          true
        );

        setResourceError("");
        setPdfError("");
        setNumPages(0);
        setCurrentPage(1);
        setZoom(1);

        pageRefs.current = [];

        hasRestoredPosition.current =
          false;

        try {
          const response =
            await accountDashboardService.getReaderResource(
              slug
            );

          const nextResource =
            response.data.reader;

          setResource(
            nextResource
          );

          lastSavedProgress.current =
            Number(
              nextResource.progress ||
              0
            );
        } catch (error) {
          setResource(null);

          setResourceError(
            error.message
          );
        } finally {
          setIsLoadingResource(
            false
          );
        }
      },
      [slug]
    );

  useEffect(() => {
    loadReader();
  }, [loadReader]);

  useEffect(() => {
    localStorage.setItem(
      READER_THEME_KEY,
      readerTheme
    );
  }, [readerTheme]);

  useEffect(() => {
    const shell =
      documentShellRef.current;

    if (!shell) {
      return undefined;
    }

    const updateWidth =
      () => {
        setViewerWidth(
          Math.max(
            shell.clientWidth,
            320
          )
        );
      };

    updateWidth();

    const observer =
      new ResizeObserver(
        updateWidth
      );

    observer.observe(
      shell
    );

    return () => {
      observer.disconnect();
    };
  }, [
    isLoadingResource,
    resource,
  ]);

  useEffect(() => {
    const handleFullscreenChange =
      () => {
        setIsFullscreen(
          Boolean(
            document.fullscreenElement
          )
        );
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  const updateVisiblePage =
    useCallback(() => {
      const shell =
        documentShellRef.current;

      if (
        !shell ||
        !numPages
      ) {
        return;
      }

      const shellRect =
        shell.getBoundingClientRect();

      const targetY =
        shellRect.top +
        Math.min(
          shellRect.height *
            0.32,
          240
        );

      let closestPage =
        currentPage;

      let closestDistance =
        Number.POSITIVE_INFINITY;

      pageRefs.current.forEach(
        (
          pageElement,
          index
        ) => {
          if (!pageElement) {
            return;
          }

          const pageRect =
            pageElement.getBoundingClientRect();

          const distance =
            Math.abs(
              pageRect.top -
              targetY
            );

          if (
            distance <
            closestDistance
          ) {
            closestDistance =
              distance;

            closestPage =
              index + 1;
          }
        }
      );

      setCurrentPage(
        closestPage
      );
    }, [
      currentPage,
      numPages,
    ]);

  const handleDocumentScroll =
    () => {
      if (
        scrollFrameRef.current
      ) {
        cancelAnimationFrame(
          scrollFrameRef.current
        );
      }

      scrollFrameRef.current =
        requestAnimationFrame(
          updateVisiblePage
        );
    };

  useEffect(() => {
    return () => {
      if (
        scrollFrameRef.current
      ) {
        cancelAnimationFrame(
          scrollFrameRef.current
        );
      }
    };
  }, []);

  const scrollToPage =
    useCallback(
      (
        pageNumber,
        behavior = "smooth"
      ) => {
        const nextPage =
          clamp(
            pageNumber,
            1,
            numPages ||
              1
          );

        const element =
          pageRefs.current[
            nextPage -
            1
          ];

        if (element) {
          element.scrollIntoView({
            behavior,
            block:
              "start",
          });
        }

        setCurrentPage(
          nextPage
        );
      },
      [numPages]
    );

  useEffect(() => {
    if (
      !numPages ||
      !resource ||
      hasRestoredPosition.current
    ) {
      return undefined;
    }

    const storedProgress =
      Number(
        resource.progress ||
        0
      );

    const targetPage =
      storedProgress >
      0
        ? clamp(
            Math.ceil(
              (
                storedProgress /
                100
              ) *
              numPages
            ),
            1,
            numPages
          )
        : 1;

    const restoreTimer =
      window.setTimeout(
        () => {
          scrollToPage(
            targetPage,
            "auto"
          );

          hasRestoredPosition.current =
            true;
        },
        500
      );

    return () => {
      window.clearTimeout(
        restoreTimer
      );
    };
  }, [
    numPages,
    resource,
    scrollToPage,
  ]);

  useEffect(() => {
    if (
      !resource?.id ||
      !numPages ||
      !hasRestoredPosition.current
    ) {
      return undefined;
    }

    const progressToSave =
      Math.max(
        Number(
          resource.progress ||
          0
        ),
        readingPercent
      );

    if (
      progressToSave <=
      lastSavedProgress.current
    ) {
      return undefined;
    }

    setProgressSaveState(
      "saving"
    );

    const saveTimer =
      window.setTimeout(
        async () => {
          try {
            await accountDashboardService.saveProgress(
              resource.id,
              progressToSave
            );

            lastSavedProgress.current =
              progressToSave;

            setResource(
              (
                currentResource
              ) => ({
                ...currentResource,
                progress:
                  progressToSave,
              })
            );

            setProgressSaveState(
              "saved"
            );
          } catch {
            setProgressSaveState(
              "error"
            );
          }
        },
        1200
      );

    return () => {
      window.clearTimeout(
        saveTimer
      );
    };
  }, [
    resource,
    numPages,
    readingPercent,
  ]);

  const onDocumentLoadSuccess =
    ({
      numPages:
        loadedPages,
    }) => {
      setNumPages(
        loadedPages
      );

      setPdfError("");
    };

  const onDocumentLoadError =
    () => {
      setPdfError(
        "The private reader link could not load the PDF. Refreshing the reader normally resolves an expired link."
      );
    };

  const zoomOut =
    () => {
      setZoom(
        (
          currentZoom
        ) =>
          clamp(
            Number(
              (
                currentZoom -
                0.1
              ).toFixed(2)
            ),
            0.6,
            2
          )
      );
    };

  const zoomIn =
    () => {
      setZoom(
        (
          currentZoom
        ) =>
          clamp(
            Number(
              (
                currentZoom +
                0.1
              ).toFixed(2)
            ),
            0.6,
            2
          )
      );
    };

  const resetFitView =
    () => {
      setZoom(1);
    };

  const toggleReaderTheme =
    () => {
      setReaderTheme(
        (
          currentTheme
        ) =>
          currentTheme ===
          "dark"
            ? "light"
            : "dark"
      );
    };

  const toggleFullscreen =
    async () => {
      if (
        !readerRef.current
      ) {
        return;
      }

      if (
        !document.fullscreenElement
      ) {
        await readerRef.current.requestFullscreen();
        return;
      }

      await document.exitFullscreen();
    };

  const downloadResource =
    async () => {
      if (
        !resource?.id
      ) {
        return;
      }

      setIsDownloading(
        true
      );

      try {
        const response =
          await accountDashboardService.getDownload(
            resource.id
          );

        const download =
          response.data.download;

        const anchor =
          document.createElement(
            "a"
          );

        anchor.href =
          download.url;

        anchor.target =
          "_blank";

        anchor.rel =
          "noopener noreferrer";

        anchor.download =
          download.fileName ||
          resource.fileName ||
          "";

        document.body.appendChild(
          anchor
        );

        anchor.click();
        anchor.remove();
      } catch (error) {
        setResourceError(
          error.message
        );
      } finally {
        setIsDownloading(
          false
        );
      }
    };

  if (
    isLoadingResource
  ) {
    return (
      <section
        className="reader-access-state"
        role="status"
      >
        <span className="reader-access-spinner" />

        <h1>
          Opening your resource
        </h1>

        <p>
          SkillVault is confirming your purchase and preparing a private PDF
          session.
        </p>
      </section>
    );
  }

  if (
    resourceError ||
    !resource
  ) {
    return (
      <section className="reader-access-state reader-access-error">
        <FiFileText />

        <h1>
          This resource cannot be opened
        </h1>

        <p>
          {resourceError ||
            "The resource is unavailable in your purchased library."}
        </p>

        <div className="reader-access-actions">
          <button
            type="button"
            onClick={
              loadReader
            }
          >
            <FiRefreshCcw />
            Try Again
          </button>

          <Link to="/account/library">
            <FiArrowLeft />
            Back To Library
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`reader-page ${
        readerTheme ===
        "dark"
          ? "reader-dark"
          : "reader-light"
      }`}
      ref={
        readerRef
      }
    >
      <header className="reader-toolbar">
        <div className="reader-toolbar-left">
          <Link
            to="/account/library"
            className="reader-icon-button"
            aria-label="Back to library"
            title="Back to library"
          >
            <FiArrowLeft />
          </Link>

          <div className="reader-file-title">
            <FiFileText />

            <div>
              <strong>
                {resource.title}
              </strong>

              <span>
                {resource.category}{" "}
                /{" "}
                {resource.type}
              </span>
            </div>
          </div>
        </div>

        <div className="reader-toolbar-center">
          <div className="reader-control-group">
            <button
              type="button"
              onClick={() =>
                scrollToPage(
                  currentPage -
                    1
                )
              }
              disabled={
                currentPage <=
                1
              }
              aria-label="Previous page"
              title="Previous page"
            >
              <FiChevronLeft />
            </button>

            <span className="reader-page-counter">
              <strong>
                {currentPage}
              </strong>

              <em>
                /{" "}
                {numPages ||
                  "—"}
              </em>
            </span>

            <button
              type="button"
              onClick={() =>
                scrollToPage(
                  currentPage +
                    1
                )
              }
              disabled={
                !numPages ||
                currentPage >=
                  numPages
              }
              aria-label="Next page"
              title="Next page"
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="reader-control-group reader-zoom-group">
            <button
              type="button"
              onClick={
                zoomOut
              }
              disabled={
                zoom <=
                0.6
              }
              aria-label="Zoom out"
              title="Zoom out"
            >
              <FiMinus />
            </button>

            <button
              type="button"
              className="reader-zoom-value"
              onClick={
                resetFitView
              }
              title="Fit page width"
            >
              {Math.round(
                zoom *
                100
              )}
              %
            </button>

            <button
              type="button"
              onClick={
                zoomIn
              }
              disabled={
                zoom >=
                2
              }
              aria-label="Zoom in"
              title="Zoom in"
            >
              <FiPlus />
            </button>
          </div>
        </div>

        <div className="reader-toolbar-right">
          <div
            className="reader-reading-status"
            title="Saved reading progress"
          >
            <strong>
              {readingPercent}%
            </strong>

            <span>
              {progressSaveState ===
                "saving" &&
                "Saving"}

              {progressSaveState ===
                "saved" &&
                "Saved"}

              {progressSaveState ===
                "error" &&
                "Not saved"}

              {progressSaveState ===
                "idle" &&
                "Read"}
            </span>
          </div>

          <button
            type="button"
            className="reader-icon-button"
            onClick={
              downloadResource
            }
            disabled={
              isDownloading
            }
            aria-label="Download PDF"
            title="Download PDF"
          >
            {isDownloading ? (
              <span className="reader-toolbar-spinner" />
            ) : (
              <FiDownload />
            )}
          </button>

          <button
            type="button"
            className="reader-icon-button"
            onClick={
              toggleReaderTheme
            }
            aria-label={
              readerTheme ===
              "dark"
                ? "Use light reader"
                : "Use dark reader"
            }
            title={
              readerTheme ===
              "dark"
                ? "Light reader"
                : "Dark reader"
            }
          >
            {readerTheme ===
            "dark" ? (
              <FiSun />
            ) : (
              <FiMoon />
            )}
          </button>

          <button
            type="button"
            className="reader-icon-button"
            onClick={
              toggleFullscreen
            }
            aria-label={
              isFullscreen
                ? "Exit fullscreen"
                : "Open fullscreen"
            }
            title={
              isFullscreen
                ? "Exit fullscreen"
                : "Fullscreen"
            }
          >
            {isFullscreen ? (
              <FiMinimize />
            ) : (
              <FiMaximize />
            )}
          </button>
        </div>
      </header>

      <main
        className="reader-document-shell"
        ref={
          documentShellRef
        }
        onScroll={
          handleDocumentScroll
        }
      >
        {pdfError ? (
          <div className="reader-pdf-error">
            <FiFileText />

            <h2>
              The PDF session needs to be refreshed
            </h2>

            <p>
              {pdfError}
            </p>

            <button
              type="button"
              onClick={
                loadReader
              }
            >
              <FiRefreshCcw />
              Refresh Reader
            </button>
          </div>
        ) : (
          <div className="reader-document-stage">
            <Document
              file={
                resource.fileUrl
              }
              onLoadSuccess={
                onDocumentLoadSuccess
              }
              onLoadError={
                onDocumentLoadError
              }
              loading={
                <div className="reader-document-loading">
                  <span />

                  <p>
                    Rendering PDF...
                  </p>
                </div>
              }
            >
              {pages.map(
                (
                  pageNumber
                ) => (
                  <div
                    className="reader-pdf-page"
                    key={
                      pageNumber
                    }
                    ref={(
                      element
                    ) => {
                      pageRefs.current[
                        pageNumber -
                          1
                      ] =
                        element;
                    }}
                  >
                    <Page
                      pageNumber={
                        pageNumber
                      }
                      width={
                        renderedPageWidth
                      }
                      renderTextLayer
                      renderAnnotationLayer
                      loading={
                        <div className="reader-page-loading">
                          Page{" "}
                          {pageNumber}
                        </div>
                      }
                    />

                    <span className="reader-page-label">
                      {pageNumber}
                    </span>
                  </div>
                )
              )}
            </Document>
          </div>
        )}
      </main>
    </section>
  );
}

export default Reader;
