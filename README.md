# CompoSense

CompoSense is a web application that visualizes real-time sensor data from an Arduino Uno R4, providing actionable insights through interactive graphs. The sensors integrated into this project include:

- **Soil Moisture Sensor**
- **Temperature & Humidity Sensor (DHT11)**
- **Gas Sensor**

The application displays live and historical sensor data, helping users monitor environmental conditions effectively.

---

## 🌐 Live Demo

CompoSense is hosted on Vercel!  
**Take a look at it in action:**  
[https://compo-sense.vercel.app/](https://compo-sense.vercel.app/)

---

## 🚀 Tech Stack

- **Frontend:**  
  - [React](https://react.dev/) (with [Vite](https://vitejs.dev/))  
  - Hot Module Replacement (HMR)
  - ESLint rules for code quality

- **Official Plugins:**
  - [`@vitejs/plugin-react`](https://github.com/vitejs/vite/tree/main/packages/plugin-react) (uses Babel for Fast Refresh)
  - [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react-swc) (uses SWC for Fast Refresh)

- **Backend:**  
  - [Supabase](https://supabase.com/) (for data storage and API)

- **Hardware:**  
  - Arduino Uno R4 with sensor modules

---

## 📦 Features

- Real-time data acquisition from Arduino sensors
- Data visualization using responsive graphs
- Insights and historical trends for each sensor
- Minimal, fast, and modern React + Vite setup

---

## 🛠️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thenamakop/CompoSense.git
   cd CompoSense
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Configure Supabase:**
   - Add your Supabase project credentials to `.env` as needed.

5. **Connect Arduino sensors:**
   - Ensure your Arduino Uno R4 is flashed with the correct firmware and connected to the expected sensors.
   - Data should be sent from Arduino to your backend (Supabase or a relay server).

---

## 🧑‍💻 Development Notes

- This template is a minimal setup for React in Vite with HMR and ESLint.
- For production applications, it is recommended to use TypeScript with advanced linting. See the [Vite TS Template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for more details.
- You can expand ESLint rules and integrate TypeScript as your project grows.

---

## 📊 Data Flow

1. **Arduino Uno R4** collects sensor data.
2. Data is sent to the **Supabase backend**.
3. The React frontend fetches and visualizes this data with graphs and insights.

---

## 🤝 Contributions

Contributions, feature requests, and feedback are welcome! Please open an issue or a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🌱**
