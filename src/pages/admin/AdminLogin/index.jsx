import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ROUTES } from '../../../constants/routes';
import axiosInstance from '../../../utils/axios';
import useAuthStore from '../../../store/useAuthStore';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorMapper';
import Loading from '../../../components/Loading';

const AdminLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Vui lòng nhập tên đăng nhập'),
      password: Yup.string().required('Vui lòng nhập mật khẩu'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axiosInstance.post('/api/login', {
          username: values.username,
          password: values.password,
        });

        if (response.data.success) {
          setAuth(response.data.token);
          navigate(ROUTES.ADMIN_DASHBOARD);
        } else {
          const errorCode = response.data.errorCode;
          toast.error(getErrorMessage(errorCode));
        }
      } catch (err) {
        console.error('Login error:', err);
        const errorCode = err.response?.data?.errorCode;
        toast.error(getErrorMessage(errorCode));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex items-center justify-center py-20 bg-gray-50 flex-grow relative">
      {formik.isSubmitting && <Loading fullScreen message="Đang đăng nhập..." />}
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-hepco-green mb-6">Đăng nhập Quản trị</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input 
              type="text" 
              name="username"
              className={`w-full mt-1 p-2 border rounded outline-none focus:ring-hepco-green focus:border-hepco-green ${
                formik.touched.username && formik.errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="admin"
            />
            {formik.touched.username && formik.errors.username ? (
              <div className="text-red-500 text-xs mt-1">{formik.errors.username}</div>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input 
              type="password" 
              name="password"
              className={`w-full mt-1 p-2 border rounded outline-none focus:ring-hepco-green focus:border-hepco-green ${
                formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="123456"
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
            ) : null}
          </div>
          <button 
            type="submit"
            className="w-full py-2 px-4 bg-[#008c45] hover:bg-green-700 text-white font-semibold rounded transition-colors"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
