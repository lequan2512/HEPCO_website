import { useState, useEffect } from 'react';
import RichTextEditor from '../../../components/RichTextEditor';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, FileText, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { API_BASE_URL } from '../../../constants/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorMapper';
import Loading from '../../../components/Loading';
import { useGetNews, useCreateNews, useUpdateNews, useDeleteNews } from '../../../apis/news';
import { useUploadImage, useDeleteImage } from '../../../apis/upload';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';

const parseToInputDateTime = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr.includes('T')) return dateStr.slice(0, 16);
  const parts = dateStr.trim().split(' ');
  const dateParts = parts[0].split(/[-/]/);
  if (dateParts.length === 3) {
    let day, month, year;
    if (dateParts[0].length === 4) {
      year = dateParts[0];
      month = dateParts[1].padStart(2, '0');
      day = dateParts[2].padStart(2, '0');
    } else {
      day = dateParts[0].padStart(2, '0');
      month = dateParts[1].padStart(2, '0');
      year = dateParts[2];
    }
    const timeStr = parts[1] ? parts[1].slice(0, 5) : '00:00';
    return `${year}-${month}-${day}T${timeStr}`;
  }
  return '';
};

const formatInputToSaveDate = (inputVal) => {
  if (!inputVal) return '';
  const [datePart, timePart] = inputVal.split('T');
  if (!datePart) return '';
  const [year, month, day] = datePart.split('-');
  const time = timePart ? timePart.slice(0, 5) : '00:00';
  return `${day}-${month}-${year} ${time}`;
};

