import { useState, useEffect } from 'react';
import { vehicleAPI } from '../services/api';
import { Plus, Search, Car } from 'lucide-react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getAll();
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      alert('فشل في تحميل بيانات المركبات');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const vehicleTypeMap = {
    sedan: 'سيدان',
    suv: 'دفع رباعي',
    truck: 'شاحنة',
    motorcycle: 'دراجة نارية',
    bus: 'حافلة',
    van: 'فان'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">إدارة المركبات</h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          تسجيل مركبة جديدة
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث برقم اللوحة، الماركة، أو الموديل..."
            className="input-field pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qiic-maroon mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد مركبات مسجلة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.vehicleId} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-qiic-maroon text-white p-3 rounded-lg">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-sm text-gray-600">{vehicle.year}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم اللوحة:</span>
                    <span className="font-semibold">{vehicle.plateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم الشاسيه:</span>
                    <span className="font-mono text-xs">{vehicle.chassisNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">النوع:</span>
                    <span>{vehicleTypeMap[vehicle.vehicleType] || vehicle.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">اللون:</span>
                    <span>{vehicle.color}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
