import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import RichTextEditor from '../../../components/RichTextEditor';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Image as ImageIcon,
  FileText,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Paperclip,
  Upload,
  ExternalLink,
  Filter,
  Calendar
} from 'lucide-react';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorMapper';
import Loading from '../../../components/Loading';
import { useGetNews, useCreateNews, useUpdateNews, useDeleteNews } from '../../../apis/news';
import { useUploadImage } from '../../../apis/upload';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';
import {
  NEWS_CATEGORY,
  NEWS_CATEGORY_OPTIONS,
  NEWS_CATEGORY_LABELS,
  SHAREHOLDER_DOC_TYPE,
  SHAREHOLDER_DOC_TYPE_OPTIONS,
  SHAREHOLDER_DOC_TYPE_LABELS
} from '../../../constants/news';
import { ROUTES } from '../../../constants/routes';

const parseToInputDateTime = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr.includes('T')) return dateStr.slice(0, 16);
  const parts = dateStr.trim().split(' ');
  const dateParts = parts[0].split(/[-/]/);
  if (dateParts.length === 3) {
    let day;
    let month;
    let year;
    if (dateParts[0].length === 4) {
      year = dateParts[0];
      month = dateParts[1].padStart(2, '0');
      day = dateParts[2].padStart(2, '0');
    } else {
      day = dateParts[0].padStart(2, '0');
      month = dateParts[1].padStart(2, '0');
      year = dateParts[2];
    }
    const timeStr = parts[1] ? parts[1].slice(0, 5) : '08:00';
    return `${year}-${month}-${day}T${timeStr}`;
  }
  return '';
};

