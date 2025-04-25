# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh



# BACKEND PYTHON

This template will provide an easy set-up explination on how to get the backend up and functioning.

 - With the backend you will need to install Python version 3.13 at the minimum (https://www.python.org/downloads/release/python-3130/)
 - Once python is installed on your device you'll need to install VS Code "Blue" (https://code.visualstudio.com/)
 - Once inside of VS Code, youll need to navigate to the extensions tab on the left side, inside of that install Python and MSSQL
 - Once downloaded you should be able to pull the project from the Github to run the backend.
 - Inside the backend youll need to install a couple of things, to do this on the top of your screen there should be a terminal button, click terminal - new terminal
 - # 1. Clone the project (if needed)
git clone https://github.com/TheNestExchange.git
cd your-project-folder

# 2. Create & activate a virtual environment
python -m venv venv

venv\Scripts\Activate   # (Windows)
# OR
source venv/bin/activate   # (Mac/Linux)

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the FastAPI server
uvicorn main:app  --reload

