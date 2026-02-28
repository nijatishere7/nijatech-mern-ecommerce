// Hooks
import { useState, useEffect, useMemo } from "react";

// Icons
import {
  User,
  Lock,
  Mail,
  Bell,
  Edit3,
  Clock,
  Phone,
  LogOut,
  MapPin,
  Trash2,
  Package,
  Settings,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

// Redux
import { logout } from "@/redux/slices/authSlice";
import { setUser } from "@/redux/slices/authSlice";
import { clearCart } from "@/redux/slices/cartSlice";
import { useSelector, useDispatch } from "react-redux";

// Axios
import API from "@/api/axios";

// Toast
import toast from "react-hot-toast";

// Swal
import Swal from "sweetalert2";

// React Router
import { useNavigate, useLocation } from "react-router";

// Components
import { EditProfileModal } from ".";

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const [orders, setOrders] = useState([]);

  const [uploading, setUploading] = useState(false);

  const [loadingOrders, setLoadingOrders] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = useSelector((state) => state.cart.items);

  const { user } = useSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Yeni şifrələr uyğun gəlmir!");
    }

    try {
      await API.put("/auth/profile", {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
      });

      toast.success("Şifrəniz uğurla yeniləndi!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Xəta baş verdi");
    }
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      title: "Hesabınızı silmək istədiyinizə əminsiniz?",
      text: "Bu əməliyyat geri qaytarıla bilməz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Bəli, silinsin",
      cancelButtonText: "Xeyr",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const cartKey = `cart_${user._id}`;
          await API.delete("/auth/profile");

          dispatch(logout());
          dispatch(clearCart());
          localStorage.removeItem("userInfo");
          localStorage.removeItem(cartKey);
          toast.success("Hesabınız uğurla silindi.");
          navigate("/auth");
        } catch (error) {
          console.error("Silmə xətası:", error.response);
          toast.error(
            error.response?.data?.message || "Hesab silinərkən xəta baş verdi",
          );
        }
      }
    });
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Sifarişi ləğv etmək istəyirsiniz?",
      text: "Sifariş bazadan tamamilə silinəcək!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Bəli, ləğv et",
      cancelButtonText: "Vazkeç",
      customClass: {
        popup: "rounded-[30px]",
        confirmButton: "rounded-xl",
        cancelButton: "rounded-xl",
      },
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/orders/${orderId}`);
        setOrders(orders.filter((order) => order._id !== orderId));
        toast.success("Sifariş uğurla ləğv edildi");
      } catch (error) {
        toast.error(
          "Xəta baş verdi: " +
            (error.response?.data?.message || "Sifariş silinmədi"),
        );
      }
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const { data } = await API.put("/auth/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = { ...user, avatar: data.avatar };

      dispatch(setUser(updatedUser));
      toast.success("Profil şəkli yeniləndi!");
    } catch (error) {
      toast.error("Şəkil yüklənərkən xəta baş verdi");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    toast.success("Hesabdan çıxış edildi");
    navigate("/auth");
  };

  const handleSaveData = async (updatedData) => {
    try {
      const { data } = await API.put("/auth/profile", updatedData);

      dispatch(setUser(data));
      console.log(data);

      localStorage.setItem("userInfo", JSON.stringify(data));

      setIsModalOpen(false);
      toast.success("Məlumatlarınız uğurla yeniləndi!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Yenilənmə zamanı xəta baş verdi",
      );
    }
  };

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const { data } = await API.get("/orders/myorders");
        setOrders(data);
      } catch (error) {
        console.error("Sifarişlər yüklənərkən xəta:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) fetchMyOrders();
  }, [user]);

  const stats = useMemo(() => {
    return {
      totalOrders: orders.length,
      cartCount: cartItems.length,
      totalSpent: orders
        .filter((order) => order.status === "delivered")
        .reduce((acc, item) => acc + item.totalPrice, 0),
    };
  }, [orders, cartItems]);

  const sidebarLinks = [
    { id: "profile", name: "Profil Məlumatları", icon: User },
    { id: "orders", name: "Sifarişlərim", icon: Package },
    { id: "settings", name: "Tənzimləmələr", icon: Settings },
  ];

  if (!user) return <div className="py-20 text-center">Yüklənir...</div>;

  return (
    <div className="bg-[#f8faff] py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group w-24 h-24 mb-4">
                <div className="w-full h-full bg-purple-600 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-white font-bold">
                      {user?.name?.charAt(0)}
                    </span>
                  )}
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Edit3 className="text-white" size={24} />
                </label>

                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  onChange={handleAvatarChange}
                  accept="image/*"
                />

                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              {sidebarLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full flex items-center gap-3 p-2.5 text-sm rounded-xl font-medium transition-all ${
                    activeTab === link.id
                      ? "bg-purple-50 text-purple-600"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <link.icon size={20} />
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={
                      activeTab === link.id ? "opacity-100" : "opacity-30"
                    }
                  />
                </button>
              ))}

              <div className="h-px bg-gray-100 my-4"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 text-sm p-2 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} /> Çıxış
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative">
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1.5 border border-blue-400 text-purple-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-all"
              >
                <Edit3 size={16} />{" "}
                <span className="hidden sm:block">Redaktə et</span>
              </button>

              <h2 className="text-2xl font-bold text-slate-900 mb-8">
                Şəxsi məlumatlar
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Ad və Soyad
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500"
                      size={18}
                    />
                    <input
                      readOnly
                      value={user.name}
                      className="w-full pl-12 pr-4 py-3.5 font-medium bg-gray-50/50 border border-gray-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
                      size={18}
                    />
                    <input
                      readOnly
                      value={user.email}
                      className="w-full pl-12 pr-4 py-3.5 font-medium bg-gray-50/50 border border-gray-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Telefon
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500"
                      size={18}
                    />
                    <input
                      readOnly
                      value={user.phone || "Qeyd edilməyib"}
                      className="w-full pl-12 pr-4 py-3.5 font-medium bg-gray-50/50 border border-gray-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Ünvan
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                      size={18}
                    />
                    <input
                      readOnly
                      value={user.address || "Qeyd edilməyib"}
                      className="w-full pl-12 pr-4 py-3.5 font-medium bg-gray-50/50 border border-gray-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>

              <EditProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={user}
                onSave={handleSaveData}
              />

              <div className="mt-12">
                <h3 className="text-lg font-bold text-slate-800 mb-6">
                  Statistika
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-purple-200 p-6 rounded-2xl border border-purple-100">
                    <p className="text-2xl font-bold text-purple-600 mb-2">
                      {stats.totalOrders}
                    </p>
                    <p className="text-sm font-semibold text-gray-500">
                      Ümumi sifariş
                    </p>
                  </div>

                  <div className="bg-blue-200 p-6 rounded-2xl border border-blue-100">
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {stats.cartCount}
                    </p>
                    <p className="text-sm font-semibold text-gray-500">
                      Səbətdə məhsul
                    </p>
                  </div>

                  <div className="bg-green-200 p-6 rounded-2xl border border-green-100">
                    <p className="text-2xl font-bold text-green-600 mb-2">
                      {stats.totalSpent} AZN
                    </p>
                    <p className="text-sm font-semibold text-gray-500">
                      Ümumi xərc
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              {loadingOrders ? (
                <p>Sifarişlər yüklənir...</p>
              ) : orders.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl text-center border border-dashed border-gray-200">
                  <Package className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-medium">
                    Hələ heç bir sifarişiniz yoxdur.
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-50 w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                          {order.orderItems && order.orderItems[0]?.image ? (
                            <img
                              src={order.orderItems[0].image}
                              alt={order.orderItems[0].name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                            Sifariş kodu
                          </p>
                          <p className="font-bold text-slate-900">
                            #{order._id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-18">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                            Tarix
                          </p>
                          <p className="font-semibold text-slate-700">
                            {new Date(order.createdAt).toLocaleDateString(
                              "az-AZ",
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                            Məbləğ
                          </p>
                          <p className="font-bold text-blue-600">
                            {order.totalPrice} AZN
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === "delivered" ? (
                          <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-4 py-2 rounded-full text-xs font-bold">
                            <CheckCircle2 size={14} /> Çatdırıldı
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold">
                            <Clock size={14} />{" "}
                            {order.status === "processing"
                              ? "Hazırlanır"
                              : "Yoldadır"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <p className="text-sm text-gray-500 font-medium max-w-md">
                        Məhsul:{" "}
                        <span className="text-slate-900 font-semibold">
                          {order.orderItems.map((item) => item.name).join(", ")}
                        </span>
                      </p>

                      {order.status !== "delivered" && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={14} />
                          Sifarişi ləğv et
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}

              <div className="flex justify-end">
                <div className="w-full md:w-100 min-h-22 h-auto md:h-22 bg-blue-600 rounded-4xl px-6 py-6 md:py-0 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-slate-200">
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="bg-green-600 p-4 rounded-2xl shadow-lg shadow-green-500/20">
                      <ShoppingBag size={16} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                        Ümumi Məbləğ
                      </p>
                      <h3 className="text-lg tracking-wider font-bold">
                        {orders.reduce((acc, curr) => acc + curr.totalPrice, 0)}{" "}
                        <span className="text-xs font-medium text-slate-400">
                          AZN
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="text-center md:text-right w-full md:w-auto border-t border-white/10 md:border-none pt-4 md:pt-0">
                    <p className="text-slate-400 text-xs font-medium mb-1">
                      Cəmi Sifariş Sayı
                    </p>
                    <p className="text-sm font-bold">{orders.length} Ədəd</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
                    <Lock size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Şifrəni Dəyişdir
                    </h3>
                    <p className="text-sm text-gray-500">
                      Hesabınızın təhlükəsizliyi üçün mütəmadi olaraq şifrənizi
                      yeniləyin.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleChangePassword}
                  className="max-w-md space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                      Cari Şifrə
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                        Yeni Şifrə
                      </label>
                      <input
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                        Təkrar Yeni Şifrə
                      </label>
                      <input
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    Şifrəni Yenilə
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                    <Bell size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Bildiriş Tənzimləmələri
                    </h3>
                    <p className="text-sm text-gray-500">
                      Hansı məlumatları almaq istədiyinizi seçin.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Sifariş statusu",
                      desc: "Sifarişiniz yola çıxdıqda və ya çatdırıldıqda bildiriş al",
                      defaultChecked: true,
                    },
                    {
                      title: "Kampaniyalar",
                      desc: "Yeni endirimlər və özəl təkliflər barədə məlumat al",
                      defaultChecked: false,
                    },
                    {
                      title: "E-poçt bülleteni",
                      desc: "Həftəlik ən çox satılan məhsullar barədə email al",
                      defaultChecked: true,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={item.defaultChecked}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
                <div className="flex items-center gap-3 mb-4">
                  <Trash2 className="text-red-500" size={22} />
                  <h3 className="text-lg font-bold text-red-700">
                    Təhlükəli Zona
                  </h3>
                </div>
                <p className="text-red-600/70 text-sm font-medium mb-6 max-w-xl">
                  Hesabınızı sildiyiniz təqdirdə bütün sifariş tarixçəniz və
                  fərdi məlumatlarınız sistemdən həmişəlik silinəcək. Bu
                  əməliyyat geri qaytarıla bilməz.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-white text-red-600 border border-red-200 px-6 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
                >
                  Hesabımı sil
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
