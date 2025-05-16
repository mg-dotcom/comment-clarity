# increase_memory.py
import os
import sys
import importlib

# เพิ่มค่า MAX_BUFFER_SIZE สำหรับ IPython/Jupyter
def increase_notebook_memory():
    try:
        # พยายามโหลด IPython config
        ipython = importlib.import_module('IPython')
        ipy = ipython.get_ipython()
        
        # ตั้งค่า max_buffer_size ถ้าเป็นไปได้
        if ipy is not None:
            print("กำลังเพิ่มค่า max_buffer_size สำหรับ Jupyter/IPython...")
            ipy.config.NotebookApp.max_buffer_size = 12 * 1024 * 1024 * 1024  # 12 GB
            print("เพิ่มค่า buffer size เป็น 12 GB เรียบร้อย!")
        else:
            print("ไม่พบ IPython session ที่กำลังทำงาน")
    except:
        print("ไม่สามารถเพิ่มค่า max_buffer_size ได้ จะลองวิธีอื่น...")
    
    # ลองเพิ่มหน่วยความจำโดยการตั้งค่า environment variables
    try:
        # กำหนดค่า environment variables สำหรับ Node.js (ถ้า Jupyter ใช้ Node)
        os.environ["NODE_OPTIONS"] = "--max-old-space-size=4096"
        print("ตั้งค่า NODE_OPTIONS เพื่อเพิ่มหน่วยความจำ")
        
        # เพิ่ม limit ของ Python recursion
        sys.setrecursionlimit(3000)
        print("เพิ่มค่า recursion limit เป็น 3000")
    except:
        print("ไม่สามารถตั้งค่า environment variables ได้")
    
    print("การตั้งค่าเสร็จสมบูรณ์! คุณควรรีสตาร์ท kernel เพื่อให้การเปลี่ยนแปลงมีผล")

# เรียกใช้ฟังก์ชั่น
if __name__ == "__main__":
    increase_notebook_memory()
    print("\nเพิ่มหน่วยความจำเรียบร้อย! กรุณารีสตาร์ท Jupyter Notebook/Kernel")