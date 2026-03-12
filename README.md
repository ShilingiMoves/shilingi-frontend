# Shilingi Moves

Modern, conversion-focused homepage for Shilingi Moves - a Kenya-focused personal finance platform.

## Features

- ✅ React 18 + Vite
- ✅ Tailwind CSS with custom green brand color (#10B981)
- ✅ React Router for navigation
- ✅ 4 main sections + footer on homepage
- ✅ Fully responsive (mobile-first design)
- ✅ Lucide React icons
- ✅ Clean, concise copy

## Project Structure

```
src/
├── components/
│   ├── Button.jsx           # Reusable button component
│   ├── Navbar.jsx           # Navigation bar with mobile menu
│   ├── Hero.jsx             # Hero section with dashboard preview
│   ├── DashboardPreview.jsx # Mock dashboard UI
│   ├── FeatureGrid.jsx      # 6 feature cards
│   ├── Steps.jsx            # 3-step how it works
│   ├── TrustAndCTA.jsx      # Trust badges + metrics + final CTA
│   ├── Footer.jsx           # Footer with links
│   └── WhatsAppButton.jsx   # Floating WhatsApp button
├── pages/
│   ├── Home.jsx             # Main homepage
│   └── PlaceholderPages.jsx # Placeholder pages for all routes
├── App.jsx                  # React Router setup
├── main.jsx                 # Entry point
└── index.css                # Tailwind directives
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Pages & Routes

- `/` - Homepage (fully built)
- `/dashboard` - Dashboard (placeholder)
- `/learn` - Learn (placeholder)
- `/compare` - Compare (placeholder)
- `/tools` - Tools (placeholder)
- `/community` - Community (placeholder)
- `/trust` - Trust & Security (placeholder)
- `/signin` - Sign In (placeholder)
- `/signup` - Sign Up (placeholder)

## Design System

### Colors

- Primary Green: `#10B981` (Tailwind's `emerald-500`)
- Custom palette: `primary-50` through `primary-900`

### Typography

- Font family: Inter (from Google Fonts)

### Components

All components are mobile-responsive and follow consistent styling patterns.

## Next Steps

1. Install Node.js if not already installed
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Replace the "LOGO" placeholder with your actual logo image
5. Update WhatsApp number in `WhatsAppButton.jsx`
6. Replace placeholder images as needed
7. Build out placeholder pages with actual content

## License

© 2026 Shilingi Moves. All rights reserved.


## Deployment Note

- If Vercel is not picking up GitHub pushes, first confirm the Vercel project is connected to the correct GitHub repository and branch.
- This repo is intended to use the repo-local Git author `Shilingi Moves <devops@shilingimoves.com>` for deployment-related commits.
- Also verify that the email used for commits is recognized or verified on the GitHub account or org that owns the connected repository.

