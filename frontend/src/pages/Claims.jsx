import { AlertCircle } from 'lucide-react';

export default function Claims() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">إدارة المطالبات</h1>
      
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">قريباً</h2>
        <p className="text-gray-600">جاري العمل على صفحة إدارة المطالبات</p>
      </div>
    </div>
  );
}
