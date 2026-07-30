import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../constants/api';
import { useUploadImage } from '../apis/upload';

const RichTextEditor = ({ value, onChange, onBlur, className }) => {
  const quillRef = useRef(null);
  const uploadImageMutation = useUploadImage();

  const [linkModal, setLinkModal] = useState({ isOpen: false, url: '', text: '', range: null });

  const handleInsertLink = useCallback(() => {
    const { url, text, range } = linkModal;
    if (!url) {
      toast.error('Vui lòng nhập đường dẫn URL');
      return;
    }
    
    let validUrl = url;
    if (!/^https?:\/\//i.test(validUrl) && !validUrl.startsWith('mailto:') && !validUrl.startsWith('tel:')) {
      validUrl = 'http://' + validUrl;
    }

    const quill = quillRef.current.getEditor();
    
    if (range && range.length > 0) {
      const currentText = quill.getText(range.index, range.length);
      if (text !== currentText && text.trim() !== '') {
        quill.deleteText(range.index, range.length);
        quill.insertText(range.index, text, 'link', validUrl);
      } else {
        quill.formatText(range.index, range.length, 'link', validUrl);
      }
    } else {
      quill.insertText(range ? range.index : 0, text || validUrl, 'link', validUrl);
    }
    
    setLinkModal({ isOpen: false, url: '', text: '', range: null });
  }, [linkModal]);

  const mutateAsyncRef = useRef(uploadImageMutation.mutateAsync);
  useEffect(() => {
    mutateAsyncRef.current = uploadImageMutation.mutateAsync;
  }, [uploadImageMutation.mutateAsync]);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        try {
          toast.loading('Đang tải ảnh...', { id: 'upload_quill' });
          const res = await mutateAsyncRef.current(formData);
          if (res.success) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection(true);
            const imageUrl = res.url.startsWith('http') ? res.url : `${API_BASE_URL}${res.url}`;
            quill.insertEmbed(range.index, 'image', imageUrl);
            toast.success('Tải ảnh thành công!', { id: 'upload_quill' });
          }
        } catch {
          toast.error('Lỗi tải ảnh', { id: 'upload_quill' });
        }
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler,
        link: function(val) {
          if (val) {
            const quill = quillRef.current.getEditor();
            let range = quill.getSelection();
            if (!range) {
              quill.focus();
              range = quill.getSelection() || { index: quill.getLength() - 1, length: 0 };
            }
            
            let currentText = '';
            if (range.length > 0) {
              currentText = quill.getText(range.index, range.length);
            }
            
            setLinkModal({
              isOpen: true,
              url: '',
              text: currentText,
              range: range
            });
          } else {
            const quill = quillRef.current.getEditor();
            quill.format('link', false);
          }
        }
      }
    }
  }), [imageHandler]);

  return (
    <div className={`quill-wrapper flex flex-col ${className || ''}`}>
      <ReactQuill 
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        modules={modules}
        className="flex-1 flex flex-col overflow-hidden"
      />
      {linkModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Chèn Liên Kết</h3>
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Đường dẫn (URL) <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-hepco-green focus:border-transparent outline-none transition-all"
                  placeholder="https://example.com"
                  value={linkModal.url}
                  onChange={(e) => setLinkModal({...linkModal, url: e.target.value})}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Văn bản hiển thị</label>
                <input 
                  type="text"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-hepco-green focus:border-transparent outline-none transition-all"
                  placeholder="Để trống sẽ dùng URL làm văn bản"
                  value={linkModal.text}
                  onChange={(e) => setLinkModal({...linkModal, text: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 sm:gap-3 mt-6">
              <button 
                type="button"
                className="px-4 py-2 text-xs sm:text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                onClick={() => setLinkModal({ ...linkModal, isOpen: false })}
              >
                Hủy Bỏ
              </button>
              <button 
                type="button"
                className="px-4 py-2 text-xs sm:text-sm text-white bg-hepco-green rounded-lg hover:bg-green-700 transition-colors font-medium shadow-xs"
                onClick={handleInsertLink}
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
