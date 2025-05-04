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

options = Options()
#options.add_argument(r"--user-data-dir=C:\Users\Thanb\AppData\Local\Google\Chrome\User Data")
#options.add_argument("--profile-directory=Default")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)
#options.add_argument("--headless")  # ไม่แสดงหน้าต่างเบราว์เซอร์
#options.add_argument("--disable-gpu")  # ปิด GPU acceleration
#options.add_argument('user-agent=Your_User_Agent') 
options.add_argument("--no-sandbox")

service = Service(executable_path=r"C:\Users\Thanb\Desktop\study\FinalProject\chromedriver.exe")
driver = webdriver.Chrome(service=service, options=options) #เข้าถึง chromedriver บนเครื่อง