import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import useAuthStore from '../../../store/useAuthStore';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorMapper';
import Loading from '../../../components/Loading';
import { useLogin } from '../../../apis/auth';
import logo from '../../../assets/images/logo.png';

const AdminLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.ADMIN_OVERVIEW, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { mutateAsync: loginMutation } = useLogin();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Vui lòng nhập tên đăng nhập'),
      password: Yup.string().required('Vui lòng nhập mật khẩu')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const data = await loginMutation({
          username: values.username.trim(),
          password: values.password
        });

        if (data.success) {
          setAuth(data.token);
          toast.success('Đăng nhập hệ thống quản trị thành công!');
          navigate(ROUTES.ADMIN_OVERVIEW);
        } else {
          toast.error(getErrorMessage(data.errorCode) || 'Sai tên đăng nhập hoặc mật khẩu');
        }
      } catch (err) {
        const errorCode = err.response?.data?.errorCode;
        toast.error(getErrorMessage(errorCode) || 'Đăng nhập thất bại');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleQuickFill = () => {
    formik.setValues({
      username: 'admin',
      password: '123456'
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 bg-gradient-to-br from-emerald-950 via-[#10243b] to-emerald-900 relative">
      {formik.isSubmitting && <Loading fullScreen message="Đang xác thực tài khoản..." />}

      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-hepco-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            HEPCO CMS
          </span>
        </div>

        <div className="flex justify-center mb-4">
          <img src={logo} alt="HEPCO Logo" className="h-16 w-auto object-contain" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-center text-[#10243b] mb-1">
          Hệ Thống Quản Trị Website
        </h2>
        <p className="text-xs sm:text-sm text-center text-gray-500 mb-6">
          Quản lý Tin tức, Cổ đông, Giới thiệu, Dịch vụ, Hình ảnh &amp; Banner
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green focus:border-hepco-green transition-all ${
                formik.touched.username && formik.errors.username
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Nhập tên đăng nhập (admin)"
            />
            {formik.touched.username && formik.errors.username ? (
              <div className="text-red-500 text-xs mt-1">{formik.errors.username}</div>
            ) : null}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-hepco-green focus:border-hepco-green transition-all ${
                formik.touched.password && formik.errors.password
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Nhập mật khẩu (123456)"
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
            ) : null}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-hepco-green hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Đăng nhập Quản trị
          </button>
        </form>

        {/* Quick Fill Helper for Admin */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2 text-xs text-gray-500">
          <span>Tài khoản: <strong>admin / 123456</strong></span>
          <button
            type="button"
            onClick={handleQuickFill}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-hepco-green font-bold transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Điền nhanh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
