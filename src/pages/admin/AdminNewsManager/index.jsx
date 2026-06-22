import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, FileText } from 'lucide-react';
import axiosInstance from '../../../utils/axios';
import { API_BASE_URL } from '../../../constants/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorMapper';
import Loading from '../../../components/Loading';

const AdminNewsManager = ({ type }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const titleText = type === 'news' ? 'Tin Tức' : 'Cổ Đông';

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['admin-news', type],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/news', {
        params: { type, limit: 20 }
      });
      return response.data.data;
    }
  });

  const createNewsMutation = useMutation({
    mutationFn: (newPost) => axiosInstance.post('/api/news', newPost),
    onSuccess: () => {
      toast.success('Thêm bài viết mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      setIsFormOpen(false);
      formik.resetForm();
    },
    onError: (error) => {
      const errorCode = error.response?.data?.errorCode;
      toast.error(getErrorMessage(errorCode));
    }
  });

  const updateNewsMutation = useMutation({
    mutationFn: ({ id, ...data }) => axiosInstance.put(`/api/news/${id}`, data),
    onSuccess: () => {
      toast.success('Cập nhật bài viết thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      setIsFormOpen(false);
      setEditingId(null);
      formik.resetForm();
    },
    onError: (error) => {
      const errorCode = error.response?.data?.errorCode;
      toast.error(getErrorMessage(errorCode));
    }
  });

  const deleteNewsMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/news/${id}`),
    onSuccess: () => {
      toast.success('Xóa bài viết thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    },
    onError: (error) => {
      const errorCode = error.response?.data?.errorCode;
      toast.error(getErrorMessage(errorCode));
    }
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      thumbnail: '',
      type: type
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().required('Vui lòng nhập tiêu đề bài viết'),
      content: Yup.string().test(
        'is-empty', 
        'Vui lòng nhập nội dung bài viết',
        (value) => value && value.replace(/<[^>]+>/g, '').trim().length > 0
      ),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (editingId) {
          await updateNewsMutation.mutateAsync({ id: editingId, ...values });
        } else {
          await createNewsMutation.mutateAsync(values);
        }
      } catch (err) {
        console.error('Lỗi khi lưu bài:', err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleEdit = (article) => {
    setEditingId(article.id);
    formik.setValues({
      title: article.title,
      content: article.content,
      thumbnail: article.thumbnail || '',
      type: article.type
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      deleteNewsMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    formik.resetForm();
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  if (isFormOpen) {
    return (
      <div className="w-full max-w-5xl relative">
        {(formik.isSubmitting || updateNewsMutation.isPending || createNewsMutation.isPending) && <Loading fullScreen message="Đang xử lý..." />}
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
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Tiêu đề bài viết</label>
            <input 
              type="text" 
              name="title"
              className={`w-full p-3 border rounded outline-none focus:ring-hepco-green focus:border-hepco-green ${
                formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-300'
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
            <label className="block text-lg font-medium text-gray-700 mb-2">Ảnh đại diện (Thumbnail)</label>
            <input 
              type="file" 
              accept="image/*"
              className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-hepco-green focus:border-hepco-green"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const formData = new FormData();
                  formData.append('image', file);
                  try {
                    toast.loading('Đang tải ảnh lên...', { id: 'upload' });
                    const res = await axiosInstance.post('/api/upload', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    if (res.data.success) {
                      formik.setFieldValue('thumbnail', res.data.url);
                      toast.success('Tải ảnh thành công!', { id: 'upload' });
                    }
                  } catch {
                    toast.error('Lỗi tải ảnh lên', { id: 'upload' });
                  }
                }
              }}
            />
            {formik.values.thumbnail && (
               <img src={`${API_BASE_URL}${formik.values.thumbnail}`} alt="Thumbnail" className="mt-2 h-32 object-cover rounded shadow" />
            )}
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Nội dung</label>
            <div className={`bg-white ${formik.touched.content && formik.errors.content ? 'border border-red-500 rounded' : ''}`}>
              <ReactQuill 
                theme="snow"
                value={formik.values.content}
                onChange={(content) => {
                  formik.setFieldValue('content', content);
                }}
                onBlur={() => {
                  formik.setFieldTouched('content', true);
                }}
                modules={modules}
                className="h-96 mb-12"
              />
            </div>
            {formik.touched.content && formik.errors.content ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.content}</div>
            ) : null}
          </div>

          <div className="flex justify-end pt-4 gap-4">
            <button 
              type="button"
              onClick={handleCloseForm}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded shadow transition-colors"
            >
              Hủy Bỏ
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-hepco-green hover:bg-green-700 text-white font-semibold rounded shadow transition-colors"
            >
              {editingId ? 'Cập Nhật' : 'Đăng Bài'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl relative">
      {deleteNewsMutation.isPending && <Loading fullScreen message="Đang xóa..." />}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý {titleText}</h1>
        <button 
          onClick={() => {
            setEditingId(null);
            formik.resetForm();
            formik.setFieldValue('type', type);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-hepco-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm Bài Viết</span>
        </button>
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
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Tiêu đề</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Ngày đăng</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">#{item.id}</td>
                    <td className="px-6 py-4">
                      {item.thumbnail || item.image ? (
                        <img 
                          src={item.thumbnail || item.image} 
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
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
};

export default AdminNewsManager;
