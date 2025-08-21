import React from 'react';
import { 
  Award, 
  TrendingUp, 
  Star, 
  Trophy, 
  Medal,
  Target,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * مكون أفضل الموظفين
 * يعرض ترتيب الموظفين حسب النقاط والأداء
 */
const TopPerformers: React.FC = () => {
  const { state } = useApp();

  // حساب أفضل الموظفين من البيانات الفعلية
  const topPerformersData = React.useMemo(() => {
    if (!state.employees || state.employees.length === 0) {
      return [];
    }
    
    return state.employees
      .map(emp => {
        const empTasks = (state.tasks || []).filter(t => 
          t.assignedTo && t.assignedTo.includes(emp.id)
        );
        const completedTasks = empTasks.filter(t => t.status === 'مكتملة');
        const department = (state.departments || []).find(d => d.id === emp.department);
        const division = (state.divisions || []).find(d => d.id === emp.division);
        
        return {
          id: emp.id,
          name: emp.name,
          department: department?.name || emp.department,
          division: division?.name || emp.division,
          points: emp.points,
          completedTasks: completedTasks.length,
          averageTime: 2.5, // يمكن حسابه من تواريخ المهام
          rank: 0, // سيتم تحديده بعد الترتيب
          trend: 'up' as const
        };
      })
      .filter(emp => emp.points > 0) // إظهار الموظفين الذين لديهم نقاط فقط
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map((emp, index) => ({ ...emp, rank: index + 1 }));
  }, [state.employees, state.tasks, state.departments, state.divisions]);
  
  /**
   * دالة الحصول على أيقونة الترتيب
   * @param rank ترتيب الموظف
   */
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return <Star className="h-5 w-5 text-blue-500" />;
    }
  };

  /**
   * دالة الحصول على لون الترتيب
   * @param rank ترتيب الموظف
   */
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  /**
   * دالة الحصول على أيقونة الاتجاه
   * @param trend اتجاه الأداء
   */
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  // حساب الإحصائيات الإضافية
  const additionalStats = React.useMemo(() => {
    if (state.employees.length === 0) {
      return { avgPoints: 0, avgTasks: 0, avgTime: '0' };
    }
    
    const totalPoints = state.employees.reduce((sum, e) => sum + e.points, 0);
    const avgPoints = state.employees.length > 0 ? Math.round(totalPoints / state.employees.length) : 0;
    const avgTasks = topPerformersData.length > 0 
      ? Math.round(topPerformersData.reduce((sum, p) => sum + p.completedTasks, 0) / topPerformersData.length)
      : 0;
    const avgTime = topPerformersData.length > 0
      ? (topPerformersData.reduce((sum, p) => sum + p.averageTime, 0) / topPerformersData.length).toFixed(1)
      : '0';

    return { avgPoints, avgTasks, avgTime };
  }, [state.employees, topPerformersData]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">لوحة شرف الموظفين</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Award className="h-4 w-4 mr-1" />
          <span 
            onClick={() => actions.setCurrentPage('employees')} 
            className="cursor-pointer hover:text-blue-600 transition-colors"
          >
            أفضل 5 موظفين - عرض المزيد
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {topPerformersData.length > 0 ? topPerformersData.map((performer) => (
          <div 
            key={performer.id}
            className={`relative p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md ${
              performer.rank === 1 
                ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' 
                : performer.rank === 2
                ? 'border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50'
                : performer.rank === 3
                ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-red-50'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            
            {/* شارة الترتيب */}
            <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${getRankColor(performer.rank)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
              {performer.rank}
            </div>

            <div className="flex items-center justify-between">
              
              {/* معلومات الموظف */}
              <div className="flex items-center space-x-4 space-x-reverse">
                
                {/* الصورة الرمزية */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {performer.name.charAt(0)}
                </div>
                
                {/* التفاصيل */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{performer.name}</h4>
                    {getRankIcon(performer.rank)}
                    {getTrendIcon(performer.trend)}
                  </div>
                  <p className="text-sm text-gray-600">{performer.department}</p>
                  <p className="text-xs text-gray-500">{performer.division}</p>
                </div>
              </div>

              {/* الإحصائيات */}
              <div className="text-left space-y-1">
                
                {/* النقاط */}
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold text-lg text-gray-900">{performer.points}</span>
                  <span className="text-xs text-gray-500">نقطة</span>
                </div>
                
                {/* المهام المكتملة */}
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{performer.completedTasks} مهمة</span>
                </div>
                
                {/* متوسط الوقت */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-700">{performer.averageTime} يوم</span>
                </div>
              </div>

            </div>

            {/* شريط التقدم للنقاط */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>التقدم نحو الهدف</span>
                <span>{Math.round((performer.points / 1000) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getRankColor(performer.rank)}`}
                  style={{ width: `${Math.min((performer.points / 1000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

          </div>
        )) : (
          <div className="text-center py-8 text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>لا توجد بيانات أداء لعرضها</p>
          </div>
        )}
      </div>

      {/* إحصائيات إضافية */}
      {topPerformersData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{additionalStats.avgPoints}</div>
            <div className="text-xs text-blue-800">متوسط النقاط</div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{additionalStats.avgTasks}</div>
            <div className="text-xs text-green-800">متوسط المهام</div>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{additionalStats.avgTime}</div>
            <div className="text-xs text-purple-800">متوسط الوقت</div>
          </div>

        </div>
        </div>
      )}

    </div>
  );
};

export default TopPerformers;
