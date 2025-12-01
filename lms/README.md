# LMS Frontend

Modern Learning Management System frontend built with React, Vite, and Tailwind CSS with a sci-fi themed UI.

## Features

- 🎨 Sci-fi themed UI with SAIBA-45 custom font
- 🔐 JWT-based authentication
- 📚 Course browsing and enrollment
- 📊 Progress tracking
- 👤 User profile management
- 👨‍💼 Admin panel for user and course management
- 📱 Fully responsive design

## Tech Stack

- React 19.2
- Vite 7.2
- Tailwind CSS 4.1
- Custom SAIBA-45 font
- Axios for API calls

## Installation

1. Navigate to frontend directory:
```bash
cd lms
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5174`

## Project Structure

```
lms/
├── public/
│   └── fonts/              # SAIBA-45 custom font
├── src/
│   ├── componets/          # React components
│   │   ├── common/         # Header, Sidebar, Footer
│   │   ├── courses/        # Course components
│   │   └── dashboard/      # Dashboard components
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Courses.jsx
│   │   ├── Profile.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminUsers.jsx
│   │   └── AdminCourses.jsx
│   ├── services/           # API services
│   │   └── api.js
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── index.css           # Global styles with sci-fi theme
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## Theme

The application uses a sci-fi themed design with:
- SAIBA-45 custom font for headings and buttons
- Dark color scheme (#1A1A1A background)
- Neon accents (Green: #8CCC00, Blue: #3F8BFF)
- Futuristic button styles and hover effects

## Login Credentials

Default credentials (after backend seeding):

**Admin:**
- Email: admin@lms.com
- Password: Admin@123

**Student:**
- Email: john@lms.com
- Password: Student@123

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory, ready to deploy to any static hosting service.

## License

MIT License
