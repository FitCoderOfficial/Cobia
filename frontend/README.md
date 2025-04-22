# Cobia Frontend

This is the frontend application for Cobia, a cryptocurrency analysis and alert service. Built with Next.js, TypeScript, and Tailwind CSS.

## Project Structure

```
cobia-frontend/
├── app/                    # App router pages and layouts
├── components/            # Reusable UI components
│   ├── common/           # Shared components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Utility functions and shared logic
│   ├── api/             # API client and endpoints
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Helper functions
├── styles/              # Global styles and Tailwind config
├── types/               # TypeScript type definitions
└── public/             # Static assets
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality
- App Router for routing
- Responsive design
- Dark mode support

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT
