import pyodbc

server = "nestexchange.database.windows.net"
database = "nestExchange"
username = "nestadmin"
password = "Nestexchange25"
driver = "{ODBC Driver 18 for SQL Server}"

connection_string = (
    f"DRIVER={driver};SERVER={server};DATABASE={database};"
    f"UID={username};PWD={password}"
)

try:
    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()
    cursor.execute("SELECT 1")
    print("Database connection successful!")
except Exception as e:
    print(f"Database connection failed: {e}")