const AdminNewsManager = ({ type, editOnly = false }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const queryClient = useQueryClient();

  const titleText = type === 'news' ? 'Tin Tức' : type === 'shareholders' ? 'Quan Hệ Cổ Đông' : 'Dịch Vụ';

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState('created_at_desc');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: newsResponse = {}, isLoading } = useGetNews({ type, limit: 20, search: debouncedSearch, sort: sortOption, page });
  const articles = newsResponse.data || [];
  const meta = newsResponse.meta;

  const [prevType, setPrevType] = useState(type);
  if (type !== prevType) {
    setPrevType(type);
    setIsFormOpen(false);
    setEditingId(null);
    setPage(1);
  }

  const createNewsMutation = useCreateNews();
  const updateNewsMutation = useUpdateNews();
  const deleteNewsMutation = useDeleteNews();
  const uploadImageMutation = useUploadImage();
  const deleteImageMutation = useDeleteImage();

  const handleCreateSuccess = () => {
    toast.success('Thêm bài viết mới thành công!');
    queryClient.invalidateQueries({ queryKey: ['news'] });
    setIsFormOpen(false);
    formik.resetForm();
  };

  const handleUpdateSuccess = () => {
    toast.success('Cập nhật bài viết thành công!');
    queryClient.invalidateQueries({ queryKey: ['news'] });
    setIsFormOpen(false);
    setEditingId(null);
    formik.resetForm();
  };

  const handleDeleteSuccess = () => {
    toast.success('Xóa bài viết thành công!');
    queryClient.invalidateQueries({ queryKey: ['news'] });
  };

  const handleError = (error) => {
    const errorCode = error.response?.data?.errorCode;
    toast.error(getErrorMessage(errorCode) || 'Có lỗi xảy ra');
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      thumbnail: '',
      date: '',
      type: type
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().required('Vui lòng nhập tiêu đề bài viết'),
      thumbnail: Yup.string().required('Vui lòng tải lên thumbnail'),
      content: Yup.string().test(
        'is-empty',
        'Vui lòng nhập nội dung bài viết',
        (value) => value && value.replace(/<[^>]+>/g, '').trim().length > 0
      ),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const cleanValues = {
          ...values,
          date: formatInputToSaveDate(values.date),
          content: values.content ? values.content.replace(/(https?:\/\/[^\s"'<>]+)?(https:\/\/res\.cloudinary\.com\/[^\s"'<>]+)/g, '$2') : values.content
        };
        if (editingId) {
          await updateNewsMutation.mutateAsync({ id: editingId, ...cleanValues });
          handleUpdateSuccess();
        } else {
          await createNewsMutation.mutateAsync(cleanValues);
          handleCreateSuccess();
        }
      } catch (err) {
        console.error('Lỗi khi lưu bài:', err);
        handleError(err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleEdit = (article) => {
    setEditingId(article.id);
    const cleanContent = article.content ? article.content.replace(/(https?:\/\/[^\s"'<>]+)?(https:\/\/res\.cloudinary\.com\/[^\s"'<>]+)/g, '$2') : '';
    formik.setValues({
      title: article.title,
      content: cleanContent,
      thumbnail: article.thumbnail || '',
      date: parseToInputDateTime(article.date),
      type: article.type
    });
    setIsFormOpen(true);
  };

  const handleDelete = (article) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa bài viết',
      message: 'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          if (article.content) {
            const imgRegex = /<img[^>]+src="([^">]+)"/g;
            let match;
            while ((match = imgRegex.exec(article.content)) !== null) {
              let imgUrl = match[1];
              if (imgUrl) {
                try {
                  await deleteImageMutation.mutateAsync(imgUrl);
                } catch {
                  console.error('Failed to delete content image:', imgUrl);
                }
              }
            }
          }

          await deleteNewsMutation.mutateAsync(article.id);

          if (article.thumbnail) {
            try {
              await deleteImageMutation.mutateAsync(article.thumbnail);
            } catch {
              console.error('Failed to delete thumbnail:', article.thumbnail);
            }
          }

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

  if (isFormOpen) {
    return (
      <div className="w-full relative">
        {(formik.isSubmitting || updateNewsMutation.isPending || createNewsMutation.isPending || uploadImageMutation.isPending) && <Loading fullScreen message="Đang xử lý..." />}
        <div className="mb-6 border-b pb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {editingId ? `Sửa Bài Viết ${titleText}` : `Thêm Mới ${titleText}`}
          </h1>
          <button
            onClick={handleCloseForm}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded hover:bg-red-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Tiêu đề bài viết</label>
              <input
                type="text"
                name="title"
                className={`w-full p-3 border rounded outline-none focus:ring-hepco-green focus:border-hepco-green ${formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Nhập tiêu đề..."
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.title && formik.errors.title ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
              ) : null}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Ngày giờ đăng bài <span className="text-xs text-gray-400 font-normal">(để trống sẽ lấy ngày giờ hiện tại)</span>
              </label>
              <input
                type="datetime-local"
                name="date"
                className="w-full p-3 border border-gray-300 rounded outline-none focus:ring-hepco-green focus:border-hepco-green text-gray-700"
                value={formik.values.date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>


          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Ảnh đại diện (Thumbnail)</label>
            <input
              type="file"
              accept="image/*"
              className={`w-full p-2 border rounded outline-none focus:ring-hepco-green focus:border-hepco-green ${formik.submitCount > 0 && formik.errors.thumbnail ? 'border-red-500' : 'border-gray-300'
                }`}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const formData = new FormData();
                  formData.append('image', file);
                  try {
                    toast.loading('Đang tải ảnh lên...', { id: 'upload' });
                    const res = await uploadImageMutation.mutateAsync(formData);
                    if (res.success) {
                      const oldThumb = formik.values.thumbnail;

                      if (oldThumb) {
                        try {
                          await deleteImageMutation.mutateAsync(oldThumb);
                        } catch {
                          console.error('Failed to delete old thumbnail');
                        }
                      }

                      formik.setFieldValue('thumbnail', res.url);
                      toast.success('Tải ảnh thành công!', { id: 'upload' });
                    }
                  } catch (error) {
                    console.error('Lỗi tải ảnh:', error.response?.data || error);
                    toast.error('Lỗi tải ảnh lên', { id: 'upload' });
                  }
                }
              }}
            />
            {formik.submitCount > 0 && formik.errors.thumbnail ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.thumbnail}</div>
            ) : null}
            {formik.values.thumbnail && (
              <div className="mt-2 relative inline-block">
                <img src={formik.values.thumbnail.startsWith('http') ? formik.values.thumbnail : `${API_BASE_URL}${formik.values.thumbnail}`} alt="Thumbnail" className="h-32 object-cover rounded shadow" />
                <button
                  type="button"
                  onClick={() => {
                    setConfirmConfig({
                      isOpen: true,
                      title: 'Xóa ảnh',
                      message: 'Bạn có chắc chắn muốn xóa ảnh này?',
                      onConfirm: async () => {
                        try {
                          toast.loading('Đang xóa ảnh...', { id: 'delete_upload' });

                          const currThumb = formik.values.thumbnail;

                          if (currThumb) {
                            try {
                              await deleteImageMutation.mutateAsync(currThumb);
                            } catch {
                              console.error('Failed to delete currThumb');
                            }
                          }

                          formik.setFieldValue('thumbnail', '');
                          toast.success('Xóa ảnh thành công!', { id: 'delete_upload' });
                        } catch (error) {
                          console.error('Lỗi xóa ảnh:', error);
                          toast.error('Lỗi xóa ảnh', { id: 'delete_upload' });
                        }
                      }
                    });
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow transition-colors"
                  title="Xóa ảnh"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2">Nội dung</label>
            <div className={`bg-white rounded-lg ${formik.touched.content && formik.errors.content ? 'border border-red-500' : ''}`}>
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
              <div className="text-red-500 text-sm mt-1">{formik.errors.content}</div>
            ) : null}
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t border-gray-100 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleCloseForm}
              className="px-4 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded shadow-xs transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 sm:px-8 sm:py-3 text-sm font-semibold bg-hepco-green hover:bg-green-700 text-white rounded shadow-xs transition-colors"
            >
              {editingId ? 'Cập Nhật' : 'Đăng Bài'}
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
    <div className="w-full relative">
      {deleteNewsMutation.isPending && <Loading fullScreen message="Đang xóa..." />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{titleText}</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {!editOnly && (
            <button
              onClick={() => {
                setEditingId(null);
                formik.resetForm();
                formik.setFieldValue('type', type);
                setIsFormOpen(true);
              }}
              className="flex items-center whitespace-nowrap gap-2 px-4 py-2 bg-hepco-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm Mới</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <Loading />
        ) : articles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase w-16">ID</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Hình Ảnh</th>
                  <th 
                    onClick={() => setSortOption(prev => prev === 'title_asc' ? 'title_desc' : 'title_asc')}
                    className="px-6 py-4 text-sm font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Tiêu đề</span>
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
                    onClick={() => setSortOption(prev => prev === 'created_at_desc' ? 'created_at_asc' : 'created_at_desc')}
                    className="px-6 py-4 text-sm font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none group"
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
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">#{item.id}</td>

                    <td className="px-6 py-4">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail.startsWith('http') ? item.thumbnail : `${API_BASE_URL}${item.thumbnail}`}
                          alt="Thumb"
                          className="w-16 h-12 object-cover rounded-md shadow-sm border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border border-gray-200">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800 font-medium line-clamp-2 leading-tight max-w-[200px] sm:max-w-xs md:max-w-md" title={item.title}>
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa bài viết"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!editOnly && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
            <h3 className="text-lg font-bold text-gray-800">Chưa có bài viết nào</h3>
            <p className="text-gray-500 mt-1">Hiện tại chưa có dữ liệu cho mục này.</p>
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
