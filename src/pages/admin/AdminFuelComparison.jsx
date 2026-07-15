import { useState } from 'react';
import * as xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Download, Upload, AlertCircle, FileSpreadsheet } from 'lucide-react';

const FileUploadZone = ({ label, file, setFile, accept = ".xlsx, .xls", extraContent }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <FileSpreadsheet className="w-4 h-4 text-green-600" />
        {label}
      </label>
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all ${
          isDragging ? 'border-green-500 bg-green-50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-green-300'
        }`}
      >
        <Upload className={`w-8 h-8 mb-3 transition-colors ${isDragging ? 'text-green-500' : 'text-gray-400'}`} />
        <p className="text-sm text-gray-600 mb-3 text-center">
          {file ? (
            <span className="font-semibold text-green-600 break-all">{file.name}</span>
          ) : (
            <span>Kéo thả file vào đây hoặc</span>
          )}
        </p>
        <label className="cursor-pointer">
          <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors shadow-sm inline-block">
            Chọn File
          </span>
          <input 
            type="file" 
            className="hidden" 
            accept={accept}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>
      {extraContent && <div className="mt-4 pt-3 border-t border-gray-100">{extraContent}</div>}
    </div>
  );
};

const AdminFuelComparison = () => {
  const [apiFile, setApiFile] = useState(null);
  const [cqFile, setCqFile] = useState(null);
  const [sheetName, setSheetName] = useState('T12');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const normalizeBSX = (bsx) => {
    if (!bsx) return '';
    return bsx.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const getShortBSX = (bsx) => {
    const normalized = normalizeBSX(bsx);
    if (!normalized) return '';
    return normalized.slice(-4);
  };

  const handleCompare = async () => {
    if (!apiFile || !cqFile) {
      setError('Vui lòng chọn đủ 2 file Excel (API và Cơ quan xăng dầu).');
      return;
    }
    setError(null);

    try {
      const apiDataBuf = await apiFile.arrayBuffer();
      const wbApi = xlsx.read(apiDataBuf, { type: 'array' });
      const sheetApi = wbApi.Sheets[wbApi.SheetNames[0]];
      const dataApi = xlsx.utils.sheet_to_json(sheetApi, { header: 1 });

      const headerRowApi = dataApi.findIndex(row => row[0] === 'Biển số');
      if (headerRowApi === -1) throw new Error('Không tìm thấy cột "Biển số" trong file API.');

      const headerApiData = dataApi[headerRowApi];
      const colPhanMemIndex = headerApiData.findIndex(h => h && h.includes('Dầu cấp'));
      const colTieuThuIndex = headerApiData.findIndex(h => h && h.includes('Dầu tiêu thụ'));

      const apiStats = {};
      for (let i = headerRowApi + 1; i < dataApi.length; i++) {
        const row = dataApi[i];
        if (!row || !row[0]) continue;
        
        const bsx = normalizeBSX(row[0]);
        if (!bsx || bsx === '00' || bsx === '0') continue;
        
        let fuelValStr = row[colPhanMemIndex] ?? row[colTieuThuIndex];
        let phanMemFuel = 0;
        if (typeof fuelValStr === 'number') {
          phanMemFuel = fuelValStr;
        } else if (typeof fuelValStr === 'string') {
          phanMemFuel = parseFloat(fuelValStr.replace(/,/g, '')) || 0;
        }
        apiStats[bsx] = (apiStats[bsx] || 0) + phanMemFuel;
      }

      const cqDataBuf = await cqFile.arrayBuffer();
      const wbCq = xlsx.read(cqDataBuf, { type: 'array' });
      
      let targetSheetName = sheetName.trim();
      if (!targetSheetName) {
        targetSheetName = wbCq.SheetNames[0];
      }
      
      const sheetCq = wbCq.Sheets[targetSheetName];
      if (!sheetCq) throw new Error(`Không tìm thấy sheet "${targetSheetName}" trong file Cơ quan.`);
      
      const dataCq = xlsx.utils.sheet_to_json(sheetCq, { header: 1 });
      const headerRowCq = dataCq.findIndex(row => row.includes('BSX') || row.includes('Biển số xe'));
      if (headerRowCq === -1) throw new Error('Không tìm thấy cột "BSX" trong file Cơ quan.');

      const headerCqData = dataCq[headerRowCq];
      const bsxColIndex = headerCqData.findIndex(h => h === 'BSX' || h === 'Biển số xe');
      const fuelColIndex = headerCqData.findIndex(h => h === 'Số lượng');
      
      const cqStats = {};
      const cqCounts = {};
      for (let i = headerRowCq + 1; i < dataCq.length; i++) {
        const row = dataCq[i];
        if (!row || !row[bsxColIndex]) continue;

        const bsx = normalizeBSX(row[bsxColIndex]);
        if (!bsx) continue;

        let cqFuel = 0;
        let valStr = row[fuelColIndex];
        if (typeof valStr === 'number') {
          cqFuel = valStr;
        } else if (typeof valStr === 'string') {
          cqFuel = parseFloat(valStr.replace(/,/g, '')) || 0;
        }
        cqStats[bsx] = (cqStats[bsx] || 0) + cqFuel;
        if (cqFuel > 0) {
          cqCounts[bsx] = (cqCounts[bsx] || 0) + 1;
        }
      }

      const allBsx = new Set([...Object.keys(apiStats), ...Object.keys(cqStats)]);
      const newResults = [];
      let stt = 1;

      for (const bsx of allBsx) {
        const cayXang = cqStats[bsx] || 0;
        const phanMem = apiStats[bsx] || 0;
        const chenhLech = cayXang - phanMem;
        
        let tiLe = 0;
        if (cayXang > 0) {
          tiLe = Math.abs(chenhLech / cayXang);
        } else if (phanMem > 0) {
          tiLe = 1;
        }

        newResults.push({
          'STT': stt++,
          'Biển Số Đầy Đủ': bsx,
          'BSX (Ngắn)': getShortBSX(bsx),
          'Số lần đổ (CQ)': cqCounts[bsx] || 0,
          'Cây xăng (Lít)': parseFloat(cayXang.toFixed(2)),
          'Phần mềm (Lít)': parseFloat(phanMem.toFixed(2)),
          'Chênh lệch (Lít)': parseFloat(chenhLech.toFixed(2)),
          'Tỷ lệ (%)': (tiLe * 100).toFixed(2) + '%'
        });
      }

      newResults.sort((a, b) => b['Chênh lệch (Lít)'] - a['Chênh lệch (Lít)']);
      setResults(newResults);

    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = async () => {
    if (results.length === 0) return;
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Đối Chiếu Nhiên Liệu');

      sheet.columns = [
        { key: 'stt', width: 10 },
        { key: 'full_bsx', width: 20 },
        { key: 'short_bsx', width: 15 },
        { key: 'refuels', width: 15 },
        { key: 'cq_fuel', width: 18 },
        { key: 'api_fuel', width: 18 },
        { key: 'diff', width: 18 },
        { key: 'ratio', width: 15 },
      ];

      // Row 1: Title
      sheet.mergeCells('A1:H1');
      const titleCell = sheet.getRow(1).getCell(1);
      titleCell.font = { name: 'Times New Roman', size: 16, bold: true, color: { argb: 'FF1F497D' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      sheet.getRow(1).height = 35;

      // Row 2: Headers
      const headerRow = sheet.addRow({
        stt: 'STT',
        full_bsx: 'Biển Số Đầy Đủ',
        short_bsx: 'BSX (Ngắn)',
        refuels: 'Số lần đổ (CQ)',
        cq_fuel: 'Cây xăng (Lít)',
        api_fuel: 'Phần mềm (Lít)',
        diff: 'Chênh lệch (Lít)',
        ratio: 'Tỷ lệ (%)'
      });
      headerRow.height = 30;

      for (let c = 1; c <= 8; c++) {
        const cell = headerRow.getCell(c);
        cell.font = { name: 'Times New Roman', bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F497D' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      }

      results.forEach((row, i) => {
        const isAlternate = i % 2 !== 0;
        const color = isAlternate ? 'FFF2F2F2' : 'FFFFFFFF';
        
        const dataRow = sheet.addRow({
          stt: row.STT,
          full_bsx: row['Biển Số Đầy Đủ'],
          short_bsx: row['BSX (Ngắn)'],
          refuels: row['Số lần đổ (CQ)'],
          cq_fuel: row['Cây xăng (Lít)'],
          api_fuel: row['Phần mềm (Lít)'],
          diff: row['Chênh lệch (Lít)'],
          ratio: row['Tỷ lệ (%)']
        });
        
        dataRow.height = 25;
        
        for (let c = 1; c <= 8; c++) {
          const cell = dataRow.getCell(c);
          cell.font = { name: 'Times New Roman', size: 11, color: { argb: 'FF000000' } };
          cell.alignment = { vertical: 'middle', horizontal: (c >= 4 && c !== 5) ? 'right' : 'center' }; // Cây xăng (5), Phần mềm (6)... wait, refuels is 4, cq_fuel is 5, api is 6, diff is 7, ratio is 8.
          if (c >= 4) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          }
          cell.border = { top: { style: 'thin', color: { argb: 'FF000000' } }, left: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'thin', color: { argb: 'FF000000' } }, right: { style: 'thin', color: { argb: 'FF000000' } } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `KetQuaDoiChieuXangDau_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error(error);
      setError('Có lỗi xảy ra khi xuất Excel');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-5xl mx-auto font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đối Chiếu Nhiên Liệu</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FileUploadZone 
          label="File từ API (Quản lý lộ trình)"
          file={apiFile}
          setFile={setApiFile}
        />
        
        <FileUploadZone 
          label="File từ Cơ quan xăng dầu"
          file={cqFile}
          setFile={setCqFile}
          extraContent={
            <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Tên Sheet cần đọc:</span>
              <input 
                type="text" 
                value={sheetName} 
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="VD: T12"
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-semibold outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 w-28 text-center"
              />
            </div>
          }
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={handleCompare}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          <Upload className="w-4 h-4" />
          Tiến hành đối chiếu
        </button>
        {results.length > 0 && (
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            <Download className="w-4 h-4" />
            Tải Excel
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">STT</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Biển Số Đầy Đủ</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">BSX (Ngắn)</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Số lần đổ</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Cây xăng (Lít)</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Phần mềm (Lít)</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Chênh lệch (Lít)</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Tỷ lệ (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.STT}</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-800 font-bold">{row['Biển Số Đầy Đủ']}</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">{row['BSX (Ngắn)']}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{row['Số lần đổ (CQ)']}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right">{row['Cây xăng (Lít)']}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right">{row['Phần mềm (Lít)']}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-bold text-right">{row['Chênh lệch (Lít)']}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-bold text-right">{row['Tỷ lệ (%)']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFuelComparison;
