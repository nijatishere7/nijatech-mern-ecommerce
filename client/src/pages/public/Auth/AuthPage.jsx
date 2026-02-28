// Hooks
import { useState, useEffect } from "react";

// React Router
import { useNavigate, Link } from "react-router";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { loadUserCart } from "@/redux/slices/cartSlice";
import { setCredentials } from "@/redux/slices/authSlice";

// Axios
import API from "@/api/axios";

// Icons
import {
  Eye,
  Mail,
  Lock,
  User,
  EyeOff,
  Loader2,
  UserPlus,
  ArrowRight,
} from "lucide-react";

// Toast
import toast from "react-hot-toast";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { isAuthenticated } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Şifrələr üst-üstə düşmür!");
      }
      if (formData.password.length < 6) {
        return toast.error("Şifrə ən az 6 simvoldan ibarət olmalıdır!");
      }
    }

    setLoading(true);
    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    try {
      const { data } = await API.post(
        endpoint,
        isLogin
          ? { email: formData.email, password: formData.password }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
            },
      );

      dispatch(
        setCredentials({
          user: data,
          token: data.token,
        }),
      );

      dispatch(loadUserCart());

      toast.success(`Xoş gəldiniz, ${data.name}!`);
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Əməliyyat zamanı xəta baş verdi",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[40px] border border-gray-200 shadow-2xl shadow-blue-50 transition-all duration-500">
        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Daxil Ol
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${!isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Qeydiyyat
          </button>
        </div>

        <div className="text-center">
          {!isLogin && (
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-4">
              <UserPlus size={24} />
            </div>
          )}
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isLogin ? "Yenidən xoş gördük!" : "Hesab Yaradın"}
          </h2>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="relative group">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                Ad Soyad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-4 text-sm bg-gray-100 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                  placeholder="Nicat Allahverdiyev"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="relative group">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-12 pr-4 py-4 text-sm bg-gray-100 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="relative group">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1 block">
                Şifrə
              </label>
              {isLogin && (
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Şifrəni unutmusan?
                </Link>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full pl-12 pr-12 py-4 text-sm bg-gray-100 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="relative group">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                Şifrə Təkrarı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-12 pr-4 py-4 text-sm bg-gray-100 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-2xl text-base font-bold text-white bg-slate-900 hover:bg-blue-500 transition-all shadow-xl shadow-slate-100 active:scale-[0.98] disabled:opacity-70 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? "Daxil Ol" : "Qeydiyyatı Tamamla"}
                <ArrowRight
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
