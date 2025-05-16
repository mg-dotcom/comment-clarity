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
from datasets import Dataset
from sklearn.preprocessing import LabelEncoder
import emoji
from pythainlp.tokenize import word_tokenize
from pythainlp.corpus import thai_words
from sklearn.feature_extraction.text import CountVectorizer
from imblearn.over_sampling import SMOTE
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from sklearn.model_selection import StratifiedKFold
from xgboost import XGBClassifier
import joblib


service = Service(executable_path=r"C:\chromedriver\chromedriver.exe")

def analyze(link_url, start_date=None, end_date=None):    
    def open_driver():
        options = Options()
        #options.add_argument(r"--user-data-dir=C:\Users\Thanb\AppData\Local\Google\Chrome\User Data")
        #options.add_argument("--profile-directory=Default")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option("useAutomationExtension", False)
        #options.add_argument("--headless")  # ไม่แสดงหน้าต่างเบราว์เซอร์
        options.add_argument("--no-sandbox")
        driver = webdriver.Chrome(service=Service(), options=options)
        return driver

    # Initialize all_reviews list to store review data
    all_reviews = []

    url = link_url

    # Use start_date and end_date if provided, otherwise use default values
    start_period = start_date if start_date else "2025-5"
    end_period = end_date if end_date else "2025-05"

    # แปลง start_period เป็น datetime แล้วลบ 1 เดือน
    start_dt = datetime.strptime(start_period, "%Y-%m")
    stop_dt = start_dt - relativedelta(months=1)

    # แปลงกลับเป็น string ในรูปแบบ YYYY-MM
    stop_period = stop_dt.strftime("%Y-%m")
    
    # XPath selectors for buttons
    sort_button_xpath = "/html/body/div[5]/div/div[10]/div[1]/div[2]/div/div/div/div[2]/div/div[2]" #ปุ่มเรียงลำดับ
    newest_first_option_xpath = "/html/body/div[9]/div/div/ul/li[2]" #ปุ่มเรียงจากล่าสุด
    
    # ฟังก์ชันเลื่อนหน้า (fix lazy loading)
    def scroll_to_bottom(driver):
        while True:
            driver.execute_script("window.scrollBy(0, 1000);")
            time.sleep(1)
            new_height = driver.execute_script("return window.scrollY + window.innerHeight")
            page_height = driver.execute_script("return document.body.scrollHeight")
            if new_height >= page_height:
                break

    #click element
    def click_element(driver, xpath):
        element = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, xpath)))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
        driver.execute_script("arguments[0].click();", element)
        time.sleep(1)

    # เริ่มต้นเบราว์เซอร์
    driver = open_driver()
    driver.get(url)
    time.sleep(3)
    scroll_to_bottom(driver)  # Scroll เพื่อให้ element โหลด

    while True:
        try:
            # รอให้ปุ่ม Sort ปรากฏ
            WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.XPATH, sort_button_xpath)))
            print("✅ เจอปุ่ม Sort")
            break  # ออกจาก loop ถ้าเจอปุ่ม Sort
        except:
            print("❌ ไม่เจอปุ่ม Sort — รีสตาร์ท Chrome")
            driver.quit()  # ปิด driver
            driver = open_driver()  # เปิด driver ใหม่
            driver.get(url)
            time.sleep(3)
            scroll_to_bottom(driver)

    click_element(driver, sort_button_xpath)
    click_element(driver, newest_first_option_xpath)

    thai_months = {"ม.ค.": "01", "ก.พ.": "02", "มี.ค.": "03", "เม.ย.": "04", "พ.ค.": "05", "มิ.ย.": "06", "ก.ค.": "07", "ส.ค.": "08", "ก.ย.": "09", "ต.ค.": "10", "พ.ย.": "11", "ธ.ค.": "12"}

    def to_full_date(text):
        now = datetime.now()
        if "ชั่วโมง" in text:
            dt = now - timedelta(hours=int(re.search(r'\d+', text).group()))
        elif "วัน" in text:
            dt = now - timedelta(days=int(re.search(r'\d+', text).group()))
        elif "สัปดาห์" in text:
            dt = now - timedelta(weeks=int(re.search(r'\d+', text).group()))
        elif "นาที" in text:
            dt = now - timedelta(minutes=int(re.search(r'\d+', text).group()))
        elif "วินาที" in text:
            dt = now - timedelta(seconds=int(re.search(r'\d+', text).group()))
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


    def click_next_button():
        try:
            next_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, "/html/body/div[5]/div/div[10]/div[1]/div[2]/div/div/div/div[3]/div[2]/div/button[2]"))
            )
            driver.execute_script("arguments[0].click();", next_button)
            time.sleep(2)
            return True
        except:
            return False

    collect = False

    while True:
        soup = BeautifulSoup(driver.page_source, "html.parser")
        date_spans = soup.find_all("span", class_="title right")

        if not date_spans:
            print("❌ ไม่พบข้อมูลวันที่")
            break

        stop = False

        for span in date_spans:
            raw_date = span.get_text(strip=True)
            full_date = to_full_date(raw_date)
            month_year = full_date[:7] if full_date else None

            if month_year is None:
                continue

            # ✅ ยังไม่เริ่มเก็บ → รอจนเจอ <= end_period ก่อน
            if not collect:
                if month_year <= end_period:
                    collect = True
                    print(f"✅ เริ่มเก็บข้อมูลที่: {month_year}")

            # ✅ เริ่มเก็บแล้ว
            if collect:
                if month_year <= stop_period:
                    stop = True
                    print(f"✅ เจอเดือนที่น้อยกว่าช่วงเริ่มต้น: {month_year} <= {stop_period}")
                    break
                else:
                    # หารีวิวจาก 'item-content'
                    content_divs = [
                        content
                        for item in soup.find_all('div', class_='item-content')
                        if item.get('class') == ['item-content']
                        for content in item.find_all('div', class_='content')
                    ]
                    reviews = [div.get_text(strip=True) for div in content_divs]

                    # หาจำนวนดาวจาก 'container-star starCtn left'
                    star_divs = soup.find_all('div', class_='container-star starCtn left')
                    star_ratings = [
                        len([img for img in div.find_all('img', class_='star') if img.get('src') == "//img.lazcdn.com/g/tps/tfs/TB19ZvEgfDH8KJjy1XcXXcpdXXa-64-64.png"])
                        for div in star_divs
                    ]

                    # เก็บข้อมูลรีวิวพร้อมจำนวนดาว
                    for review, rating in zip(reviews, star_ratings):
                        all_reviews.append({"ratings": rating, "text": review, "date": full_date})
                        print(f"📝 บันทึกรีวิว: {rating} ดาว | วันที่: {full_date} | ข้อความ: {review[:50]}...")

        if stop:
            print("✅ หยุดดึง: เจอเดือนก่อนช่วงเริ่มต้นแล้ว")
            break

        if not click_next_button():
            print("🛑 ไม่มีปุ่ม Next แล้ว")
            break

    driver.quit()  # ปิด driver เมื่อเสร็จสิ้น
    
    # สร้าง DataFrame จากข้อมูลที่เก็บ
    df = pd.DataFrame(all_reviews)
    
    # แสดงสรุปข้อมูล
    if not df.empty:
        print(f"\n✅ สรุปข้อมูลที่ได้: {len(df)} รีวิว")
        print("\nตัวอย่างข้อมูล:")
        print(df.head())
        
        # แสดงการแจกแจงของคะแนนดาว
        ratings_count = df['ratings'].value_counts().sort_index()
        print("\nการแจกแจงคะแนนดาว:")
        for stars, count in ratings_count.items():
            print(f"{stars} ดาว: {count} รีวิว")
    else:
        print("❌ ไม่พบข้อมูลรีวิว")

    return df

            
if __name__ == "__main__":
    link_url = "https://www.lazada.co.th/products/3-i5432338284-s23195260672.html?pvid=95e452bf-d588-4c34-bec7-f84bf9de8bdc&search=jfy&scm=1007.45039.432958.0&priceCompare=skuId%3A23195260672%3Bsource%3Atpp-recommend-plugin-32104%3Bsn%3A95e452bf-d588-4c34-bec7-f84bf9de8bdc%3BoriginPrice%3A5900%3BdisplayPrice%3A5900%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1746879709497&spm=a2o4m.homepage.just4u.d_5432338284" 
    start_period = "2025-5"
    end_period = "2025-05"
    
    print("🔍 เริ่มดึงข้อมูลรีวิวจาก Lazada...")
    print(f"🔗 URL: {link_url}")
    print(f"📅 ช่วงเวลา: {start_period} ถึง {end_period}")
    
    result = analyze(link_url, start_period, end_period)
    
    print("\n✅ เสร็จสิ้นการดึงข้อมูล")