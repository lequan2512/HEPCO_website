import { useState } from 'react';
import { useFormik, getIn } from 'formik';
import * as Yup from 'yup';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUp, ArrowDown, Plus, Trash2, Save, Eye, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useShowcase } from '../../../apis/showcase';
import { saveShowcase } from '../../../services/showcase.service';
import { SHOWCASE_MAX_ITEMS, SHOWCASE_TITLE_LIMIT, SHOWCASE_TEXT_LIMIT, isShowcaseUrl } from '../../../constants/showcase';
import { getErrorMessage } from '../../../utils/errorMapper';
import HomeShowcaseView from '../../../components/HomeShowcaseView';
import Loading from '../../../components/Loading';
import ConfirmModal from '../../../components/ConfirmModal';
import ShowcaseImagePicker from './ShowcaseImagePicker';

const requiredText = (max) => Yup.string().trim().max(max, `Tối đa ${max} ký tự`).required('Vui lòng nhập nội dung');
const normalize = (data) => ({
  ...data,
  items: (data?.items || []).map((item) => ({ subtitle: '', ...item })),
  sections: data?.sections || [],
});
const urlField = (image = false) => Yup.string().required('Vui lòng nhập đường dẫn').test('permanent-url', 'Dùng đường dẫn nội bộ hoặc HTTPS hợp lệ', (value) => isShowcaseUrl(value, image));
const schema = Yup.object({
  title: requiredText(SHOWCASE_TITLE_LIMIT), description: Yup.string().max(SHOWCASE_TEXT_LIMIT), linkLabel: requiredText(SHOWCASE_TITLE_LIMIT), href: urlField(),
  items: Yup.array().min(1).max(SHOWCASE_MAX_ITEMS).of(Yup.object({ title: requiredText(SHOWCASE_TITLE_LIMIT), subtitle: Yup.string().max(SHOWCASE_TEXT_LIMIT, `Tối đa ${SHOWCASE_TEXT_LIMIT} ký tự`), location: Yup.string().max(SHOWCASE_TEXT_LIMIT), scale: Yup.string().max(SHOWCASE_TEXT_LIMIT), image: urlField(true), href: urlField(), linkLabel: requiredText(SHOWCASE_TITLE_LIMIT) })),
});

