import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { User as UserIcon, Camera, Save, CheckCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { updateUser } = useData();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateUser({
        ...user,
        name,
        avatarUrl
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <img 
                src={avatarUrl || `https://ui-avatars.com/api/?name=${name}&background=random`} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-white object-cover bg-white"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Camera size={24} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
              <p className="text-slate-500 font-medium">{user?.role} Portal</p>
            </div>
            {saved && (
              <div className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl animate-bounce">
                <CheckCircle size={18} className="mr-2" /> Saved
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition font-semibold"
                    placeholder="Your Full Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Profile Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition font-semibold text-sm"
                  placeholder="https://..."
                />
                <p className="text-[10px] text-slate-400 mt-2">You can also click the profile circle above to upload a file.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button 
                type="submit" 
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition flex items-center justify-center"
              >
                <Save size={20} className="mr-2" /> Update Profile Settings
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
        <h3 className="font-black text-emerald-800 mb-2">Account Privacy</h3>
        <p className="text-sm text-emerald-700 leading-relaxed">
          Your profile image and display name are visible to school administrators and coaches. Ensure your information is professional and accurate.
        </p>
      </div>
    </div>
  );
};

export default Profile;