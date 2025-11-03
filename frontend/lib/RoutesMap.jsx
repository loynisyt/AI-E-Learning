import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/app/dashboard/page';
import Courses from '@/pages/Courses';
import MyLearning from '@/pages/MyLearning';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

export default function RoutesMap() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/my-learning" element={<MyLearning />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