const ShowcaseEditor = ({ initial, reload }) => {
  const cache = useQueryClient();
  const [version, setVersion] = useState(initial.version);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [removeIndex, setRemoveIndex] = useState(null);
  const [reloadConfirm, setReloadConfirm] = useState(false);
  const [reloading, setReloading] = useState(false);
  const form = useFormik({
    initialValues: normalize(initial.data),
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const result = await saveShowcase(values, version);
        setVersion(result.version);
        form.resetForm({ values: normalize(result.data) });
        cache.setQueryData(['home-showcase'], result);
        toast.success('Máy chủ đã lưu Hoạt động & Dự án trọng điểm. Trang chủ sẽ dùng nội dung mới.');
      } catch (error) { toast.error(getErrorMessage(error?.response?.data?.errorCode)); }
    },
  });
  const busy = form.isSubmitting || uploading || reloading;
  const move = (from, offset, target = 'items') => {
    const next = [...form.values[target]];
    const [item] = next.splice(from, 1);
    next.splice(from + offset, 0, item);
    form.setFieldValue(target, next);
  };
  const field = (path, label, area = false) => {
    const error = getIn(form.touched, path) && getIn(form.errors, path);
    const value = getIn(form.values, path) ?? '';
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
        {area ? <textarea name={path} value={value} onChange={form.handleChange} onBlur={form.handleBlur} rows={3} disabled={busy} className={`w-full p-3 rounded-xl border text-sm ${error ? 'border-red-400' : 'border-gray-200'}`} /> : <input type="text" name={path} value={value} onChange={form.handleChange} onBlur={form.handleBlur} disabled={busy} className={`w-full p-3 rounded-xl border text-sm ${error ? 'border-red-400' : 'border-gray-200'}`} />}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  };
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <form onSubmit={form.handleSubmit} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div><h1 className="text-xl sm:text-2xl font-black text-gray-800">Quản lý Hoạt Động & Dự Án Trọng Điểm</h1><p className="text-xs text-gray-400">Phiên bản {version}</p></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => form.dirty ? setReloadConfirm(true) : reload()} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-semibold"><RotateCcw className="w-4 h-4" />Tải lại</button>
            <button type="button" onClick={() => setPreview(!preview)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold"><Eye className="w-4 h-4" />{preview ? 'Ẩn xem trước' : 'Xem trước'}</button>
            <button type="submit" disabled={busy || !form.dirty} className="inline-flex items-center gap-2 px-4 py-2.5 bg-hepco-green text-white rounded-xl text-sm font-bold disabled:opacity-50"><Save className="w-4 h-4" />{form.isSubmitting ? 'Đang lưu…' : 'Lưu lên máy chủ'}</button>
          </div>
        </div>
        <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
          <section className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-100 space-y-3">
            <h2 className="text-lg font-bold text-gray-800">Bố cục trang chủ</h2>
            {form.values.sections.map(({ id, visible, label: sectionLabel }, index) => {
              const label = sectionLabel || id;
              return <div key={id} className="flex items-center justify-between gap-3 border-b border-gray-100 py-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={visible} onChange={(event) => form.setFieldValue(`sections[${index}].visible`, event.target.checked)} />
                  {label}
                </label>
                <div className="flex gap-2">
                  <button type="button" aria-label={`Đưa ${label} lên`} disabled={index === 0} onClick={() => move(index, -1, 'sections')} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"><ArrowUp className="w-4 h-4" /></button>
                  <button type="button" aria-label={`Đưa ${label} xuống`} disabled={index === form.values.sections.length - 1} onClick={() => move(index, 1, 'sections')} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"><ArrowDown className="w-4 h-4" /></button>
                </div>
              </div>;
            })}
          </section>
          <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            {field('title', 'Tiêu đề khối')}{field('description', 'Mô tả khối', true)}
            <div className="grid md:grid-cols-2 gap-5">{field('linkLabel', 'Chữ trên nút thư viện')}{field('href', 'Đường dẫn nút thư viện')}</div>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-gray-100 space-y-5">
            <div className="flex flex-wrap justify-between items-center gap-3"><h2 className="text-lg font-bold text-gray-800">Các thẻ hoạt động ({form.values.items.length}/{SHOWCASE_MAX_ITEMS})</h2><button type="button" disabled={form.values.items.length >= SHOWCASE_MAX_ITEMS} onClick={() => form.setFieldValue('items', [...form.values.items, { id: crypto.randomUUID(), title: 'Hoạt động mới', subtitle: '', location: '', scale: '', image: '/images/news_cleanup.png', href: '/tin-tuc?tab=gallery', linkLabel: 'Xem thư viện ảnh' }])} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold disabled:opacity-40"><Plus className="w-4 h-4" />Thêm thẻ</button></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {form.values.items.map((item, index) => <div key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden flex flex-col">
                <div className="p-3 bg-white flex items-center justify-between gap-2 border-b border-gray-100"><span className="text-sm font-semibold text-gray-500" aria-label={`Thẻ ${index + 1}`}>#{index + 1}</span><div className="flex items-center gap-1">
                  <button type="button" aria-label={`Đưa thẻ ${index + 1} lên trước`} disabled={index === 0} onClick={() => move(index, -1)} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40"><ArrowUp className="w-4 h-4" /></button>
                  <button type="button" aria-label={`Đưa thẻ ${index + 1} xuống sau`} disabled={index === form.values.items.length - 1} onClick={() => move(index, 1)} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40"><ArrowDown className="w-4 h-4" /></button>
                  <button type="button" aria-label={`Bỏ thẻ ${index + 1}`} disabled={form.values.items.length === 1} onClick={() => setRemoveIndex(index)} className="p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-40"><Trash2 className="w-4 h-4" /></button>
                </div></div>
                <div className="p-4 sm:p-5 space-y-4">
                  <ShowcaseImagePicker name={`showcase-${item.id}`} value={item.image} onChange={(url) => form.setFieldValue(`items[${index}].image`, url)} onBusyChange={setUploading} disabled={busy} />
                  {field(`items[${index}].subtitle`, 'Phụ đề ảnh', true)}
                  {field(`items[${index}].title`, 'Tiêu đề thẻ')}
                  <div className="grid sm:grid-cols-2 gap-3">{field(`items[${index}].location`, 'Địa điểm')}{field(`items[${index}].scale`, 'Quy mô / số lượng')}</div>
                  <div className="grid sm:grid-cols-2 gap-3">{field(`items[${index}].linkLabel`, 'Chữ trên liên kết')}{field(`items[${index}].href`, 'Đường dẫn liên kết')}</div>
                </div>
              </div>)}
            </div>
          </div>
        </fieldset>
      </form>
      {preview && <div className="mt-6 rounded-2xl border border-gray-200 overflow-hidden bg-white"><p className="p-4 bg-gray-50 text-sm font-semibold">Xem trước bản đang sửa — chưa áp dụng cho trang chủ</p><HomeShowcaseView config={form.values} preview /></div>}
      <ConfirmModal isOpen={removeIndex !== null} title="Xóa thẻ hoạt động" message="Bạn có chắc chắn muốn bỏ thẻ này khỏi khối hoạt động trọng điểm?" confirmText="Xóa thẻ" onConfirm={() => { const next = [...form.values.items]; next.splice(removeIndex, 1); form.setFieldValue('items', next); setRemoveIndex(null); }} onCancel={() => setRemoveIndex(null)} />
      <ConfirmModal isOpen={reloadConfirm} title="Hủy các thay đổi chưa lưu?" message="Bạn có thay đổi chưa lưu lên máy chủ. Việc tải lại sẽ làm mất các nội dung này." confirmText="Tải lại ngay" onConfirm={async () => { setReloading(true); try { const result = await reload(); setVersion(result.data.version); form.resetForm({ values: normalize(result.data.data) }); } finally { setReloading(false); setReloadConfirm(false); } }} onCancel={() => setReloadConfirm(false)} />
    </div>
  );
};

const AdminShowcaseManager = () => {
  const { data, isLoading, isError, refetch } = useShowcase();
  if (isLoading) return <Loading />;
  if (isError) return <div>Lỗi tải dữ liệu</div>;
  return <ShowcaseEditor initial={data} reload={refetch} />;
};

export default AdminShowcaseManager;
