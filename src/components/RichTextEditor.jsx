import { useRef, useMemo, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../constants/api';
import { useUploadImage } from '../apis/upload';

const RichTextEditor = ({ value, onChange, onBlur, className }) => {
  const quillRef = useRef(null);
  const uploadImageMutation = useUploadImage();

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
            quill.insertEmbed(range.index, 'image', `${API_BASE_URL}${res.url}`);
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
            const href = prompt('Nhập đường dẫn URL:');
            if (href) {
              let range = this.quill.getSelection();
              if (!range) {
                this.quill.focus();
                range = this.quill.getSelection() || { index: this.quill.getLength() - 1, length: 0 };
              }
              if (range.length > 0) {
                this.quill.format('link', href);
              } else {
                this.quill.insertText(range.index, href, 'link', href);
              }
            }
          } else {
            this.quill.format('link', false);
          }
        }
      }
    }
  }), [imageHandler]);

  return (
    <ReactQuill 
      ref={quillRef}
      theme="snow"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      modules={modules}
      className={className}
    />
  );
};

export default RichTextEditor;
