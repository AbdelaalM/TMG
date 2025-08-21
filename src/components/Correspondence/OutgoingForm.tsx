import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  User, 
  Building2, 
  AlertCircle,
  FileText,
  Mail,
  Shield,
  Clock,
  Upload,
  Send
} from 'lucide-react';
import { Correspondence, Employee, Department, Division } from '../../types';
import { databaseService } from '../../services/DatabaseService';

// واجهة خصائص نموذج المراسلة الصادرة
interface OutgoingFormProps {
  correspondence?: Correspondence | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (correspondence: Partial<Correspondence>) => void;
}

// مكون نموذج المراسلة الصادرة
const OutgoingForm: React.FC<OutgoingFormProps> = ({ 
  correspondence, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  // حالات النموذج
  const [formData, setFormData] = useState<Partial<Correspondence>>({
    number: '',
    date: new Date(),
    recipient: '',
    recipientOrganization: '',
    subject: '',
    confidentiality: 'عادي',
    urgency: 'عادي',
    status: 'مسودة',
    department: '',
    division: '',
    assignedTo: '',
    notes: '',
    deliveryChannel: 'بريد'
  });

  // بيانات مساعدة
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // تحميل البيانات المساعدة
  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesData, departmentsData, divisionsData] = await Promise.all([
          databaseService.getAll<Employee>('employees'),
          databaseService.getAll<Department>('departments'),
          databaseService.getAll<Division>('divisions')
        ]);

        setEmployees(employeesData);
        setDepartments(departmentsData);
        setDivisions(divisionsData);
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // تحديث النموذج عند تغيير المراسلة
  useEffect(() => {
    if (correspondence) {
      setFormData({
        ...correspondence,
        date: new Date(correspondence.date)
      });
    } else {
      // توليد رقم صادر جديد
      const newNumber = `OUT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setFormData({
        number: newNumber,
        date: new Date(),
        recipient: '',
        recipientOrganization: '',
        subject: '',
        confidentiality: 'عادي',
        urgency: 'عادي',
        status: 'مسودة',
        department: '',
        division: '',
        assignedTo: '',
        notes: '',
        deliveryChannel: 'بريد'
      });
    }
    setErrors({});
  }, [correspondence]);

  // فلترة الأقسام حسب الإدارة المختارة
  useEffect(() => {
    if (formData.department) {
      const filtered = divisions.filter(div => div.departmentId === formData.department);
      setFilteredDivisions(filtered);
      
      if (formData.division && !filtered.find(div => div.id === formData.division)) {
        setFormData(prev => ({ ...prev, division: '', assignedTo: '' }));
      }
    } else {
      setFilteredDivisions([]);
    }
  }, [formData.department, divisions]);

  // فلترة الموظفين حسب الإدارة والقسم
  useEffect(() => {
    let filtered = employees;
    
    if (formData.department) {
      filtered = filtered.filter(emp => emp.department === formData.department);
    }
    
    if (formData.division) {
      filtered = filtered.filter(emp => emp.division === formData.division);
    }
    
    setFilteredEmployees(filtered);
    
    if (formData.assignedTo && !filtered.find(emp => emp.id === formData.assignedTo)) {
      setFormData(prev => ({ ...prev, assignedTo: '' }));
    }
  }, [formData.department, formData.division, employees]);

  // دالة تحديث حقول النموذج
  const handleInputChange = (field: keyof Correspondence, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // دالة التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.number?.trim()) {
      newErrors.number = 'رقم الصادر مطلوب';
    }

    if (!formData.recipient?.trim()) {
      newErrors.recipient = 'اسم المستلم مطلوب';
    }

    if (!formData.subject?.trim()) {
      newErrors.subject = 'موضوع المراسلة مطلوب';
    }

    if (!formData.department) {
      newErrors.department = 'الإدارة المصدرة مطلوبة';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'الموظف المعد مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // دالة حفظ المراسلة
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('خطأ في حفظ المراسلة:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* رأس النموذج */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {correspondence ? 'تعديل المراسلة الصادرة' : 'إنشاء مراسلة صادرة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* محتوى النموذج */}
        <div className="p-6 space-y-6">
          
          {/* الصف الأول: رقم الصادر والتاريخ وقناة التسليم */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* رقم الصادر */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                رقم الصادر *
              </label>
              <input
                type="text"
                value={formData.number || ''}
                onChange={(e) => handleInputChange('number', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="OUT-2024-001"
              />
              {errors.number && (
                <p className="text-red-500 text-sm mt-1">{errors.number}</p>
              )}
            </div>

            {/* تاريخ الإصدار */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                تاريخ الإصدار
              </label>
              <input
                type="date"
                value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('date', new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* قناة التسليم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Send className="h-4 w-4 inline mr-1" />
                قناة التسليم
              </label>
              <select
                value={formData.deliveryChannel || 'بريد'}
                onChange={(e) => handleInputChange('deliveryChannel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="بريد">بريد عادي</option>
                <option value="مراسل">مراسل</option>
                <option value="إيميل">بريد إلكتروني</option>
                <option value="بوابة">بوابة إلكترونية</option>
                <option value="فاكس">فاكس</option>
              </select>
            </div>
          </div>

          {/* الصف الثاني: المستلم والجهة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* اسم المستلم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                اسم المستلم *
              </label>
              <input
                type="text"
                value={formData.recipient || ''}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.recipient ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="اسم المستلم"
              />
              {errors.recipient && (
                <p className="text-red-500 text-sm mt-1">{errors.recipient}</p>
              )}
            </div>

            {/* الجهة المستلمة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1" />
                الجهة المستلمة
              </label>
              <input
                type="text"
                value={formData.recipientOrganization || ''}
                onChange={(e) => handleInputChange('recipientOrganization', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="اسم الجهة أو المؤسسة"
              />
            </div>
          </div>

          {/* موضوع المراسلة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              موضوع المراسلة *
            </label>
            <input
              type="text"
              value={formData.subject || ''}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="موضوع المراسلة"
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
            )}
          </div>

          {/* الصف الثالث: السرية والاستعجال والحالة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* مستوى السرية */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="h-4 w-4 inline mr-1" />
                مستوى السرية
              </label>
              <select
                value={formData.confidentiality || 'عادي'}
                onChange={(e) => handleInputChange('confidentiality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="عادي">عادي</option>
                <option value="سري">سري</option>
                <option value="سري جداً">سري جداً</option>
              </select>
            </div>

            {/* درجة الاستعجال */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                درجة الاستعجال
              </label>
              <select
                value={formData.urgency || 'عادي'}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="عادي">عادي</option>
                <option value="عاجل">عاجل</option>
                <option value="فوري">فوري</option>
              </select>
            </div>

            {/* الحالة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                الحالة
              </label>
              <select
                value={formData.status || 'مسودة'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="مسودة">مسودة</option>
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="بانتظار التوقيع">بانتظار التوقيع</option>
                <option value="صادر">صادر</option>
                <option value="مؤرشف">مؤرشف</option>
              </select>
            </div>
          </div>

          {/* الصف الرابع: الإدارة والقسم والموظف المعد */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* الإدارة المصدرة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1" />
                الإدارة المصدرة *
              </label>
              <select
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">اختر الإدارة</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
            </div>

            {/* القسم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القسم
              </label>
              <select
                value={formData.division || ''}
                onChange={(e) => handleInputChange('division', e.target.value)}
                disabled={!formData.department}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !formData.department ? 'bg-gray-100' : 'border-gray-300'
                }`}
              >
                <option value="">اختر القسم</option>
                {filteredDivisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>

            {/* الموظف المعد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                الموظف المعد *
              </label>
              <select
                value={formData.assignedTo || ''}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                disabled={!formData.department}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.assignedTo ? 'border-red-500' : !formData.department ? 'bg-gray-100' : 'border-gray-300'
                }`}
              >
                <option value="">اختر الموظف</option>
                {filteredEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>
              )}
            </div>
          </div>

          {/* الملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          {/* رفع المرفقات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="h-4 w-4 inline mr-1" />
              المرفقات
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">اسحب الملفات هنا أو انقر للاختيار</p>
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.png,.xlsx"
              />
            </div>
          </div>

        </div>

        {/* أزرار الإجراءات */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'جاري الحفظ...' : 'حفظ المراسلة'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OutgoingForm;