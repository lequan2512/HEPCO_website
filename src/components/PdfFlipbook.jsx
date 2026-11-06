import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ZoomIn, ZoomOut, Maximize, Minimize, Loader2, FileText, Download, ExternalLink
} from 'lucide-react';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PdfFlipbook = ({
  pdfUrl = '/pdf/HoSoNangLuc2026.pdf',
  fileName = 'HoSoNangLuc2026.pdf',
  title = ''
}) => {
  const displayTitle = title || (fileName.includes('HoSoNangLuc') ? 'Hồ sơ năng lực' : fileName);
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scrollCanvasRefs = useRef({});
  const renderTasksRef = useRef({});

  // Reset state when pdfUrl changes
  const [prevPdfUrl, setPrevPdfUrl] = useState(pdfUrl);
  if (pdfUrl !== prevPdfUrl) {
    setPrevPdfUrl(pdfUrl);
    setLoading(true);
    setError(null);
    setPdfDoc(null);
    setNumPages(0);
    setLoadingProgress(0);
  }

  // Load PDF Document
  useEffect(() => {
    let isMounted = true;

    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.onProgress = (progress) => {
      if (progress.total > 0) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        if (isMounted) setLoadingProgress(percent);
      }
    };

    loadingTask.promise
      .then((doc) => {
        if (isMounted) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading PDF:', err);
        if (isMounted) {
          setError('Không thể hiển thị trực tiếp tệp PDF này. Vui lòng mở trong tab mới hoặc tải về máy để xem.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  // Render page for continuous scroll view
  const renderScrollCanvas = useCallback(async (pNum, canvas) => {
    if (!pdfDoc || !canvas) return;

    // Cancel any in-flight render for this page
    if (renderTasksRef.current[pNum]) {
      renderTasksRef.current[pNum].cancel();
      delete renderTasksRef.current[pNum];
    }

    try {
      const page = await pdfDoc.getPage(pNum);
      const viewport = page.getViewport({ scale: scale * 1.5 });
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderTask = page.render({ canvasContext: context, viewport });
      renderTasksRef.current[pNum] = renderTask;

      await renderTask.promise;
      delete renderTasksRef.current[pNum];
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error(`Error rendering scroll page ${pNum}:`, err);
      }
    }
  }, [pdfDoc, scale]);

  // Re-render all visible canvases when scale changes
  useEffect(() => {
    if (!pdfDoc) return;
    const refs = scrollCanvasRefs.current;
    Object.entries(refs).forEach(([pNum, canvas]) => {
      if (canvas) {
        renderScrollCanvas(Number(pNum), canvas);
      }
    });
  }, [pdfDoc, scale, renderScrollCanvas]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Zoom is capped at 200% (scale 2.0) and min 60%
  const zoomIn = () => setScale((s) => Math.min(2.0, +(s + 0.2).toFixed(1)));
  const zoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(1)));

  return (
    <div
      ref={containerRef}
      className={`bg-white text-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-[500px] md:h-[600px] lg:h-[700px]'
      }`}
    >
      {/* Top Toolbar */}
      <div className="bg-gray-900/90 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 border-b border-gray-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        {/* Title */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300 min-w-0 flex-1">
          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate" title={displayTitle}>{displayTitle}</span>
          {numPages > 0 && (
            <span className="text-gray-500 shrink-0">({numPages} trang)</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-white transition-colors border border-gray-700/60"
            title="Mở PDF trong tab mới"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href={pdfUrl}
            download={fileName}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-white transition-colors border border-gray-700/60"
            title="Tải xuống tệp PDF"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-800/80 p-0.5 rounded-xl border border-gray-700/60 text-xs">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.6}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 disabled:opacity-30 cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold px-1.5 min-w-[36px] text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 disabled:opacity-30 cursor-pointer"
              title="Phóng to (tối đa 200%)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-white transition-colors border border-gray-700/60 cursor-pointer"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Scroll Reading Area */}
      <div
        className="flex-1 relative p-2 sm:p-3 md:p-4 overflow-auto custom-scrollbar bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"
      >
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 text-emerald-400 py-16">
            <Loader2 className="w-9 h-9 animate-spin" />
            <p className="text-xs sm:text-sm font-semibold text-gray-300">
              Đang tải tài liệu PDF... {loadingProgress > 0 && `${loadingProgress}%`}
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-4 text-center p-6 bg-gray-900/90 rounded-2xl border border-gray-800 max-w-md mx-auto my-8">
            <FileText className="w-10 h-10 text-rose-400" />
            <p className="text-xs sm:text-sm text-gray-300">{error}</p>
            <div className="flex items-center gap-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors border border-gray-700"
              >
                Mở tab mới
              </a>
              <a
                href={pdfUrl}
                download={fileName}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Tải file PDF ngay
              </a>
            </div>
          </div>
        )}

        {!loading && !error && pdfDoc && (
          <div
            className="flex flex-col items-center gap-4 py-2"
            style={{
              width: scale > 1 ? `${scale * 100}%` : '100%',
              maxWidth: scale > 1 ? 'none' : '56rem',
              margin: scale > 1 ? undefined : '0 auto'
            }}
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pNum) => (
              <div key={pNum} className="bg-white rounded-2xl shadow-xl overflow-hidden relative border border-gray-200 w-full">
                <canvas
                  ref={(el) => {
                    if (el) {
                      scrollCanvasRefs.current[pNum] = el;
                    }
                  }}
                  className="w-full h-auto block"
                />
                <div className="bg-gray-100 text-gray-600 text-xs font-bold text-center py-1 border-t">
                  Trang {pNum} / {numPages}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfFlipbook;