const formatInputToSaveDate = (inputVal) => {
  if (!inputVal) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}`;
  }
  if (!inputVal.includes('T')) return inputVal;
  const [datePart, timePart] = inputVal.split('T');
  if (!datePart) return '';
  const [year, month, day] = datePart.split('-');
  const time = timePart ? timePart.slice(0, 5) : '08:00';
  return `${day}/${month}/${year} ${time}`;
};

const createAttachmentId = () => `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const AdminNewsManager = ({ type = 'news', editOnly = false }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [newAttTitle, setNewAttTitle] = useState('');
  const [newAttUrl, setNewAttUrl] = useState('');
  const attachmentFileRef = useRef(null);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  const queryClient = useQueryClient();

  const titleText =
    type === 'news'
      ? 'Quản lý Tin Tức & Sự Kiện'
      : type === 'shareholders'
        ? 'Quản lý Quan Hệ Cổ Đông'
        : type === 'about'
          ? 'Bài viết Giới Thiệu'
          : 'Quản lý Dịch Vụ';

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState('created_at_desc');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: newsResponse = {}, isLoading } = useGetNews({
    type,
    limit: 15,
    search: debouncedSearch,
    category: selectedCategory !== 'all' ? selectedCategory : '',
    year: selectedYear !== 'all' ? selectedYear : '',
    sort: sortOption,
    page
  });
  const articles = newsResponse.data || [];
  const meta = newsResponse.meta;

  const [prevType, setPrevType] = useState(type);
  if (type !== prevType) {
    setPrevType(type);
    setIsFormOpen(false);
    setEditingId(null);
    setSelectedCategory('all');
    setSelectedYear('all');
    setPage(1);
  }

  const createNewsMutation = useCreateNews();
  const updateNewsMutation = useUpdateNews();
  const deleteNewsMutation = useDeleteNews();
  const uploadImageMutation = useUploadImage();

  const handleCreateSuccess = () => {
    toast.success('Thêm mới thành công!');
    queryClient.invalidateQueries({ queryKey: ['news'] });
    setIsFormOpen(false);
    formik.resetForm();
  };

  const handleUpdateSuccess = () => {
    toast.success('Cập nhật thành công!');
    queryClient.invalidateQueries({ queryKey: ['news'] });
    setIsFormOpen(false);
    setEditingId(null);
    formik.resetForm();
  };

  const handleDeleteSuccess = () => {
    toast.success('Xóa thành công!');
    queryClient.invalidateQueries({ queryKey: ['news'] });
  };

  const handleError = (error) => {
    const errorCode = error?.response?.data?.errorCode;
    toast.error(getErrorMessage(errorCode) || 'Có lỗi xảy ra');
  };

  const defaultCat =
    type === 'shareholders'
      ? SHAREHOLDER_DOC_TYPE.OTHER_DOCUMENT
      : NEWS_CATEGORY.COMPANY_ACTIVITY;

  const formik = useFormik({
    initialValues: {
      title: '',
      summary: '',
      content: '',
      thumbnail: '',
      date: '',
      publishYear: new Date().getFullYear(),
      category: defaultCat,
      documentType: defaultCat,
      attachments: [],
      type
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().required('Vui lòng nhập tiêu đề'),
      content: Yup.string().test(
        'is-empty',
        'Vui lòng nhập nội dung chi tiết',
        (value) => value && value.replace(/<[^>]+>/g, '').trim().length > 0
      )
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formattedDate = formatInputToSaveDate(values.date);
        const yearMatch = formattedDate.match(/\b(20\d{2}|19\d{2})\b/);
        const publishYear =
          Number(values.publishYear) || (yearMatch ? Number(yearMatch[1]) : new Date().getFullYear());

        const cleanValues = {
          ...values,
          date: formattedDate,
          publishYear,
          thumbnail: values.thumbnail || '/images/cover.png',
          category: type === 'shareholders' ? values.documentType : values.category,
          documentType: type === 'shareholders' ? values.documentType : undefined,
          content: values.content
            ? values.content.replace(
                /(https?:\/\/[^\s"'<>]+)?(https:\/\/res\.cloudinary\.com\/[^\s"'<>]+)/g,
                '$2'
              )
            : values.content
        };
        if (editingId) {
          await updateNewsMutation.mutateAsync({ id: editingId, ...cleanValues });
          handleUpdateSuccess();
        } else {
          await createNewsMutation.mutateAsync(cleanValues);
          handleCreateSuccess();
        }
      } catch (err) {
        handleError(err);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleEdit = (article) => {
    setEditingId(article.id);
    const cleanContent = article.content
      ? article.content.replace(
          /(https?:\/\/[^\s"'<>]+)?(https:\/\/res\.cloudinary\.com\/[^\s"'<>]+)/g,
          '$2'
        )
      : '';
    formik.setValues({
      title: article.title || '',
      summary: article.summary || '',
      content: cleanContent,
      thumbnail: article.thumbnail || '/images/cover.png',
      date: parseToInputDateTime(article.date),
      publishYear: article.publishYear || new Date().getFullYear(),
      category: article.category || NEWS_CATEGORY.COMPANY_ACTIVITY,
      documentType: article.documentType || SHAREHOLDER_DOC_TYPE.OTHER_DOCUMENT,
      attachments: Array.isArray(article.attachments) ? article.attachments : [],
      type: article.type || type
    });
    setIsFormOpen(true);
  };

  const handleDelete = (article) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa dữ liệu',
      message: `Bạn có chắc chắn muốn xóa "${article.title}"?`,
      onConfirm: async () => {
        try {
          await deleteNewsMutation.mutateAsync(article.id);
          handleDeleteSuccess();
        } catch (error) {
          handleError(error);
        }
      }
    });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    formik.resetForm();
  };

  const handleUploadAttachmentFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      toast.loading('Đang tải tệp đính kèm...', { id: 'upload_att' });
      const res = await uploadImageMutation.mutateAsync(formData);
      if (res.success) {
        const ext = (file.name.split('.').pop() || 'pdf').toLowerCase();
        const nextAttachment = {
          id: createAttachmentId(),
          title: newAttTitle.trim() || file.name,
          fileName: file.name,
          ext,
          size: file.size || 0,
          fileUrl: res.url,
          downloadUrl: res.url
        };
        formik.setFieldValue('attachments', [...(formik.values.attachments || []), nextAttachment]);
        setNewAttTitle('');
        toast.success('Đã đính kèm tệp tài liệu!', { id: 'upload_att' });
      }
    } catch {
      toast.error('Lỗi tải tệp đính kèm', { id: 'upload_att' });
    } finally {
      if (attachmentFileRef.current) attachmentFileRef.current.value = '';
    }
  };

  const handleAddAttachmentByUrl = () => {
    if (!newAttUrl.trim()) {
      toast.error('Vui lòng nhập đường dẫn tệp đính kèm');
      return;
    }
    const cleanUrl = newAttUrl.trim();
    const fileName = cleanUrl.split('/').pop() || 'tai-lieu.pdf';
    const ext = (fileName.split('.').pop() || 'pdf').toLowerCase();
    const nextAttachment = {
      id: createAttachmentId(),
      title: newAttTitle.trim() || fileName,
      fileName,
      ext,
      size: 0,
      fileUrl: cleanUrl,
      downloadUrl: cleanUrl
    };
    formik.setFieldValue('attachments', [...(formik.values.attachments || []), nextAttachment]);
    setNewAttTitle('');
    setNewAttUrl('');
    toast.success('Đã thêm đường dẫn tài liệu!');
  };

  const handleRemoveAttachment = (attId) => {
    formik.setFieldValue(
      'attachments',
      (formik.values.attachments || []).filter((a) => a.id !== attId)
    );
  };

  if (isFormOpen) {
    return (
      <div className="w-full relative">
        {(formik.isSubmitting ||
          updateNewsMutation.isPending ||
          createNewsMutation.isPending ||
          uploadImageMutation.isPending) && <Loading fullScreen message="Đang xử lý..." />}

        <div className="mb-6 border-b border-gray-200 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800">
              {editingId ? `Chỉnh sửa: ${titleText}` : `Thêm mới: ${titleText}`}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Điền đầy đủ thông tin, chọn phân loại, ảnh đại diện và đính kèm tài liệu (nếu có).
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseForm}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="space-y-6 bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-gray-100"
        >
          {/* Row 1: Title & Date */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Tiêu đề bài viết / tên tài liệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green focus:border-hepco-green ${
                  formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tiêu đề bài viết hoặc tên văn bản..."
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.title && formik.errors.title ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
              ) : null}
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Ngày giờ công bố
              </label>
              <input
                type="datetime-local"
                name="date"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green focus:border-hepco-green text-gray-700"
                value={formik.values.date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Năm công bố</label>
              <input
                type="number"
                name="publishYear"
                min="2015"
                max="2035"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green focus:border-hepco-green text-gray-700 font-bold"
                value={formik.values.publishYear}
                onChange={formik.handleChange}
              />
            </div>
          </div>

          {/* Row 2: Category / Document Type & Short Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {(type === 'news' || type === 'shareholders') && (
              <div className="lg:col-span-4">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  {type === 'shareholders' ? 'Loại tài liệu cổ đông' : 'Chuyên mục tin tức'}
                </label>
                {type === 'shareholders' ? (
                  <select
                    name="documentType"
                    value={formik.values.documentType}
                    onChange={formik.handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 bg-white focus:ring-2 focus:ring-hepco-green outline-none"
                  >
                    {SHAREHOLDER_DOC_TYPE_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 bg-white focus:ring-2 focus:ring-hepco-green outline-none"
                  >
                    {NEWS_CATEGORY_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className={type === 'news' || type === 'shareholders' ? 'lg:col-span-8' : 'lg:col-span-12'}>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Mô tả ngắn (Hiển thị tóm tắt ngoài danh sách)
              </label>
              <input
                type="text"
                name="summary"
                placeholder="Nhập đoạn tóm tắt ngắn cho bài viết..."
                value={formik.values.summary}
                onChange={formik.handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green"
              />
            </div>
          </div>

          {/* Row 3: Thumbnail Upload + Direct URL Input */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-3">
            <label className="block text-sm font-bold text-gray-700">
              Ảnh đại diện (Thumbnail)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <span className="block text-xs text-gray-500 mb-1">
                  Cách 1: Tải file ảnh từ máy tính
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 bg-white border border-gray-300 rounded-xl text-xs cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('image', file);
                      try {
                        toast.loading('Đang xử lý ảnh...', { id: 'upload' });
                        const res = await uploadImageMutation.mutateAsync(formData);
                        if (res.success) {
                          formik.setFieldValue('thumbnail', res.url);
                          toast.success('Đã cập nhật ảnh đại diện!', { id: 'upload' });
                        }
                      } catch {
                        toast.error('Lỗi tải ảnh lên', { id: 'upload' });
                      }
                    }
                  }}
                />
              </div>

              <div>
                <span className="block text-xs text-gray-500 mb-1">
                  Cách 2: Hoặc dán trực tiếp đường dẫn ảnh (URL)
                </span>
                <input
                  type="text"
                  name="thumbnail"
                  placeholder="/uploads/images/... hoặc https://..."
                  value={formik.values.thumbnail}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-hepco-green"
                />
              </div>
            </div>

            {formik.values.thumbnail && (
              <div className="mt-2 relative inline-block">
                <img
                  src={resolveAssetUrl(formik.values.thumbnail)}
                  alt="Thumbnail"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/cover.png';
                  }}
                  className="h-32 w-48 object-cover rounded-xl shadow-sm border border-gray-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('thumbnail', '')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow transition-colors cursor-pointer"
                  title="Xóa ảnh"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Row 4: Attachments Manager (PDF, Word, Excel, RAR) */}
          <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-[#10243b] flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-hepco-green" />
                <span>Tài liệu đính kèm (PDF, Word, Excel, RAR) ({formik.values.attachments?.length || 0})</span>
              </h3>
              <span className="text-xs text-gray-500">
                Hỗ trợ xem PDF trực tuyến và tải tệp trên trang chi tiết &amp; trang cổ đông
              </span>
            </div>

            {/* Add Attachment Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white p-3.5 rounded-xl border border-gray-200">
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Tên hiển thị của tài liệu
                </label>
                <input
                  type="text"
                  placeholder="VD: Báo cáo tài chính kiểm toán năm 2025..."
                  value={newAttTitle}
                  onChange={(e) => setNewAttTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-hepco-green"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Đường dẫn tệp (hoặc tải tệp bên cạnh)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="/uploads/files/ten-file.pdf hoặc https://..."
                    value={newAttUrl}
                    onChange={(e) => setNewAttUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-hepco-green"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachmentByUrl}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer"
                  >
                    Thêm URL
                  </button>
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Tải tệp từ máy tính (.pdf, .docx, .xlsx, .rar)
                </label>
                <button
                  type="button"
                  onClick={() => attachmentFileRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-hepco-green hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn tệp từ máy tính</span>
                </button>
                <input
                  type="file"
                  ref={attachmentFileRef}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.rar,.zip"
                  onChange={handleUploadAttachmentFile}
                  className="hidden"
                />
              </div>
            </div>

            {/* Existing Attachments List */}
            {formik.values.attachments && formik.values.attachments.length > 0 && (
              <div className="space-y-2">
                {formik.values.attachments.map((att, idx) => (
                  <div
                    key={att.id || idx}
                    className="flex items-center justify-between gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <FileText className="w-4 h-4 text-hepco-green shrink-0" />
                      <input
                        type="text"
                        value={att.title}
                        onChange={(e) => {
                          const updated = [...formik.values.attachments];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          formik.setFieldValue('attachments', updated);
                        }}
                        className="font-bold text-gray-800 border-b border-transparent focus:border-hepco-green outline-none flex-1 min-w-0"
                      />
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase text-[10px]">
                        {att.ext || 'PDF'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Gỡ tệp đính kèm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Row 5: Rich Text Editor */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <div
              className={`bg-white rounded-xl ${
                formik.touched.content && formik.errors.content ? 'border border-red-500' : ''
              }`}
            >
              <RichTextEditor
                value={formik.values.content}
                onChange={(content) => {
                  formik.setFieldValue('content', content);
                }}
                onBlur={() => {
                  formik.setFieldTouched('content', true);
                }}
                className="h-80 sm:h-96"
              />
            </div>
            {formik.touched.content && formik.errors.content ? (
              <div className="text-red-500 text-xs mt-1">{formik.errors.content}</div>
            ) : null}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end pt-4 mt-4 border-t border-gray-100 gap-3">
            <button
              type="button"
              onClick={handleCloseForm}
              className="px-5 py-2.5 text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold bg-hepco-green hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {editingId ? 'Lưu Cập Nhật' : 'Đăng Bài Mới'}
            </button>
          </div>
        </form>

        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          onConfirm={confirmConfig.onConfirm}
          onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        />
      </div>
    );
  }

  return (
    <div className="w-full relative space-y-5">
      {deleteNewsMutation.isPending && <Loading fullScreen message="Đang xóa..." />}

      {/* Header & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800">{titleText}</h1>
              {meta && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {meta.total} mục
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý thêm mới, chỉnh sửa nội dung, ảnh đại diện và tệp đính kèm.
            </p>
          </div>

          {!editOnly && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                formik.resetForm();
                formik.setFieldValue('type', type);
                setIsFormOpen(true);
              }}
              className="flex items-center whitespace-nowrap gap-2 px-4 py-2.5 bg-hepco-green text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-xs w-full sm:w-auto justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mới</span>
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
          <div className="relative sm:col-span-2 lg:col-span-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc tên tệp đính kèm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(type === 'news' || type === 'shareholders') && (
            <>
              <div className="relative sm:col-span-1 lg:col-span-4">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-hepco-green pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-8 pr-6 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-hepco-green outline-none"
                >
                  {(type === 'shareholders'
                    ? SHAREHOLDER_DOC_TYPE_OPTIONS
                    : NEWS_CATEGORY_OPTIONS
                  ).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative sm:col-span-1 lg:col-span-2">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-hepco-green pointer-events-none" />
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-8 pr-6 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-hepco-green outline-none"
                >
                  <option value="all">Tất cả năm</option>
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                    <option key={yr} value={String(yr)}>
                      Năm {yr}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table Box */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 min-h-[300px] flex flex-col justify-center overflow-hidden">
        {isLoading ? (
          <Loading />
        ) : articles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3.5 text-xs font-bold text-gray-600 uppercase w-16">ID</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-gray-600 uppercase w-24">
                    Hình Ảnh
                  </th>
                  <th
                    onClick={() =>
                      setSortOption((prev) => (prev === 'title_asc' ? 'title_desc' : 'title_asc'))
                    }
                    className="px-4 py-3.5 text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Tiêu đề &amp; Phân loại</span>
                      {sortOption === 'title_asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-hepco-green font-bold" />
                      ) : sortOption === 'title_desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-hepco-green font-bold" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() =>
                      setSortOption((prev) =>
                        prev === 'created_at_desc' ? 'created_at_asc' : 'created_at_desc'
                      )
                    }
                    className="px-4 py-3.5 text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none group w-36"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Ngày đăng</span>
                      {sortOption === 'created_at_asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-hepco-green font-bold" />
                      ) : sortOption === 'created_at_desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-hepco-green font-bold" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3.5 text-xs font-bold text-gray-600 uppercase text-right w-32">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((item) => {
                  const badge =
                    type === 'shareholders'
                      ? SHAREHOLDER_DOC_TYPE_LABELS[item.documentType]
                      : NEWS_CATEGORY_LABELS[item.category];
                  const attCount = item.attachments?.length || 0;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5 text-xs text-gray-500 font-bold">#{item.id}</td>

                      <td className="px-4 py-3.5">
                        {item.thumbnail ? (
                          <img
                            src={resolveAssetUrl(item.thumbnail)}
                            alt="Thumb"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/cover.png';
                            }}
                            className="w-16 h-12 object-cover rounded-lg shadow-2xs border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                          )}
                          {attCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                              <Paperclip className="w-2.5 h-2.5 text-hepco-green" />
                              {attCount} tệp
                            </span>
                          )}
                        </div>
                        <div
                          className="text-sm text-gray-900 font-bold line-clamp-2 leading-snug max-w-xl"
                          title={item.title}
                        >
                          {item.title}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                        {item.date}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={ROUTES.ARTICLE_DETAIL.replace(':id', item.id)}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Xem hiển thị ngoài trang"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!editOnly && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="p-4 border-t border-gray-100">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Không tìm thấy dữ liệu nào</h3>
            <p className="text-gray-500 text-sm mt-1">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc nhấn &quot;Thêm Mới&quot; để tạo bài viết.
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
    </div>
  );
};

export default AdminNewsManager;
