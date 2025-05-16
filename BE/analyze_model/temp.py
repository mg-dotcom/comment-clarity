# scrap
from selenium import  webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import time, re
import bs4
import pandas as pd
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from dateutil.relativedelta import relativedelta

# model sentiment
from sklearn.preprocessing import LabelEncoder
import emoji
from pythainlp.tokenize import word_tokenize
from pythainlp.corpus import thai_words
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
import joblib
from xgboost import XGBClassifier


def analyze(link_url, start_date, end_date):
    # ใช้ URL ที่ได้รับจากพารามิเตอร์แทนการใช้ URL ตายตัว
    url = link_url
    
    def open_driver():
        options = Options()
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option("useAutomationExtension", False)
        options.add_argument("--headless")  # เพิ่ม headless mode เพื่อประสิทธิภาพ
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")  # แก้ปัญหาหน่วยความจำใน Docker
        options.add_argument("--disable-gpu")     # ปิด GPU acceleration
        options.add_argument("--enable-unsafe-swiftshader")  # ใช้ SwiftShader สำหรับการเรนเดอร์

        try:
            driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
            return driver
        except Exception as e:
            print(f"❌ เกิดข้อผิดพลาดในการเริ่มต้น driver: {e}")
            return None

    # ใช้พารามิเตอร์ที่รับเข้ามาแทนการใช้ค่าตายตัว
    try:
        # ตรวจสอบรูปแบบวันที่และปรับให้เป็นรูปแบบมาตรฐาน (YYYY-MM)
        start_period = start_date
        if len(start_period.split('-')[1]) == 1:  # เช่น 2025-5
            month = start_period.split('-')[1].zfill(2)
            start_period = f"{start_period.split('-')[0]}-{month}"
            
        end_period = end_date
        if len(end_period.split('-')[1]) == 1:  # เช่น 2025-5
            month = end_period.split('-')[1].zfill(2)
            end_period = f"{end_period.split('-')[0]}-{month}"
            
        print(f"🔄 กำหนดช่วงเวลา: {start_period} ถึง {end_period}")
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการปรับรูปแบบวันที่: {e}")
        # กำหนดค่าเริ่มต้นในกรณีเกิดข้อผิดพลาด
        start_period = "2025-5"
        end_period = "2025-05"


    # แปลง start_period เป็น datetime แล้วลบ 1 เดือน
    try:
        start_dt = datetime.strptime(start_period, "%Y-%m")
        stop_dt = start_dt - relativedelta(months=1)
        # แปลงกลับเป็น string ในรูปแบบ YYYY-MM
        stop_period = stop_dt.strftime("%Y-%m")
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการคำนวณช่วงเวลา: {e}")
        # กรณีเกิดข้อผิดพลาด กำหนดค่าเริ่มต้น
        stop_period = "2025-04"  # ย้อนหลัง 1 เดือนจาก 2025-05

        next_button = "/html/body/div[5]/div/div[10]/div[1]/div[2]/div/div/div/div[3]/div[2]/div/button[2]" #ปุ่มหน้าถัดไป
        sort_button_xpath = "/html/body/div[5]/div/div[10]/div[1]/div[2]/div/div/div/div[2]/div/div[2]" #ปุ่มเรียงลำดับ
        newest_first_option_xpath = "/html/body/div[9]/div/div/ul/li[2]" #ปุ่มเรียงจากล่าสุด
        
    # ฟังก์ชันเลื่อนหน้า (fix lazy loading)
    def scroll_to_bottom(driver):
        try:
            prev_height = 0
            max_attempts = 5  # กำหนดจำนวนครั้งสูงสุดในการเลื่อน
            attempts = 0
            
            while attempts < max_attempts:
                driver.execute_script("window.scrollBy(0, 1000);")
                time.sleep(1)
                new_height = driver.execute_script("return window.scrollY + window.innerHeight")
                page_height = driver.execute_script("return document.body.scrollHeight")
                if new_height >= page_height:
                    break
                attempts += 1
        except Exception as e:
            print(f"❌ เกิดข้อผิดพลาดในการเลื่อนหน้า: {e}")

    #click element with better error handling
    def click_element(driver, xpath, max_attempts=3):
        attempts = 0
        while attempts < max_attempts:
            try:
                element = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, xpath)))
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
                driver.execute_script("arguments[0].click();", element)
                time.sleep(1)
                return True
            except Exception as e:
                print(f"❌ ไม่สามารถคลิกที่ xpath {xpath}: {e}")
                attempts += 1
                time.sleep(1)
        
        return False

    # เริ่มต้นเบราว์เซอร์
    driver = open_driver()
    if not driver:
        print("❌ ไม่สามารถเริ่มต้นเบราว์เซอร์ได้")
        return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])
    
    try:
        driver.get(url)
        time.sleep(3)
        scroll_to_bottom(driver)  # Scroll เพื่อให้ element โหลด
    except Exception as e:
        print(f"❌ ไม่สามารถเปิด URL ได้: {e}")
        driver.quit()
        return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])

    max_attempts = 3
    attempts = 0
    sort_button_found = False
    
    while attempts < max_attempts and not sort_button_found:
        try:
            # รอให้ปุ่ม Sort ปรากฏ
            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, sort_button_xpath)))
            print("✅ เจอปุ่ม Sort")
            sort_button_found = True
        except Exception as e:
            print(f"❌ ไม่เจอปุ่ม Sort (พยายามครั้งที่ {attempts+1}/{max_attempts}): {e}")
            driver.quit()  # ปิด driver
            driver = open_driver()  # เปิด driver ใหม่
            if not driver:
                print("❌ ไม่สามารถเริ่มต้นเบราว์เซอร์ได้")
                return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])
            
            driver.get(url)
            time.sleep(3)
            scroll_to_bottom(driver)
            attempts += 1
    
    if not sort_button_found:
        print("❌ ไม่สามารถค้นหาปุ่ม Sort ได้หลังจากพยายามหลายครั้ง")
        driver.quit()
        return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])

    # คลิกปุ่มเรียงลำดับและเลือกล่าสุด
    if not click_element(driver, sort_button_xpath):
        print("❌ ไม่สามารถคลิกปุ่ม Sort ได้")
        driver.quit()
        return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])
    
    if not click_element(driver, newest_first_option_xpath):
        print("❌ ไม่สามารถคลิกตัวเลือกล่าสุดได้")
        driver.quit()
        return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])

    thai_months = {"ม.ค.": "01", "ก.พ.": "02", "มี.ค.": "03", "เม.ย.": "04", "พ.ค.": "05", "มิ.ย.": "06", 
                  "ก.ค.": "07", "ส.ค.": "08", "ก.ย.": "09", "ต.ค.": "10", "พ.ย.": "11", "ธ.ค.": "12"}

    def to_full_date(text):
        try:
            now = datetime.now()
            if "ชั่วโมง" in text:
                hours = int(re.search(r'\d+', text).group()) if re.search(r'\d+', text) else 1
                dt = now - timedelta(hours=hours)
            elif "วัน" in text:
                days = int(re.search(r'\d+', text).group()) if re.search(r'\d+', text) else 1
                dt = now - timedelta(days=days)
            elif "สัปดาห์" in text:
                weeks = int(re.search(r'\d+', text).group()) if re.search(r'\d+', text) else 1
                dt = now - timedelta(weeks=weeks)
            elif "นาที" in text:
                minutes = int(re.search(r'\d+', text).group()) if re.search(r'\d+', text) else 1
                dt = now - timedelta(minutes=minutes)
            elif "วินาที" in text:
                seconds = int(re.search(r'\d+', text).group()) if re.search(r'\d+', text) else 1
                dt = now - timedelta(seconds=seconds)
            else:
                parts = text.split()
                if len(parts) == 3:
                    day = parts[0]
                    month = thai_months.get(parts[1], None)
                    year = parts[2]
                    if month:
                        date_str = f"{year}-{month}-{day.zfill(2)}"
                        try:
                            dt = datetime.strptime(date_str, "%Y-%m-%d")
                            return dt.strftime("%Y-%m-%d")
                        except:
                            return None
                return None
            return dt.strftime("%Y-%m-%d")
        except Exception as e:
            print(f"❌ เกิดข้อผิดพลาดในการแปลงวันที่: {e}")
            return None

    def is_within_period(month_year, start_period, end_period):
        # เช็คว่าวันที่อยู่ในช่วงที่ต้องการหรือไม่ (รวมถึงเดือนที่ระบุ)
        return start_period <= month_year <= end_period

    def click_next_button():
        try:
            next_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, "/html/body/div[5]/div/div[10]/div[1]/div[2]/div/div/div/div[3]/div[2]/div/button[2]"))
            )
            driver.execute_script("arguments[0].click();", next_button)
            time.sleep(2)
            return True
        except Exception as e:
            print(f"❌ ไม่สามารถคลิกปุ่มหน้าถัดไปได้: {e}")
            return False

    all_reviews = []
    print("🔄 เริ่มดึงรีวิว...")

    max_pages = 100  # กำหนดจำนวนหน้าสูงสุดที่จะดึงข้อมูล เพื่อป้องกัน infinite loop
    page_count = 0
    
    # ตัวแปรควบคุมเพื่อเช็คว่าพบรีวิวในเดือนที่ต้องการหรือไม่
    found_target_month = False
    # ตัวแปรสำหรับเช็คว่าหมดรีวิวของเดือนที่ต้องการหรือยัง
    past_target_period = False
    
    while page_count < max_pages:
        page_count += 1
        print(f"📄 กำลังดึงข้อมูลจากหน้าที่ {page_count}")
        
        try:
            soup = BeautifulSoup(driver.page_source, "html.parser")
            date_spans = soup.find_all("span", class_="title right")

            if not date_spans:
                print("❌ ไม่พบข้อมูลวันที่บนหน้านี้")
                break

            reviews_found_on_page = False
            date_to_review_map = []

            # หารีวิวและเก็บเป็นคู่กับวันที่
            content_divs = [
                content
                for item in soup.find_all('div', class_='item-content')
                if item.get('class') == ['item-content']
                for content in item.find_all('div', class_='content')
            ]
            
            star_divs = soup.find_all('div', class_='container-star starCtn left')
            
            # ตรวจสอบว่ามีรีวิว content และ star_divs เท่ากันหรือไม่
            if len(content_divs) != len(star_divs) or len(content_divs) != len(date_spans):
                print(f"⚠️ จำนวนองค์ประกอบไม่ตรงกัน: Content: {len(content_divs)}, Stars: {len(star_divs)}, Dates: {len(date_spans)}")
                # ใช้จำนวนที่น้อยที่สุด
                min_length = min(len(content_divs), len(star_divs), len(date_spans))
                content_divs = content_divs[:min_length]
                star_divs = star_divs[:min_length]
                date_spans = date_spans[:min_length]

            # สร้างลิสต์ของรีวิวพร้อมข้อมูลที่จำเป็น
            reviews_data = []
            for idx, (content_div, star_div, date_span) in enumerate(zip(content_divs, star_divs, date_spans)):
                raw_text = content_div.get_text(strip=True)
                raw_date = date_span.get_text(strip=True)
                
                full_date = to_full_date(raw_date)
                if not full_date:
                    continue
                
                month_year = full_date[:7] if full_date else None
                if not month_year:
                    continue
                
                # นับจำนวนดาว
                rating = len([img for img in star_div.find_all('img', class_='star') 
                           if img.get('src') == "//img.lazcdn.com/g/tps/tfs/TB19ZvEgfDH8KJjy1XcXXcpdXXa-64-64.png"])
                
                reviews_data.append({
                    "text": raw_text,
                    "date": full_date,
                    "month_year": month_year,
                    "rating": rating
                })

            # เช็คว่ามีรีวิวในเดือนที่ต้องการหรือไม่
            current_page_has_target_month = False
            
            for review_data in reviews_data:
                month_year = review_data["month_year"]
                
                # เช็คว่าอยู่ในช่วงวันที่ที่ต้องการหรือไม่
                if start_period <= month_year <= end_period:
                    # เก็บรีวิวที่อยู่ในช่วงเดือนที่ต้องการ
                    all_reviews.append({
                        "ratings": review_data["rating"],
                        "text": review_data["text"],
                        "date": review_data["date"]
                    })
                    found_target_month = True
                    current_page_has_target_month = True
                    reviews_found_on_page = True
                elif month_year < start_period:
                    # เจอเดือนที่เก่ากว่าเดือนเริ่มต้น แสดงว่าเราผ่านช่วงวันที่ที่ต้องการไปแล้ว
                    past_target_period = True
            
            # เช็คว่าหน้านี้มีรีวิวในเดือนที่ต้องการหรือไม่
            if current_page_has_target_month:
                print(f"✅ พบรีวิวในช่วงเดือนที่ต้องการบนหน้านี้")
            else:
                print(f"⚠️ ไม่พบรีวิวในช่วงเดือนที่ต้องการบนหน้านี้")
            
            # หยุดถ้าเราเจอช่วงเวลาที่เก่ากว่าที่ต้องการและเคยเจอรีวิวในช่วงที่ต้องการมาแล้ว
            if past_target_period and found_target_month:
                print("✅ พบรีวิวที่ต้องการครบแล้วและผ่านช่วงเวลาที่ต้องการ")
                break
            
            # ถ้าเจอวันที่เก่ากว่าช่วงที่ต้องการแต่ยังไม่เคยเจอรีวิวในช่วงที่ต้องการเลย
            # ให้ทำการค้นหาต่อไปอีกสักหน้า (อาจจะมีรีวิวที่ไม่เรียงตามวันที่)
            if past_target_period and not found_target_month and page_count < 3:
                print("⚠️ ยังไม่พบรีวิวในช่วงที่ต้องการแต่เจอวันที่เก่ากว่าแล้ว ลองค้นหาต่ออีกหน้า")
                
            # ถ้าไม่พบรีวิวในหน้านี้เลย
            if not reviews_found_on_page:
                print("⚠️ ไม่พบรีวิวใหม่บนหน้านี้")
                
                # ถ้าเราผ่านช่วงเวลาที่ต้องการและไม่มีรีวิวใหม่ ให้หยุด
                if past_target_period:
                    print("🛑 ไม่พบรีวิวเพิ่มเติมและผ่านช่วงเวลาที่ต้องการแล้ว")
                    break

            # คลิกไปหน้าถัดไป
            if not click_next_button():
                print("🛑 ไม่มีปุ่ม Next แล้วหรือคลิกไม่ได้")
                break
                
        except Exception as e:
            print(f"❌ เกิดข้อผิดพลาดในการดึงข้อมูลจากหน้า {page_count}: {e}")
            break

    # ปิด driver
    try:
        driver.quit()
    except:
        pass

    print(f"📊 จำนวนรีวิวที่เก็บได้ทั้งหมด: {len(all_reviews)}")

    # สร้าง DataFrame จากรีวิวที่เก็บได้
    df = pd.DataFrame(all_reviews)
    
    # ตรวจสอบว่า DataFrame มีข้อมูลหรือไม่
    if df.empty:
        print("❌ ไม่พบข้อมูลรีวิว")
        # สร้าง DataFrame ว่างที่มีคอลัมน์ที่จำเป็น
        return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])

    # ตรวจสอบว่ามีคอลัมน์ 'text' หรือไม่
    if 'text' not in df.columns:
        print("❌ ไม่พบคอลัมน์ 'text' ในข้อมูล")
        print("คอลัมน์ที่มี:", df.columns.tolist())
        # สร้าง DataFrame ที่มีคอลัมน์ที่จำเป็น
        return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])

    try:
        VOCAB = set(thai_words())

        def clean_tokenize(text):
            text = emoji.replace_emoji(text, '').replace('\n', ' ').replace('\r', ' ') #ลบ emoji และการขึ้นบรรทัดใหม่
            text = re.sub(r'(.)\1{3,}', r'\1\1', text)  # ตัดอักษรซ้ำเกิน 2 ตัว
            text = re.sub(r'[^\u0E00-\u0E7Fa-zA-Z0-9\s:]', '', text)  # ลบอักขระพิเศษ
            seen = set()
            text = " ".join([w for w in text.split() if not (w in seen or seen.add(w))])  # ลบกลุ่มคำซ้ำในคอมเมนต์
            tokens = word_tokenize(text, engine="newmm", keep_whitespace=True) #tokenize
            return [w for w in tokens if w in VOCAB or w.isnumeric()] #กรองคำ

        def safe_clean(text):
            try:
                # ตรวจสอบว่าเป็นสตริงและทำความสะอาด
                if isinstance(text, str):
                    return clean_tokenize(text)
                else:
                    return None  # กรณีที่ไม่ใช่สตริง
            except Exception as e:
                print(f"Error processing row: {e}")  # สามารถแสดงข้อผิดพลาดได้
                return None  # ข้ามไปทำงานต่อ
            
        if 'text' in df.columns:
            df["text_tokens"] = df["text"].apply(safe_clean)  # เก็บ tokens แยก
            df = df[~df['text_tokens'].isin(['[]', '', None])]  # กรอง rows ที่ไม่มี tokens
            # แปลง tokens กลับเป็น string เพื่อใช้กับ CountVectorizer
            df["text_processed"] = df["text_tokens"].apply(lambda x: ' '.join(x) if x else '')
        else:
            print("Error: 'text' column does not exist in the DataFrame.")
            return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการทำความสะอาดข้อมูล: {e}")
        return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])

    # โหลดโมเดลและทำนาย
    models_loaded = True
    model_files = ['cvec.pkl', 'le_sentiment.pkl', 'xgb_sentiment.pkl', 'le_category.pkl', 'xgb_category.pkl']
    
    # ตรวจสอบว่าไฟล์โมเดลมีอยู่ทั้งหมดหรือไม่
    for model_file in model_files:
        if not os.path.exists(model_file):
            print(f"❌ ไม่พบไฟล์โมเดล: {model_file}")
            models_loaded = False
    
    if not models_loaded:
        print("❌ ไม่สามารถโหลดโมเดลได้เนื่องจากไม่พบไฟล์")
        return df[['ratings', 'text', 'date']]  # ส่งคืน DataFrame โดยไม่มีคอลัมน์การทำนาย
        
    try:
        print("🔄 กำลังโหลดโมเดล...")
        cvec = joblib.load('cvec.pkl')
        le_sentiment = joblib.load('le_sentiment.pkl')
        le_category = joblib.load('le_category.pkl')
        
        xgb_sentiment = XGBClassifier()
        xgb_sentiment.load_model('xgb_sentiment.json')
        xgb_category = XGBClassifier()
        xgb_category.load_model('xgb_category.json')

        print("✅ โหลดเสร็จแล้ว")

        # ตรวจสอบข้อมูลก่อนทำ vectorize
        print(f"📊 จำนวนข้อมูลที่จะทำนาย: {len(df)}")
        
        if len(df) == 0:
            print("❌ ไม่มีข้อมูลสำหรับการทำนาย")
            return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])
            
        # ใช้คอลัมน์ที่ถูกต้องสำหรับการทำ vectorize
        feature_column = 'text'
        if 'text_processed' in df.columns:
            feature_column = 'text_processed'
            
        print(f"🔄 ใช้คอลัมน์ '{feature_column}' สำหรับ vectorize")
            
        # ทดสอบทำ vectorize กับข้อมูลตัวอย่าง
        try:
            sample_size = min(5, len(df))
            print(f"🔍 ทดสอบทำ vectorize กับข้อมูล {sample_size} แถรกแรก")
            sample_data = df[feature_column][:sample_size].fillna('')
            X_sample = cvec.transform(sample_data)
            print(f"✅ ทดสอบสำเร็จ: Vector shape: {X_sample.shape}")
        except Exception as e:
            print(f"❌ การทดสอบ vectorize ล้มเหลว: {e}")
            print("🔄 ลองใช้คอลัมน์ 'text' แทน")
            feature_column = 'text'
            sample_data = df[feature_column][:sample_size].fillna('')
            X_sample = cvec.transform(sample_data)

        # ทำนายประเภทอารมณ์และหมวดหมู่ของความคิดเห็น
        print("🔄 กำลังทำนาย...")
        X = cvec.transform(df[feature_column].fillna(''))
        
        # ทำนายประเภทอารมณ์ 
        sentiment_pred = xgb_sentiment.predict(X)
        df['sentimentType'] = le_sentiment.inverse_transform(sentiment_pred)
        
        # ทำนายหมวดหมู่ของความคิดเห็น
        category_pred = xgb_category.predict(X)
        df['commentCategoryName'] = le_category.inverse_transform(category_pred)
        
        print("✅ ทำนายเสร็จสิ้น")
        
        # เลือกคอลัมน์ที่ต้องการส่งออก
        result_df = df[['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName']]

        print("📊 ข้อมูลที่ส่งคืน:")
        print(result_df) 
        return result_df
        
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการทำนาย: {e}")
        # ส่งคืน DataFrame โดยไม่มีคอลัมน์การทำนาย
        if 'ratings' in df.columns and 'text' in df.columns and 'date' in df.columns:
            return df[['ratings', 'text', 'date']]
        else:
            # ในกรณีที่คอลัมน์ไม่ครบ
            return pd.DataFrame(columns=['ratings', 'text', 'date', 'sentimentType', 'commentCategoryName'])
        
if __name__ == "__main__":
    link_url = "https://www.lazada.co.th/products/3-i5432338284-s23195260672.html?pvid=95e452bf-d588-4c34-bec7-f84bf9de8bdc&search=jfy&scm=1007.45039.432958.0&priceCompare=skuId%3A23195260672%3Bsource%3Atpp-recommend-plugin-32104%3Bsn%3A95e452bf-d588-4c34-bec7-f84bf9de8bdc%3BoriginPrice%3A5900%3BdisplayPrice%3A5900%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1746879709497&spm=a2o4m.homepage.just4u.d_5432338284" 
    start_period = "2025-5"
    end_period = "2025-05"
    result = analyze(link_url, start_period, end_period)
    print(result)