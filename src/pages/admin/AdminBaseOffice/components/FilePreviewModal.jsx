import { X, Download, Printer, FileText, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../../../utils/formatDate';

const FilePreviewModal = ({ isOpen, onClose, dispatch }) => {
  if (!isOpen || !dispatch) return null;

  const fileName = dispatch.file_name || 'Tep_dinh_kem.pdf';
  const isRealPdf = dispatch.file_url && dispatch.file_url.endsWith('.pdf');

  const handleDownload = () => {
    if (dispatch.file_url) {
      window.open(dispatch.file_url, '_blank');
    } else {
      // Simulate file download for mock data
      const element = document.createElement("a");
      const file = new Blob([
        `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nNỘI DUNG CÔNG VĂN: ${dispatch.code}\nTiêu đề: ${dispatch.title}\nCơ quan gửi: ${dispatch.sender}\nNơi nhận: ${dispatch.receiver}\n\nNội dung:\n${dispatch.description || 'Chưa có trích yếu.'}`
      ], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = fileName.replace('.pdf', '.txt');
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Đã tải xuống tệp văn bản: ${fileName}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hepco-green/20 text-hepco-green flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-hepco-green tracking-wider uppercase">{dispatch.code}</span>
                <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md font-mono">{fileName}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-100 line-clamp-1">{dispatch.title}</h3>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-hepco-green hover:bg-hepco-green/90 text-white rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Tải tệp
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              In
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 bg-gray-200/80 p-4 md:p-8 overflow-y-auto flex justify-center items-start">
          {isRealPdf ? (
            <iframe
              src={dispatch.file_url}
              className="w-full h-full rounded-xl border border-gray-300 shadow-md bg-white"
              title={fileName}
            />
          ) : (
            /* Document Page Simulation */
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8 md:p-12 space-y-6 text-gray-900 border border-gray-300/80 relative min-h-[650px] font-serif">
              {/* Seal Stamp */}
              <div className="absolute top-8 right-8 border-2 border-red-500/30 text-red-600/40 rounded-full w-24 h-24 flex flex-col items-center justify-center text-[10px] font-sans font-bold uppercase tracking-tighter rotate-[ -12deg ] pointer-events-none select-none">
                <span>CÔNG TY HEPCO</span>
                <span className="text-[8px] my-0.5">★ ★ ★</span>
                <span>ĐÃ DUYỆT</span>
              </div>

              {/* Official Header */}
              <div className="flex justify-between items-start text-center font-sans border-b border-gray-200 pb-6 text-xs">
                <div>
                  <p className="font-bold uppercase tracking-wider text-gray-700">{dispatch.sender || 'SỞ TÀI NGUYÊN VÀ MÔI TRƯỜNG'}</p>
                  <p className="font-semibold text-gray-500 mt-1">Số: {dispatch.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold uppercase text-gray-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-semibold text-gray-600">Độc lập - Tự do - Hạnh phúc</p>
                  <p className="text-gray-400 text-[10px] italic mt-1">Ngày {formatDate(dispatch.created_at)}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-2 pt-2 font-sans">
                <span className="inline-block px-3 py-1 bg-hepco-green/10 text-hepco-green rounded-full text-xs font-bold uppercase">
                  VĂN BẢN ĐÍNH KÈM CÔNG VĂN
                </span>
                <h2 className="text-lg font-bold text-gray-900 uppercase leading-snug px-4">
                  {dispatch.title}
                </h2>
              </div>

              {/* Recipient */}
              <div className="font-sans text-xs text-gray-700 space-y-1 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p><span className="font-bold text-gray-900">Kính gửi:</span> {dispatch.receiver || 'Ban Giám Đốc - HEPCO'}</p>
                <p><span className="font-bold text-gray-900">Trích yếu:</span> {dispatch.description || 'Chưa có ghi chú trích yếu nội dung.'}</p>
              </div>

              {/* Document Text Content Body */}
              <div className="space-y-4 text-sm leading-relaxed text-gray-800 font-serif pt-2">
                <p className="indent-6">
                  Căn cứ theo kế hoạch chỉ đạo bảo vệ môi trường và quản lý chất thải đô thị trên địa bàn thành phố quý III/2026;
                </p>
                <p className="indent-6">
                  {dispatch.description || 'Đề nghị đơn vị khẩn trương phối hợp kiểm tra, triển khai các phương án thu gom rác thải, bố trí lực lượng phương tiện đảm bảo an toàn vệ sinh môi trường đúng quy định.'}
                </p>
                <p className="indent-6">
                  Yêu cầu các đơn vị trực thuộc nghiêm túc thực hiện và báo cáo kết quả theo định kỳ về Thường trực Ban Chỉ đạo.
                </p>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-12 text-xs font-sans border-t border-gray-100">
                <div className="text-gray-500 space-y-1">
                  <p className="font-bold text-gray-700">Nơi nhận:</p>
                  <p>- Như trên;</p>
                  <p>- Lưu: VT, HS.</p>
                </div>
                <div className="text-center font-sans space-y-8">
                  <div>
                    <p className="font-bold uppercase text-gray-900">TL. GIÁM ĐỐC</p>
                    <p className="text-gray-500 text-[11px]">TRƯỞNG PHÒNG HÀNH CHÍNH</p>
                  </div>
                  <div className="pt-8">
                    <p className="font-bold text-gray-900 text-sm">(Đã ký & đóng dấu)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-hepco-green" />
            <span>Trình xem tệp tích hợp Base Office - HEPCO Workspace</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            Đóng trình xem
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
