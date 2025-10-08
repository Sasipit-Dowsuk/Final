import { useEffect, useState } from "react";

type MenuItem = {
  id: string;
  menuName: string;
  menuPrice: number;
  menuCategory: string;
  menuAvailable: boolean;
};

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMenu, setNewMenu] = useState({
    menuName: "",
    menuPrice: 0,
    menuCategory: "",
    menuAvailable: true,
  });

  const API_URL = "http://localhost:3000/api/menu";

  //Retrieve ดึงข้อมูล
  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      //data มาเก็บใน menuItems
      setMenuItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  //Insert
  const addMenu = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMenu),
      });
      const data = await res.json();
      setMenuItems([...menuItems, data]);
      setNewMenu({ menuName: "", menuPrice: 0, menuCategory: "", menuAvailable: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteMenu = async (id: string) => {
    if (!confirm("คุณต้องการลบเมนูนี้ใช่หรือไม่?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      //ส่งคำขอลบไปยัง API เพื่อลบข้อมูลในฐานข้อมูล
      setMenuItems(menuItems.filter(item => item.id !== id));
      //ลบออกจาก state ด้วย filter
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleAvailable = async (id: string, current: boolean) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuAvailable: !current }),
      });
      setMenuItems(menuItems.map(item => item.id === id ? { ...item, menuAvailable: !current } : item));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center mt-20">กำลังโหลด...</div>;
  if (error) return <div className="text-center text-red-500 mt-20">Error: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">เมนูร้านกาแฟ</h1>

      {/* Form เพิ่มเมนู */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="border rounded p-2 flex-1"
          placeholder="ชื่อเมนู"
          value={newMenu.menuName}
          onChange={e => setNewMenu({ ...newMenu, menuName: e.target.value })}
        />
        <input
          className="border rounded p-2 w-32"
          type="number"
          placeholder="ราคา"
          value={newMenu.menuPrice}
          onChange={e => setNewMenu({ ...newMenu, menuPrice: Number(e.target.value) })}
        />
        <input
          className="border rounded p-2 w-32"
          placeholder="ประเภท"
          value={newMenu.menuCategory}
          onChange={e => setNewMenu({ ...newMenu, menuCategory: e.target.value })}
        />
        <button
          onClick={addMenu}
          className="bg-green-500 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
        >
          เพิ่มเมนู
        </button>
      </div>

      {/* ตารางเมนู */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-black">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">ชื่อเมนู</th>
              <th className="px-6 py-3 text-left">ราคา</th>
              <th className="px-6 py-3 text-left">ประเภท</th>
              <th className="px-6 py-3 text-left">สถานะ</th>
              <th className="px-6 py-3 text-left">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  --ไม่มีเมนูในร้าน--
                </td>
              </tr>
            ) : (
              menuItems.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50 text-black">
                  <td className="px-6 py-3">{item.menuName}</td>
                  <td className="px-6 py-3">{item.menuPrice} บาท</td>
                  <td className="px-6 py-3">{item.menuCategory}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        item.menuAvailable ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {item.menuAvailable ? "พร้อมขาย" : "หมด"}
                    </span>
                  </td>
                  <td className="px-6 py-3 space-x-2">
                    <button
                      onClick={() => toggleAvailable(item.id, item.menuAvailable)}
                      className="bg-yellow-400 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      สลับสถานะ
                    </button>
                    <button
                      onClick={() => deleteMenu(item.id)}
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
      </div>
    </div>
  );
}
