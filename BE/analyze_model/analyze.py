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

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)


url = "https://www.lazada.co.th/products/2-i4323919151-s17227452649.html?pvid=be9ce7f2-ec10-4a75-8951-1b98f8b1cd09&search=jfy&scm=1007.45039.432958.0&priceCompare=skuId%3A17227452649%3Bsource%3Atpp-recommend-plugin-32104%3Bsn%3Abe9ce7f2-ec10-4a75-8951-1b98f8b1cd09%3BoriginPrice%3A4738%3BdisplayPrice%3A4738%3BsinglePromotionId%3A900000046564679%3BsingleToolCode%3ApromPrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1745650695521&spm=a2o4m.homepage.just4u.d_4323919151" #รับ url ในอนาคต
driver.get(url)
