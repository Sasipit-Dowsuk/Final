import express from 'express'; //สร้าง web server
import cors from 'cors'; //อนุญาตให้ React frontend เรียก API นี้ข้ามโดเมนได้

import admin from 'firebase-admin'; 
import serviceAccount from './firebase/final-29d3a-firebase-adminsdk-fbsvc-dbca0dbc97.json' with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

const menuCollection = db.collection('menu');

// Retrieve all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const snapshot = await menuCollection.get(); //ดึงเอกสารทั้งหมดใน collection
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insert new menu item
app.post('/api/menu', async (req, res) => {
  try {
    const data = req.body;
    const docRef = await menuCollection.add(data); //ใช้ menuCollection.add(data) เพิ่มข้อมูลใหม่ใน Firestore
    res.json({ id: docRef.id, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a menu item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await menuCollection.doc(id).update(data);
    res.json({ id, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a menu item
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await menuCollection.doc(id).delete();
    res.json({ message: 'Deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
