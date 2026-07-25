import { useState, useEffect } from 'react';
import { Search, X, Package, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useGetDevices, useUpdateDevice } from '../apis/device';
import Pagination from './Pagination';
import { PC_COMPONENTS, DEVICE_STATUS, DEVICE_CATEGORY_CODES } from '../constants/device';

const AssembleDeviceModal = ({
  isOpen,
  onClose,
  assembleDevice,
  setAssembleDevice,
  categories
}) => {
  const queryClient = useQueryClient();
  const updateDeviceMutation = useUpdateDevice();

  const [assembleSearch, setAssembleSearch] = useState('');
  const [debouncedAssembleSearch, setDebouncedAssembleSearch] = useState('');
  const [assembleCategory, setAssembleCategory] = useState('');
  const [assemblePage, setAssemblePage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAssembleSearch(assembleSearch);
      setAssemblePage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [assembleSearch]);

  const { data: availableComponentsRes, isFetching: isFetchingComponents } = useGetDevices(
    {
      status: DEVICE_STATUS.IN_STOCK,
      hide_assembled: true,
      is_component: true,
      search: debouncedAssembleSearch,
      category_id: assembleCategory,
      page: assemblePage,
      limit: 10
    },
    { enabled: isOpen && !!assembleDevice }
  );

  const availableComponents = availableComponentsRes?.data || [];
  const assembleMeta = availableComponentsRes?.meta;

  if (!isOpen || !assembleDevice) return null;

  const existingCategories = assembleDevice.child_devices?.map(c => c.category?.code) || [];
  const checkCanAssemble = (compCode) => {
    if (!compCode) return true;
    if (!PC_COMPONENTS.includes(compCode)) return false;

    const singleLimitCodes = [DEVICE_CATEGORY_CODES.CPU, DEVICE_CATEGORY_CODES.MAINBOARD, DEVICE_CATEGORY_CODES.PSU, DEVICE_CATEGORY_CODES.CASE, DEVICE_CATEGORY_CODES.COOLER];
    return !(singleLimitCodes.includes(compCode) && existingCategories.includes(compCode));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col relative">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-6 h-6 text-hepco-green" /> Lắp ráp cấu hình
            </h2>
            <p className="text-sm text-gray-500 mt-1">Cấu hình linh kiện cho: <span className="font-semibold text-gray-800">{assembleDevice.name}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 bg-gray-50/50">
          {/* Linh kiện đang lắp */}
          <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Linh kiện đang lắp trong máy ({assembleDevice.child_devices?.length || 0})</h3>
            <div className="space-y-3">
              {assembleDevice.child_devices?.length > 0 ? assembleDevice.child_devices.map(comp => (
                <div key={comp.id} className="flex justify-between items-center p-3 bg-purple-50 border border-purple-100 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{comp.name}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await updateDeviceMutation.mutateAsync({ id: comp.id, parent_device_id: null, status: DEVICE_STATUS.IN_STOCK });
                      toast.success('Đã tháo linh kiện');
                      setAssembleDevice(prev => ({ ...prev, child_devices: prev.child_devices.filter(c => c.id !== comp.id) }));
                      queryClient.invalidateQueries({ queryKey: ['devices'] });
                      queryClient.invalidateQueries({ queryKey: ['assignments'] });
                    }}
                    className="text-xs font-semibold text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded transition-colors"
                  >
                    Tháo ra
                  </button>
                </div>
              )) : (
                <p className="text-sm text-gray-500 italic text-center py-4">Máy này chưa được lắp linh kiện nào.</p>
              )}
            </div>
          </div>

          {/* Linh kiện trong kho */}
          <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Kho linh kiện sẵn có ({availableComponentsRes?.meta?.total || availableComponents.length})</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Tìm linh kiện, S/N..."
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
                  value={assembleSearch}
                  onChange={(e) => setAssembleSearch(e.target.value)}
                />
              </div>
              <select
                className="w-full sm:w-auto py-1.5 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
                value={assembleCategory}
                onChange={(e) => { setAssembleCategory(e.target.value); setAssemblePage(1); }}
              >
                <option value="">Tất cả danh mục</option>
                {categories?.filter(c => c.is_component).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 max-h-[400px] pr-1">
              {(() => {
                if (isFetchingComponents) {
                  return (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-6 h-6 text-hepco-green animate-spin" />
                    </div>
                  );
                }

                if (availableComponents.length === 0) return <p className="text-sm text-gray-500 italic text-center py-4">Không tìm thấy linh kiện phù hợp.</p>;

                return availableComponents.map(comp => {
                  const canAdd = checkCanAssemble(comp.category?.code);
                  return (
                    <div key={comp.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{comp.name}</p>
                      </div>
                      <button
                        disabled={!canAdd}
                        onClick={async () => {
                          await updateDeviceMutation.mutateAsync({ id: comp.id, parent_device_id: assembleDevice.id, status: assembleDevice.status });
                          toast.success('Đã lắp linh kiện vào máy');
                          setAssembleDevice(prev => ({ ...prev, child_devices: [...(prev.child_devices || []), comp] }));
                          queryClient.invalidateQueries({ queryKey: ['devices'] });
                          queryClient.invalidateQueries({ queryKey: ['assignments'] });
                        }}
                        className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${canAdd ? 'text-hepco-green bg-green-100 hover:bg-green-200' : 'text-gray-400 bg-gray-200 cursor-not-allowed'}`}
                      >
                        {canAdd ? 'Lắp vào' : 'Đã có'}
                      </button>
                    </div>
                  )
                })
              })()}
            </div>
            {assembleMeta && assembleMeta.totalPages > 1 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Pagination meta={assembleMeta} onPageChange={setAssemblePage} hideTotal size="sm" />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-white flex justify-end">
          <button onClick={onClose} className="py-2 px-6 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssembleDeviceModal;
