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

  // State สำหรับการแก้ไข
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // ✅ โหลดข้อมูลเมนูทั้งหมด
  const fetchMenu = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/menu`);
      if (!res.ok) throw new Error(`โหลดข้อมูลล้มเหลว: ${res.status}`);
      const data = await res.json();
      setMenuItems(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // ✅ เพิ่มเมนูใหม่
  const addMenu = async () => {
    try {
      if (!newMenu.menuName || newMenu.menuPrice <= 0 || !newMenu.menuCategory) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วนและราคาต้องมากกว่า 0");
        return;
      }
      const res = await fetch(`http://localhost:3000/api/menu`, {
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

  // ✅ ลบเมนู
  const deleteMenu = async (id: string) => {
    if (!confirm("คุณต้องการลบเมนูนี้ใช่หรือไม่?")) return;
    try {
      await fetch(`http://localhost:3000/api/menu/${id}`, { method: "DELETE" });
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ✅ สลับสถานะเมนู (พร้อมขาย/หมด)
  const toggleAvailable = async (id: string, current: boolean) => {
    try {
      await fetch(`http://localhost:3000/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuAvailable: !current }),
      });
      setMenuItems(menuItems.map(item => item.id === id ? { ...item, menuAvailable: !current } : item));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ✅ ฟังก์ชันแก้ไขข้อมูลเมนู (Full Update)
  const updateMenu = async () => {
    if (!editingItem) return;

    try {
      if (!editingItem.menuName || editingItem.menuPrice <= 0 || !editingItem.menuCategory) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วนและราคาต้องมากกว่า 0");
        return;
      }

      const res = await fetch(`http://localhost:3000/api/menu/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      if (!res.ok) throw new Error("การอัปเดตล้มเหลว");

      setMenuItems(menuItems.map(item =>
        item.id === editingItem.id ? editingItem : item
      ));
      setEditingItem(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ✅ แสดงผลหน้าเว็บ
  if (loading) return <div className="text-center mt-20">กำลังโหลด...</div>;
  if (error) return <div className="text-center text-red-500 mt-20">Error: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">เมนูร้านกาแฟ</h1>

      {/* ฟอร์มเพิ่มเมนู */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3 text-black">เพิ่มเมนูใหม่</h2>
        <div className="flex flex-wrap gap-3">
          <input
            className="border rounded p-2 flex-1 text-black"
            placeholder="ชื่อเมนู"
            value={newMenu.menuName}
            onChange={e => setNewMenu({ ...newMenu, menuName: e.target.value })}
          />
          <input
            className="border rounded p-2 w-32 text-black"
            type="number"
            placeholder="ราคา"
            value={newMenu.menuPrice}
            onChange={e => setNewMenu({ ...newMenu, menuPrice: Number(e.target.value) })}
          />
          <input
            className="border rounded p-2 w-32 text-black"
            placeholder="ประเภท"
            value={newMenu.menuCategory}
            onChange={e => setNewMenu({ ...newMenu, menuCategory: e.target.value })}
          />
          <button
            onClick={addMenu}
            className="bg-green-500 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition duration-200"
          >
            เพิ่มเมนู
          </button>
        </div>
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
                  <td className="px-6 py-3 space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => toggleAvailable(item.id, item.menuAvailable)}
                      className="bg-yellow-400 hover:bg-yellow-600 text-white px-3 py-1 rounded transition duration-200"
                    >
                      สลับสถานะ
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => deleteMenu(item.id)}
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded transition duration-200"
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

      {/* Modal แก้ไขเมนู */}
      {editingItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-black">แก้ไขเมนู: {editingItem.menuName}</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700">ชื่อเมนู</span>
                <input
                  className="mt-1 block w-full border rounded p-2 text-black"
                  value={editingItem.menuName}
                  onChange={e => setEditingItem({ ...editingItem, menuName: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700">ราคา</span>
                <input
                  className="mt-1 block w-full border rounded p-2 text-black"
                  type="number"
                  value={editingItem.menuPrice}
                  onChange={e => setEditingItem({ ...editingItem, menuPrice: Number(e.target.value) })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700">ประเภท</span>
                <input
                  className="mt-1 block w-full border rounded p-2 text-black"
                  value={editingItem.menuCategory}
                  onChange={e => setEditingItem({ ...editingItem, menuCategory: e.target.value })}
                />
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingItem.menuAvailable}
                  onChange={e => setEditingItem({ ...editingItem, menuAvailable: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">พร้อมขาย</span>
              </label>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingItem(null)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded transition duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={updateMenu}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded transition duration-200"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
