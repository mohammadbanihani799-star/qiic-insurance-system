import { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, Phone, Mail } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll();
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('فشل في تحميل بيانات العملاء');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.qatarId?.includes(searchTerm) ||
    customer.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">إدارة العملاء</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة عميل جديد
        </button>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث بالاسم، الرقم القطري، أو رقم الهاتف..."
            className="input-field pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qiic-maroon mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">لا توجد بيانات عملاء</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الاسم الكامل</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الرقم القطري</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">رقم الهاتف</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">البريد الإلكتروني</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">المدينة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.customerId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{customer.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.qatarId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.address?.city || 'الدوحة'}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
